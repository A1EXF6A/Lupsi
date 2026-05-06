import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

const mockAuthService = {
  register: jest.fn().mockResolvedValue({ message: 'Registro exitoso' }),
  login: jest.fn().mockResolvedValue({ message: 'Autenticación exitosa' }),
  changePassword: jest
    .fn()
    .mockResolvedValue({ message: 'Contraseña actualizada con éxito.' }),
  requestPasswordRecovery: jest.fn().mockResolvedValue({
    message: 'Se envió un correo para recuperar la contraseña.',
  }),
};

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should call authService.register', async () => {
      const dto = {
        email: 'test@email.com',
        password: 'password123',
        dni: '1234567890',
        first_name: 'Juan',
        last_name: 'Perez',
      };

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const result = await controller.register(dto as any);

      expect(result.message).toBeDefined();
      expect(mockAuthService.register).toHaveBeenCalledWith(dto);
    });
  });

  describe('changePassword', () => {
    it('should call authService.changePassword', async () => {
      const body = {
        current_password: 'old',
        new_password: 'new',
        access_token: 'token',
      };

      const result = await controller.changePassword(
        body.current_password,
        body.new_password,
        body.access_token,
      );

      expect(result.message).toBeDefined();
      expect(mockAuthService.changePassword).toHaveBeenCalledWith(
        body.access_token,
        body.current_password,
        body.new_password,
      );
    });
  });

  describe('requestPasswordRecovery', () => {
    it('should call authService.requestPasswordRecovery', async () => {
      const email = 'test@email.com';

      const result = await controller.requestPasswordRecovery(email);

      expect(result.message).toBeDefined();
      expect(mockAuthService.requestPasswordRecovery).toHaveBeenCalledWith(
        email,
      );
    });
  });
});
