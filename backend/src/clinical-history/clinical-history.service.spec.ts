import { Test, TestingModule } from '@nestjs/testing';
import { ClinicalHistoryService } from './clinical-history.service';
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

describe('ClinicalHistoryService', () => {
  let service: ClinicalHistoryService;
  let fromMock: jest.Mock;
  let queryMap: Record<string, any>;

  beforeEach(async () => {
    queryMap = {};
    fromMock = jest.fn((table: string) => queryMap[table]);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClinicalHistoryService,
        {
          provide: SupabaseService,
          useValue: {
            getClient: () => ({ from: fromMock }),
          },
        },
      ],
    }).compile();

    service = module.get(ClinicalHistoryService);
  });

  it('returns empty list when no records found', async () => {
    queryMap.medical_records = createQueryMock({ data: [], error: null });

    const result = await service.findByFilters({ patientId: 'pat-1' });

    expect(result).toEqual([]);
    expect(fromMock).toHaveBeenCalledWith('medical_records');
  });

  it('maps patient and doctor details', async () => {
    queryMap.medical_records = createQueryMock({
      data: [
        {
          id: 'mr-1',
          patient_id: 'pat-1',
          doctor_id: 'doc-1',
          appointment_id: 'appt-1',
          document_url: '-',
          diagnosis: 'Control',
          is_deleted: false,
          created_at: '2025-01-02T10:00:00Z',
        },
      ],
      error: null,
    });
    queryMap.patients = createQueryMock({
      data: [{ id: 'pat-1', dni: '0102030405' }],
      error: null,
    });
    queryMap.doctors = createQueryMock({
      data: [{ id: 'doc-1', specialty: 'Pediatria' }],
      error: null,
    });
    queryMap.profiles = createQueryMock({
      data: [
        { id: 'pat-1', first_name: 'Ana', last_name: 'Lopez' },
        { id: 'doc-1', first_name: 'Luis', last_name: 'Perez' },
      ],
      error: null,
    });

    const result = await service.findByFilters({
      patientId: 'pat-1',
      doctorId: 'doc-1',
      appointmentId: 'appt-1',
    });

    expect(result).toHaveLength(1);
    expect(result[0].patients?.first_name).toBe('Ana');
    expect(result[0].patients?.dni).toBe('0102030405');
    expect(result[0].doctors?.specialty).toBe('Pediatria');
    expect(result[0].doctors?.profiles?.last_name).toBe('Perez');

    const baseQuery = queryMap.medical_records;
    expect(baseQuery.eq).toHaveBeenCalledWith('patient_id', 'pat-1');
    expect(baseQuery.eq).toHaveBeenCalledWith('doctor_id', 'doc-1');
    expect(baseQuery.eq).toHaveBeenCalledWith('appointment_id', 'appt-1');
  });

  it('uses default document_url when missing', async () => {
    const insertQuery = createInsertMock({
      data: {
        id: 'mr-2',
        patient_id: 'pat-2',
        doctor_id: 'doc-2',
        appointment_id: 'appt-2',
        document_url: '-',
        diagnosis: null,
        is_deleted: false,
      },
      error: null,
    });
    queryMap.medical_records = insertQuery;

    await service.create({
      patient_id: 'pat-2',
      doctor_id: 'doc-2',
      appointment_id: 'appt-2',
      diagnosis: null,
    } as any);

    expect(insertQuery.insert).toHaveBeenCalledWith([
      {
        patient_id: 'pat-2',
        doctor_id: 'doc-2',
        appointment_id: 'appt-2',
        document_url: '-',
        diagnosis: null,
      },
    ]);
  });
});
