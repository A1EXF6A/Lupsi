import { Test, TestingModule } from '@nestjs/testing';
import { ClinicalAttentionsService } from './clinical-attentions.service';
import { SupabaseService } from '../supabase/supabase.service';

type QueryResult<T> = { data: T | null; error: { message: string } | null };

const createQueryMock = <T,>(result: QueryResult<T>) => {
  const query: any = {};
  query.select = jest.fn(() => query);
  query.eq = jest.fn(() => query);
  query.in = jest.fn(() => query);
  query.order = jest.fn(() => query);
  query.returns = jest.fn(async () => result);
  return query;
};

const createInsertMock = <T,>(result: QueryResult<T>) => {
  const query: any = {};
  query.insert = jest.fn(() => query);
  query.select = jest.fn(() => query);
  query.single = jest.fn(async () => result);
  return query;
};

describe('ClinicalAttentionsService', () => {
  let service: ClinicalAttentionsService;
  let supabaseService: SupabaseService;
  let fromMock: jest.Mock;
  let queryMap: Record<string, any>;

  beforeEach(async () => {
    queryMap = {};
    fromMock = jest.fn((table: string) => queryMap[table]);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClinicalAttentionsService,
        {
          provide: SupabaseService,
          useValue: {
            getClient: () => ({ from: fromMock }),
          },
        },
      ],
    }).compile();

    service = module.get(ClinicalAttentionsService);
    supabaseService = module.get(SupabaseService);
  });

  it('returns empty list when no records found', async () => {
    queryMap.clinical_attentions = createQueryMock({ data: [], error: null });

    const result = await service.findAll({ patientId: 'p1' });

    expect(result).toEqual([]);
    expect(fromMock).toHaveBeenCalledWith('clinical_attentions');
  });

  it('maps patient and doctor details', async () => {
    queryMap.clinical_attentions = createQueryMock({
      data: [
        {
          id: 'att-1',
          appointment_id: 'appt-1',
          patient_id: 'pat-1',
          doctor_id: 'doc-1',
          notes: null,
          vitals: null,
          diagnosis: 'Grip',
          treatment: 'Reposo',
          is_deleted: false,
          created_at: '2025-01-01T10:00:00Z',
        },
      ],
      error: null,
    });
    queryMap.patients = createQueryMock({
      data: [{ id: 'pat-1', dni: '0102030405' }],
      error: null,
    });
    queryMap.doctors = createQueryMock({
      data: [{ id: 'doc-1', specialty: 'Cardiologia' }],
      error: null,
    });
    queryMap.profiles = createQueryMock({
      data: [
        { id: 'pat-1', first_name: 'Ana', last_name: 'Lopez' },
        { id: 'doc-1', first_name: 'Luis', last_name: 'Perez' },
      ],
      error: null,
    });

    const result = await service.findAll({
      patientId: 'pat-1',
      doctorId: 'doc-1',
      appointmentId: 'appt-1',
    });

    expect(result).toHaveLength(1);
    expect(result[0].patients?.first_name).toBe('Ana');
    expect(result[0].patients?.dni).toBe('0102030405');
    expect(result[0].doctors?.specialty).toBe('Cardiologia');
    expect(result[0].doctors?.profiles?.last_name).toBe('Perez');

    const baseQuery = queryMap.clinical_attentions;
    expect(baseQuery.eq).toHaveBeenCalledWith('patient_id', 'pat-1');
    expect(baseQuery.eq).toHaveBeenCalledWith('doctor_id', 'doc-1');
    expect(baseQuery.eq).toHaveBeenCalledWith('appointment_id', 'appt-1');
  });

  it('creates a clinical attention with defaults', async () => {
    const insertQuery = createInsertMock({
      data: {
        id: 'att-2',
        appointment_id: 'appt-2',
        patient_id: 'pat-2',
        doctor_id: 'doc-2',
        notes: null,
        vitals: null,
        diagnosis: null,
        treatment: null,
        is_deleted: false,
      },
      error: null,
    });
    queryMap.clinical_attentions = insertQuery;

    await service.create({
      appointment_id: 'appt-2',
      patient_id: 'pat-2',
      doctor_id: 'doc-2',
    } as any);

    expect(insertQuery.insert).toHaveBeenCalledWith([
      {
        appointment_id: 'appt-2',
        patient_id: 'pat-2',
        doctor_id: 'doc-2',
        notes: null,
        vitals: null,
        diagnosis: null,
        treatment: null,
      },
    ]);
  });
});
