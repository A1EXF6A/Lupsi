import { Test, TestingModule } from '@nestjs/testing';
import { ClinicalHistoryController } from './clinical-history.controller';
import { ClinicalHistoryService } from './clinical-history.service';

const mockClinicalHistoryService = {
  findByFilters: jest.fn().mockResolvedValue([]),
  findByPatient: jest.fn().mockResolvedValue([]),
  create: jest.fn().mockResolvedValue({ id: '1' }),
  update: jest.fn().mockResolvedValue({ id: '1' }),
  remove: jest.fn().mockResolvedValue(undefined),
};

describe('ClinicalHistoryController', () => {
  let controller: ClinicalHistoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClinicalHistoryController],
      providers: [
        {
          provide: ClinicalHistoryService,
          useValue: mockClinicalHistoryService,
        },
      ],
    }).compile();

    controller = module.get<ClinicalHistoryController>(
      ClinicalHistoryController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('gets by patient id', async () => {
    await controller.getAll('patient-1');
    expect(mockClinicalHistoryService.findByFilters).toHaveBeenCalledWith({
      patientId: 'patient-1',
      doctorId: undefined,
      appointmentId: undefined,
    });
  });

  it('creates clinical history', async () => {
    const dto = {
      patient_id: 'patient-1',
      doctor_id: 'doctor-1',
      appointment_id: 'appointment-1',
      document_url: 'https://example.com/doc.pdf',
    };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await controller.create(dto as any);
    expect(mockClinicalHistoryService.create).toHaveBeenCalledWith(dto);
  });

  it('updates clinical history', async () => {
    const dto = { diagnosis: 'Ok' };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await controller.update('record-1', dto as any);
    expect(mockClinicalHistoryService.update).toHaveBeenCalledWith(
      'record-1',
      dto,
    );
  });

  it('removes clinical history', async () => {
    await controller.remove('record-1');
    expect(mockClinicalHistoryService.remove).toHaveBeenCalledWith('record-1');
  });
});
