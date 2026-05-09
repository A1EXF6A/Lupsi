import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import {
  MedicalRecord,
  Patient,
  Doctor,
  Profile,
} from '../database/interfaces/database.interfaces';
import {
  CreateClinicalHistoryDto,
  UpdateClinicalHistoryDto,
} from './dto/clinical-history.dto';

@Injectable()
export class ClinicalHistoryService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async findByFilters(filters?: {
    patientId?: string;
    doctorId?: string;
    appointmentId?: string;
  }): Promise<MedicalRecord[]> {
    const supabase = this.supabaseService.getClient();
    let query = supabase
      .from('medical_records')
      .select(
        'id, patient_id, doctor_id, appointment_id, document_url, diagnosis, is_deleted, created_at',
      )
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });

    if (filters?.patientId) {
      query = query.eq('patient_id', filters.patientId);
    }
    if (filters?.doctorId) {
      query = query.eq('doctor_id', filters.doctorId);
    }
    if (filters?.appointmentId) {
      query = query.eq('appointment_id', filters.appointmentId);
    }

    const { data, error } = await query.returns<MedicalRecord[]>();

    if (error) {
      throw new InternalServerErrorException(
        `Error fetching clinical history: ${error.message}`,
      );
    }

    if (!data || data.length === 0) return [];

    const patientIds = [...new Set(data.map((r) => r.patient_id))];
    const doctorIds = [...new Set(data.map((r) => r.doctor_id))];

    const { data: patientsData } = await supabase
      .from('patients')
      .select('id, dni')
      .in('id', patientIds)
      .returns<Patient[]>();
    const { data: doctorsData } = await supabase
      .from('doctors')
      .select('id, specialty')
      .in('id', doctorIds)
      .returns<Doctor[]>();
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('id, first_name, last_name')
      .in('id', [...patientIds, ...doctorIds])
      .returns<Profile[]>();

    return data.map((record) => {
      const pProfile = profilesData?.find(
        (p: Profile) => p.id === record.patient_id,
      );
      const patient = patientsData?.find(
        (p: Patient) => p.id === record.patient_id,
      );

      const dProfile = profilesData?.find(
        (p: Profile) => p.id === record.doctor_id,
      );
      const doctor = doctorsData?.find((d: Doctor) => d.id === record.doctor_id);

      return {
        ...record,
        patients: {
          id: record.patient_id,
          first_name: pProfile?.first_name || '',
          last_name: pProfile?.last_name || '',
          dni: patient?.dni || '',
        },
        doctors: {
          id: record.doctor_id,
          specialty: doctor?.specialty || '',
          profiles: {
            first_name: dProfile?.first_name || '',
            last_name: dProfile?.last_name || '',
          },
        },
      } as MedicalRecord;
    });
  }

  async create(dto: CreateClinicalHistoryDto): Promise<MedicalRecord> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('medical_records')
      .insert([
        {
          patient_id: dto.patient_id,
          doctor_id: dto.doctor_id,
          appointment_id: dto.appointment_id ?? null,
          document_url: dto.document_url ?? '-',
          diagnosis: dto.diagnosis ?? null,
        },
      ])
      .select(
        'id, patient_id, doctor_id, appointment_id, document_url, diagnosis, is_deleted',
      )
      .single<MedicalRecord>();

    if (error) {
      throw new InternalServerErrorException(
        `Error creating clinical history: ${error.message}`,
      );
    }

    return data;
  }

  async findByPatient(patientId?: string): Promise<MedicalRecord[]> {
    return this.findByFilters({ patientId });
  }

  async update(
    id: string,
    dto: UpdateClinicalHistoryDto,
  ): Promise<MedicalRecord> {
    const supabase = this.supabaseService.getClient();
    const updates: Partial<MedicalRecord> & { updated_at: string } = {
      updated_at: new Date().toISOString(),
    };

    if (dto.patient_id !== undefined) {
      updates.patient_id = dto.patient_id;
    }
    if (dto.doctor_id !== undefined) {
      updates.doctor_id = dto.doctor_id;
    }
    if (dto.appointment_id !== undefined) {
      updates.appointment_id = dto.appointment_id;
    }
    if (dto.document_url !== undefined) {
      updates.document_url = dto.document_url;
    }
    if (dto.diagnosis !== undefined) {
      updates.diagnosis = dto.diagnosis;
    }

    const { data, error } = await supabase
      .from('medical_records')
      .update(updates)
      .eq('id', id)
      .eq('is_deleted', false)
      .select(
        'id, patient_id, doctor_id, appointment_id, document_url, diagnosis, is_deleted',
      )
      .single<MedicalRecord>();

    if (error) {
      throw new InternalServerErrorException(
        `Error updating clinical history: ${error.message}`,
      );
    }

    return data;
  }

  async remove(id: string): Promise<void> {
    const supabase = this.supabaseService.getClient();
    const { error } = await supabase
      .from('medical_records')
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      throw new InternalServerErrorException(
        `Error deleting clinical history: ${error.message}`,
      );
    }
  }
}
