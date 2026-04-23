import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'temporary-secret-for-build',
    });
  }

  /**
   * Valida el payload del JWT. 
   * Supabase incluye el role en app_metadata o user_metadata.
   */
  validate(payload: any) {
    // El payload de Supabase suele tener 'sub' (ID del usuario) y roles en metadatos.
    // Dependiendo de la configuración, el rol puede estar en profiles.
    return { 
      userId: payload.sub, 
      email: payload.email,
      role: payload.app_metadata?.role || 'PATIENT' // Valor por defecto
    };
  }
}
