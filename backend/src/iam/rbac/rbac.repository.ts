import { Injectable } from '@nestjs/common';
import { UserRole } from '../enums/user-role.enum';
import { Permission } from '../enums/permission.enum';

@Injectable()
export class RbacRepository {
  private readonly rolePermissions: Readonly<
    Record<UserRole, ReadonlyArray<Permission>>
  > = {
    [UserRole.PATIENT]: [
      Permission.APPOINTMENTS_CREATE,
      Permission.APPOINTMENTS_READ_SELF,
      Permission.APPOINTMENTS_UPDATE,
      Permission.APPOINTMENTS_DELETE,
    ],
    [UserRole.DOCTOR]: [
      Permission.APPOINTMENTS_READ_ASSIGNED,
      Permission.APPOINTMENTS_UPDATE,
    ],
    [UserRole.RECEPTIONIST]: [
      Permission.APPOINTMENTS_READ_ALL,
      Permission.APPOINTMENTS_UPDATE,
      Permission.APPOINTMENTS_DELETE,
    ],
    [UserRole.ADMIN]: [
      Permission.APPOINTMENTS_READ_ALL,
      Permission.APPOINTMENTS_UPDATE,
      Permission.APPOINTMENTS_DELETE,
    ],
  };

  hasPermission(role: UserRole, permission: Permission): boolean {
    const permissions = this.rolePermissions[role] ?? [];
    return permissions.includes(permission);
  }

  getPermissionsByRole(role: UserRole): ReadonlyArray<Permission> {
    return this.rolePermissions[role] ?? [];
  }
}
