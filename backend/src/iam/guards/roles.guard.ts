import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../enums/user-role.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { ActiveUser } from '../interfaces/active-user.interface';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles) {
      return true;
    }
    const request = context.switchToHttp().getRequest<{ user?: ActiveUser }>();
    const user = request.user;

    if (!user) {
      return false;
    }

    // El rol viene del payload del JWT (JwtStrategy) o de la inyección en JwtAuthGuard
    return requiredRoles.some(
      (role) => (user.role as unknown as UserRole) === role,
    );
  }
}
