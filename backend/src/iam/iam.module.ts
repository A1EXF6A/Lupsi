import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { EcuadorianIdValidatorService } from './services/ecuadorian-id-validator.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({}),
  ],
  providers: [
    EcuadorianIdValidatorService,
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard, // Protección por defecto en toda la APP
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard, // Validador de roles global
    },
  ],
  exports: [EcuadorianIdValidatorService, PassportModule, JwtModule],
})
export class IamModule {}
