import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { Permission } from '../enums/permission.enum';
import { UserRole } from '../enums/user-role.enum';
import { RbacRepository } from '../rbac/rbac.repository';

type RequestUser = {
  role?: UserRole;
};

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly rbacRepository: RbacRepository,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user?: RequestUser }>();
    const userRole = request.user?.role;

    if (!userRole) {
      throw new UnauthorizedException(
        'No se pudo determinar el rol del usuario.',
      );
    }

    const hasAtLeastOnePermission = requiredPermissions.some((permission) =>
      this.rbacRepository.hasPermission(userRole, permission),
    );

    if (!hasAtLeastOnePermission) {
      throw new ForbiddenException(
        'No tiene permisos para ejecutar esta acción.',
      );
    }

    return true;
  }
}
