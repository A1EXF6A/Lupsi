import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { SupabaseService } from '../supabase/supabase.service';
import { EcuadorianIdValidatorService } from '../iam/services/ecuadorian-id-validator.service';
import { BadRequestException } from '@nestjs/common';

const mockSupabaseClient = {
  auth: {
    admin: {
      createUser: jest.fn(),
      deleteUser: jest.fn(),
    },
    signInWithPassword: jest.fn(),
  },
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  single: jest.fn().mockResolvedValue({ data: { role: 'PATIENT' } }),
  insert: jest.fn().mockResolvedValue({ error: null }),
};

const mockSupabaseService = {
  getClient: jest.fn(() => mockSupabaseClient),
};

const mockIdValidator = {
  validate: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: SupabaseService, useValue: mockSupabaseService },
        { provide: EcuadorianIdValidatorService, useValue: mockIdValidator },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should throw BadRequestException if DNI is invalid', async () => {
      mockIdValidator.validate.mockReturnValue(false); // Simula el fallo del Módulo 10

      const dto = {
        email: 'test@email.com',
        password: 'password123',
        dni: '1234567890', // DNI inválido
        first_name: 'Juan',
        last_name: 'Perez',
      };

      await expect(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        service.register(dto as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should complete registration if everything is valid', async () => {
      mockIdValidator.validate.mockReturnValue(true); // Simula éxito Módulo 10
      mockSupabaseClient.auth.admin.createUser.mockResolvedValue({
        data: { user: { id: 'uuid-123' } },
        error: null,
      });
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: {
          session: { access_token: 'fake-token' },
          user: { id: 'uuid-123' },
        },
        error: null,
      });

      const dto = {
        email: 'juan@email.com',
        password: 'password123',
        dni: '1700000006', // Cédula válida ficticia
        first_name: 'Juan',
        last_name: 'Perez',
      };

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const result = await service.register(dto as any);

      expect(result).toBeDefined();
      expect(result.message).toContain('exitoso');
      expect(mockSupabaseClient.auth.admin.createUser).toHaveBeenCalled();
    });
  });
});
