import { Test, TestingModule } from '@nestjs/testing';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from '../iam/guards/jwt-auth.guard';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';

const mockAppointmentsService = {
  create: jest.fn().mockResolvedValue({ id: '1' }),
  findAll: jest.fn().mockResolvedValue([]),
  getAvailableSlots: jest.fn().mockResolvedValue([]),
  createAvailableSlot: jest.fn().mockResolvedValue({ id: '1' }),
  updateAvailableSlot: jest.fn().mockResolvedValue({ id: '1' }),
  deleteAvailableSlot: jest.fn().mockResolvedValue(undefined),
  updateAppointment: jest.fn().mockResolvedValue({ id: '1' }),
  deleteAppointment: jest.fn().mockResolvedValue(undefined),
};

describe('AppointmentsController', () => {
  let controller: AppointmentsController;

  beforeEach(async () => {
    const moduleBuilder = Test.createTestingModule({
      controllers: [AppointmentsController],
      providers: [
        {
          provide: AppointmentsService,
          useValue: mockAppointmentsService,
        },
        {
          provide: APP_GUARD,
          useValue: { canActivate: () => true },
        },
      ],
    });

    const module: TestingModule = await moduleBuilder
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AppointmentsController>(AppointmentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('creates appointment', async () => {
    const dto = { doctor_id: 'doc-1', appointment_time: '2026-05-01T10:00:00Z' };
    const req = { user: { id: 'patient-1', role: 'PATIENT' } };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await controller.create(req as any, dto as any);
    expect(mockAppointmentsService.create).toHaveBeenCalledWith('patient-1', dto);
  });

  it('gets appointments', async () => {
    const req = { user: { id: 'patient-1', role: 'PATIENT' } };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await controller.findAll(req as any, '2026-05-01');
    expect(mockAppointmentsService.findAll).toHaveBeenCalledWith(
      'patient-1',
      'PATIENT',
      '2026-05-01',
    );
  });

  it('creates available slot', async () => {
    await controller.createAvailableSlot('doc-1', '2026-05-01T10:00:00Z', '2026-05-01T10:30:00Z');
    expect(mockAppointmentsService.createAvailableSlot).toHaveBeenCalledWith(
      'doc-1',
      '2026-05-01T10:00:00Z',
      '2026-05-01T10:30:00Z',
    );
  });

  it('updates available slot', async () => {
    await controller.updateAvailableSlot('slot-1', '2026-05-01T11:00:00Z', '2026-05-01T11:30:00Z');
    expect(mockAppointmentsService.updateAvailableSlot).toHaveBeenCalledWith(
      'slot-1',
      '2026-05-01T11:00:00Z',
      '2026-05-01T11:30:00Z',
    );
  });

  it('deletes available slot', async () => {
    await controller.deleteAvailableSlot('slot-1');
    expect(mockAppointmentsService.deleteAvailableSlot).toHaveBeenCalledWith('slot-1');
  });

  it('updates appointment', async () => {
    const dto = { status: 'COMPLETED' };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await controller.updateAppointment('appt-1', dto as any);
    expect(mockAppointmentsService.updateAppointment).toHaveBeenCalledWith(
      'appt-1',
      dto,
    );
  });

  it('deletes appointment', async () => {
    await controller.deleteAppointment('appt-1');
    expect(mockAppointmentsService.deleteAppointment).toHaveBeenCalledWith('appt-1');
  });
});
