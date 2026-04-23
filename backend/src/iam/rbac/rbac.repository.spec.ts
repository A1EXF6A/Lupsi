import { RbacRepository } from './rbac.repository';
import { UserRole } from '../enums/user-role.enum';
import { Permission } from '../enums/permission.enum';

describe('RbacRepository', () => {
  let repository: RbacRepository;

  beforeEach(() => {
    repository = new RbacRepository();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  it('should allow patient permissions for own appointments', () => {
    expect(
      repository.hasPermission(UserRole.PATIENT, Permission.APPOINTMENTS_CREATE),
    ).toBe(true);
    expect(
      repository.hasPermission(
        UserRole.PATIENT,
        Permission.APPOINTMENTS_READ_SELF,
      ),
    ).toBe(true);
  });

  it('should deny patient access to read all appointments', () => {
    expect(
      repository.hasPermission(UserRole.PATIENT, Permission.APPOINTMENTS_READ_ALL),
    ).toBe(false);
  });

  it('should return configured permissions for admin role', () => {
    const permissions = repository.getPermissionsByRole(UserRole.ADMIN);

    expect(permissions).toContain(Permission.APPOINTMENTS_READ_ALL);
  });
});
