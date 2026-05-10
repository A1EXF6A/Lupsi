import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

const mockUsersService = {
  findAll: jest.fn().mockResolvedValue([]),
  update: jest.fn().mockResolvedValue({ id: '1' }),
  createDoctor: jest.fn().mockResolvedValue({ id: '1' }),
  createReceptionist: jest.fn().mockResolvedValue({ id: '1' }),
};

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockUsersService }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('gets users', async () => {
    await controller.findAll();
    expect(mockUsersService.findAll).toHaveBeenCalled();
  });

  it('updates user', async () => {
    const dto = { first_name: 'Juan' };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await controller.update('user-1', dto as any);
    expect(mockUsersService.update).toHaveBeenCalledWith('user-1', dto);
  });

  it('creates receptionist', async () => {
    const dto = {
      email: 'recep@example.com',
      password: 'Secret123',
      first_name: 'Ana',
      last_name: 'Perez',
    };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await controller.createReceptionist(dto as any);
    expect(mockUsersService.createReceptionist).toHaveBeenCalledWith(dto);
  });
});
