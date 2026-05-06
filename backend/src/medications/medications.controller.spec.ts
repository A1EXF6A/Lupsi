import { Test, TestingModule } from '@nestjs/testing';
import { MedicationsController } from './medications.controller';
import { MedicationsService } from './medications.service';

const mockMedicationsService = {
  findAll: jest.fn().mockResolvedValue([]),
  create: jest.fn().mockResolvedValue({ id: '1' }),
  update: jest.fn().mockResolvedValue({ id: '1' }),
  remove: jest.fn().mockResolvedValue(undefined),
};

describe('MedicationsController', () => {
  let controller: MedicationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MedicationsController],
      providers: [
        { provide: MedicationsService, useValue: mockMedicationsService },
      ],
    }).compile();

    controller = module.get<MedicationsController>(MedicationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('lists medications', async () => {
    await controller.findAll();
    expect(mockMedicationsService.findAll).toHaveBeenCalled();
  });

  it('creates medication', async () => {
    const dto = { name: 'Paracetamol' };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await controller.create(dto as any);
    expect(mockMedicationsService.create).toHaveBeenCalledWith(dto);
  });

  it('updates medication', async () => {
    const dto = { description: 'Updated' };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await controller.update('med-1', dto as any);
    expect(mockMedicationsService.update).toHaveBeenCalledWith('med-1', dto);
  });

  it('removes medication', async () => {
    await controller.remove('med-1');
    expect(mockMedicationsService.remove).toHaveBeenCalledWith('med-1');
  });
});
