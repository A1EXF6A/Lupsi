import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { SupabaseService } from '../../supabase/supabase.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private reflector: Reflector,
    private readonly supabaseService: SupabaseService
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('No se encontró el token de seguridad.');
    }

    const token = authHeader.split(' ')[1];
    const supabase = this.supabaseService.getClient();

    // Validar el token directamente con Supabase para evitar errores de sincronización de secretos
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      console.error('[JwtAuthGuard] Token inválido o sesión expirada:', error?.message);
      throw new UnauthorizedException('Sesión inválida o expirada. Por favor, inicia sesión de nuevo.');
    }

    // Obtener el ROL real desde la tabla profiles (app_metadata puede estar vacío)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    // Inyectar el usuario en la request para uso posterior (ej. roles)
    request['user'] = {
      id: user.id,
      email: user.email,
      role: profile?.role || user.app_metadata?.role || 'PATIENT'
    };

    console.log(`[JwtAuthGuard] Usuario autenticado: ${user.email}, Rol: ${request['user'].role}`);

    return true;
  }
}
