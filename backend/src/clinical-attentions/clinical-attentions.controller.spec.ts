import { Test, TestingModule } from '@nestjs/testing';
import { ClinicalAttentionsController } from './clinical-attentions.controller';
import { ClinicalAttentionsService } from './clinical-attentions.service';

const mockClinicalAttentionsService = {
  findByPatient: jest.fn().mockResolvedValue([]),
  create: jest.fn().mockResolvedValue({ id: '1' }),
  update: jest.fn().mockResolvedValue({ id: '1' }),
  remove: jest.fn().mockResolvedValue(undefined),
};

describe('ClinicalAttentionsController', () => {
  let controller: ClinicalAttentionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClinicalAttentionsController],
      providers: [
        {
          provide: ClinicalAttentionsService,
          useValue: mockClinicalAttentionsService,
        },
      ],
    }).compile();

    controller = module.get<ClinicalAttentionsController>(
      ClinicalAttentionsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('gets by patient id', async () => {
    await controller.getByPatient('patient-1');
    expect(mockClinicalAttentionsService.findByPatient).toHaveBeenCalledWith(
      'patient-1',
    );
  });

  it('creates clinical attention', async () => {
    const dto = {
      appointment_id: 'appointment-1',
      patient_id: 'patient-1',
      doctor_id: 'doctor-1',
    };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await controller.create(dto as any);
    expect(mockClinicalAttentionsService.create).toHaveBeenCalledWith(dto);
  });

  it('updates clinical attention', async () => {
    const dto = { diagnosis: 'Ok' };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await controller.update('att-1', dto as any);
    expect(mockClinicalAttentionsService.update).toHaveBeenCalledWith(
      'att-1',
      dto,
    );
  });

  it('removes clinical attention', async () => {
    await controller.remove('att-1');
    expect(mockClinicalAttentionsService.remove).toHaveBeenCalledWith('att-1');
  });
});
