import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ActiveUser } from '../interfaces/active-user.interface';

interface JwtPayload {
  sub: string;
  email: string;
  app_metadata?: {
    role?: string;
    [key: string]: any;
  };
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('JWT_SECRET') || 'temporary-secret-for-build',
    });
  }

  /**
   * Valida el payload del JWT.
   * Supabase incluye el role en app_metadata o user_metadata.
   */
  validate(payload: JwtPayload): ActiveUser {
    // El payload de Supabase suele tener 'sub' (ID del usuario) y roles en metadatos.
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.app_metadata?.role || 'PATIENT', // Valor por defecto
    };
  }
}
