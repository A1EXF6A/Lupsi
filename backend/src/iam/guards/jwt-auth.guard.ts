import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { SupabaseService } from '../../supabase/supabase.service';
import { ActiveUser } from '../interfaces/active-user.interface';
import { Profile } from '../../database/interfaces/database.interfaces';

interface RequestWithUser extends Request {
  user?: ActiveUser;
}

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private reflector: Reflector,
    private readonly supabaseService: SupabaseService,
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

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('No se encontró el token de seguridad.');
    }

    const token = authHeader.split(' ')[1];
    const supabase = this.supabaseService.getClient();

    // Validar el token directamente con Supabase para evitar errores de sincronización de secretos
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      console.error(
        '[JwtAuthGuard] Token inválido o sesión expirada:',
        error?.message,
      );
      throw new UnauthorizedException(
        'Sesión inválida o expirada. Por favor, inicia sesión de nuevo.',
      );
    }

    // Obtener el ROL real desde la tabla profiles (app_metadata puede estar vacío)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single<Profile>();

    const activeUser: ActiveUser = {
      id: user.id,
      email: user.email || '',
      role: profile?.role || (user.app_metadata?.role as string) || 'PATIENT',
    };

    // Inyectar el usuario en la request para uso posterior
    request.user = activeUser;

    console.log(
      `[JwtAuthGuard] Usuario autenticado: ${activeUser.email}, Rol: ${activeUser.role}`,
    );

    return true;
  }
}
