import { Test, TestingModule } from '@nestjs/testing';
import { CatalogsController } from './catalogs.controller';
import { CatalogsService } from './catalogs.service';

const mockCatalogsService = {
  getSpecialties: jest.fn().mockResolvedValue([]),
  createSpecialty: jest.fn().mockResolvedValue({ id: '1' }),
  updateSpecialty: jest.fn().mockResolvedValue({ id: '1' }),
  deleteSpecialty: jest.fn().mockResolvedValue(undefined),
  getAppointmentTypes: jest.fn().mockResolvedValue([]),
  createAppointmentType: jest.fn().mockResolvedValue({ id: '1' }),
  updateAppointmentType: jest.fn().mockResolvedValue({ id: '1' }),
  deleteAppointmentType: jest.fn().mockResolvedValue(undefined),
  getOffices: jest.fn().mockResolvedValue([]),
  createOffice: jest.fn().mockResolvedValue({ id: '1' }),
  updateOffice: jest.fn().mockResolvedValue({ id: '1' }),
  deleteOffice: jest.fn().mockResolvedValue(undefined),
  getDoctors: jest.fn().mockResolvedValue([]),
};

describe('CatalogsController', () => {
  let controller: CatalogsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CatalogsController],
      providers: [{ provide: CatalogsService, useValue: mockCatalogsService }],
    }).compile();

    controller = module.get<CatalogsController>(CatalogsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('creates specialty', async () => {
    const dto = { name: 'Cardiologia' };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await controller.createSpecialty(dto as any);
    expect(mockCatalogsService.createSpecialty).toHaveBeenCalledWith(dto);
  });

  it('updates specialty', async () => {
    const dto = { name: 'Neuro' };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await controller.updateSpecialty('id-1', dto as any);
    expect(mockCatalogsService.updateSpecialty).toHaveBeenCalledWith('id-1', dto);
  });

  it('deletes specialty', async () => {
    await controller.deleteSpecialty('id-1');
    expect(mockCatalogsService.deleteSpecialty).toHaveBeenCalledWith('id-1');
  });

  it('creates appointment type', async () => {
    const dto = { name: 'Consulta', duration_minutes: 15 };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await controller.createAppointmentTypes(dto as any);
    expect(mockCatalogsService.createAppointmentType).toHaveBeenCalledWith(dto);
  });

  it('updates appointment type', async () => {
    const dto = { description: 'Actualizado' };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await controller.updateAppointmentTypes('id-2', dto as any);
    expect(mockCatalogsService.updateAppointmentType).toHaveBeenCalledWith(
      'id-2',
      dto,
    );
  });

  it('deletes appointment type', async () => {
    await controller.deleteAppointmentTypes('id-2');
    expect(mockCatalogsService.deleteAppointmentType).toHaveBeenCalledWith('id-2');
  });

  it('creates office', async () => {
    const dto = { name: 'Consultorio 1' };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await controller.createOffice(dto as any);
    expect(mockCatalogsService.createOffice).toHaveBeenCalledWith(dto);
  });

  it('updates office', async () => {
    const dto = { floor: 'PB' };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await controller.updateOffice('id-3', dto as any);
    expect(mockCatalogsService.updateOffice).toHaveBeenCalledWith('id-3', dto);
  });

  it('deletes office', async () => {
    await controller.deleteOffice('id-3');
    expect(mockCatalogsService.deleteOffice).toHaveBeenCalledWith('id-3');
  });
});
