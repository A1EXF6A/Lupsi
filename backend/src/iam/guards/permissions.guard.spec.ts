import {
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionsGuard } from './permissions.guard';
import { RbacRepository } from '../rbac/rbac.repository';
import { Permission } from '../enums/permission.enum';
import { UserRole } from '../enums/user-role.enum';

describe('PermissionsGuard', () => {
  let guard: PermissionsGuard;
  let reflector: jest.Mocked<Reflector>;
  let rbacRepository: jest.Mocked<RbacRepository>;

  const createContext = (role?: UserRole): ExecutionContext => {
    const request = role ? { user: { role } } : { user: {} };

    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as unknown as ExecutionContext;
  };

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    } as unknown as jest.Mocked<Reflector>;

    rbacRepository = {
      hasPermission: jest.fn(),
      getPermissionsByRole: jest.fn(),
    } as unknown as jest.Mocked<RbacRepository>;

    guard = new PermissionsGuard(reflector, rbacRepository);
  });

  it('should allow request when route has no permissions metadata', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);

    const result = guard.canActivate(createContext(UserRole.PATIENT));

    expect(result).toBe(true);
  });

  it('should throw UnauthorizedException when user role is missing', () => {
    reflector.getAllAndOverride.mockReturnValue([
      Permission.APPOINTMENTS_CREATE,
    ]);

    expect(() => guard.canActivate(createContext())).toThrow(
      UnauthorizedException,
    );
  });

  it('should allow request when user has at least one required permission', () => {
    reflector.getAllAndOverride.mockReturnValue([
      Permission.APPOINTMENTS_READ_SELF,
      Permission.APPOINTMENTS_READ_ALL,
    ]);
    rbacRepository.hasPermission.mockImplementation(
      (_role, permission) => permission === Permission.APPOINTMENTS_READ_SELF,
    );

    const result = guard.canActivate(createContext(UserRole.PATIENT));

    expect(result).toBe(true);
  });

  it('should throw ForbiddenException when user has none of the required permissions', () => {
    reflector.getAllAndOverride.mockReturnValue([
      Permission.APPOINTMENTS_READ_ALL,
    ]);
    rbacRepository.hasPermission.mockReturnValue(false);

    expect(() => guard.canActivate(createContext(UserRole.PATIENT))).toThrow(
      ForbiddenException,
    );
  });
});
