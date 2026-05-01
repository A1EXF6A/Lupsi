import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { EcuadorianIdValidatorService } from './services/ecuadorian-id-validator.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { PermissionsGuard } from './guards/permissions.guard';
import { RbacRepository } from './rbac/rbac.repository';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({}),
    SupabaseModule,
  ],
  providers: [
    EcuadorianIdValidatorService,
    JwtStrategy,
    RbacRepository,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard, // Protección por defecto en toda la APP
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard, // Validador de roles global
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
  ],
  exports: [
    EcuadorianIdValidatorService,
    PassportModule,
    JwtModule,
    RbacRepository,
  ],
})
export class IamModule {}
