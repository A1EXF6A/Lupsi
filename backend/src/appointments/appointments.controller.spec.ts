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
  getReminders: jest.fn().mockResolvedValue([]),
  createReminder: jest.fn().mockResolvedValue({ id: '1' }),
  updateReminder: jest.fn().mockResolvedValue({ id: '1' }),
  deleteReminder: jest.fn().mockResolvedValue(undefined),
  getPrescription: jest.fn().mockResolvedValue(null),
  createPrescription: jest.fn().mockResolvedValue({ id: '1' }),
  updatePrescription: jest.fn().mockResolvedValue({ id: '1' }),
  deletePrescription: jest.fn().mockResolvedValue(undefined),
  getPayments: jest.fn().mockResolvedValue([]),
  createPayment: jest.fn().mockResolvedValue({ id: '1' }),
  updatePayment: jest.fn().mockResolvedValue({ id: '1' }),
  deletePayment: jest.fn().mockResolvedValue(undefined),
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

  it('gets reminders', async () => {
    await controller.getReminders('appt-1');
    expect(mockAppointmentsService.getReminders).toHaveBeenCalledWith('appt-1');
  });

  it('creates reminder', async () => {
    await controller.createReminder('appt-1', '2026-05-01T10:00:00Z', 'EMAIL', 'PENDING');
    expect(mockAppointmentsService.createReminder).toHaveBeenCalledWith(
      'appt-1',
      '2026-05-01T10:00:00Z',
      'EMAIL',
      'PENDING',
    );
  });

  it('updates reminder', async () => {
    await controller.updateReminder('rem-1', '2026-05-02T10:00:00Z', 'SMS', 'SENT');
    expect(mockAppointmentsService.updateReminder).toHaveBeenCalledWith(
      'rem-1',
      '2026-05-02T10:00:00Z',
      'SMS',
      'SENT',
    );
  });

  it('deletes reminder', async () => {
    await controller.deleteReminder('rem-1');
    expect(mockAppointmentsService.deleteReminder).toHaveBeenCalledWith('rem-1');
  });

  it('gets prescription', async () => {
    await controller.getPrescription('appt-1');
    expect(mockAppointmentsService.getPrescription).toHaveBeenCalledWith('appt-1');
  });

  it('creates prescription', async () => {
    const medications = [{ medication_id: 'med-1', dose: '1' }];
    await controller.createPrescription('appt-1', 'patient-1', 'doctor-1', 'Notas', medications);
    expect(mockAppointmentsService.createPrescription).toHaveBeenCalledWith(
      'appt-1',
      'patient-1',
      'doctor-1',
      'Notas',
      medications,
    );
  });

  it('updates prescription', async () => {
    const medications = [{ medication_id: 'med-2', dose: '2' }];
    await controller.updatePrescription('pres-1', 'Notas', medications);
    expect(mockAppointmentsService.updatePrescription).toHaveBeenCalledWith(
      'pres-1',
      'Notas',
      medications,
    );
  });

  it('deletes prescription', async () => {
    await controller.deletePrescription('pres-1');
    expect(mockAppointmentsService.deletePrescription).toHaveBeenCalledWith('pres-1');
  });

  it('gets payments', async () => {
    await controller.getPayments('appt-1');
    expect(mockAppointmentsService.getPayments).toHaveBeenCalledWith('appt-1');
  });

  it('creates payment', async () => {
    await controller.createPayment('appt-1', 25, 'CARD', 'PAID', '2026-05-01T10:00:00Z');
    expect(mockAppointmentsService.createPayment).toHaveBeenCalledWith(
      'appt-1',
      25,
      'CARD',
      'PAID',
      '2026-05-01T10:00:00Z',
    );
  });

  it('updates payment', async () => {
    await controller.updatePayment('pay-1', 30, 'CASH', 'PAID', '2026-05-01T11:00:00Z');
    expect(mockAppointmentsService.updatePayment).toHaveBeenCalledWith(
      'pay-1',
      30,
      'CASH',
      'PAID',
      '2026-05-01T11:00:00Z',
    );
  });

  it('deletes payment', async () => {
    await controller.deletePayment('pay-1');
    expect(mockAppointmentsService.deletePayment).toHaveBeenCalledWith('pay-1');
  });
});
