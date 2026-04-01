import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

const mockAuthService = {
  register: jest.fn().mockResolvedValue({ message: 'Registro exitoso' }),
  login: jest.fn().mockResolvedValue({ message: 'Autenticación exitosa' }),
};

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
      ],
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

      const result = await controller.register(dto as any);
      
      expect(result.message).toBeDefined();
      expect(mockAuthService.register).toHaveBeenCalledWith(dto);
    });
  });
});
