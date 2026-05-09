import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import {
  ClinicalAttention,
  Patient,
  Doctor,
  Profile,
} from '../database/interfaces/database.interfaces';
import {
  CreateClinicalAttentionDto,
  UpdateClinicalAttentionDto,
} from './dto/clinical-attention.dto';

@Injectable()
export class ClinicalAttentionsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async findAll(filters?: {
    patientId?: string;
    doctorId?: string;
    appointmentId?: string;
  }): Promise<ClinicalAttention[]> {
    const supabase = this.supabaseService.getClient();
    let query = supabase
      .from('clinical_attentions')
      .select(
        'id, appointment_id, patient_id, doctor_id, notes, vitals, diagnosis, treatment, is_deleted, created_at',
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

    const { data, error } = await query.returns<ClinicalAttention[]>();

    if (error) {
      throw new InternalServerErrorException(
        `Error fetching clinical attentions: ${error.message}`,
      );
    }

    if (!data || data.length === 0) return [];

    const patientIds = [...new Set(data.map((a) => a.patient_id))];
    const doctorIds = [...new Set(data.map((a) => a.doctor_id))];

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
      } as ClinicalAttention;
    });
  }

  async create(dto: CreateClinicalAttentionDto): Promise<ClinicalAttention> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('clinical_attentions')
      .insert([
        {
          appointment_id: dto.appointment_id,
          patient_id: dto.patient_id,
          doctor_id: dto.doctor_id,
          notes: dto.notes ?? null,
          vitals: dto.vitals ?? null,
          diagnosis: dto.diagnosis ?? null,
          treatment: dto.treatment ?? null,
        },
      ])
      .select(
        'id, appointment_id, patient_id, doctor_id, notes, vitals, diagnosis, treatment, is_deleted',
      )
      .single<ClinicalAttention>();

    if (error) {
      throw new InternalServerErrorException(
        `Error creating clinical attention: ${error.message}`,
      );
    }

    return data;
  }

  async update(
    id: string,
    dto: UpdateClinicalAttentionDto,
  ): Promise<ClinicalAttention> {
    const supabase = this.supabaseService.getClient();
    const updates: Partial<ClinicalAttention> & { updated_at: string } = {
      updated_at: new Date().toISOString(),
    };

    if (dto.appointment_id !== undefined) {
      updates.appointment_id = dto.appointment_id;
    }
    if (dto.patient_id !== undefined) {
      updates.patient_id = dto.patient_id;
    }
    if (dto.doctor_id !== undefined) {
      updates.doctor_id = dto.doctor_id;
    }
    if (dto.notes !== undefined) {
      updates.notes = dto.notes;
    }
    if (dto.vitals !== undefined) {
      updates.vitals = dto.vitals;
    }
    if (dto.diagnosis !== undefined) {
      updates.diagnosis = dto.diagnosis;
    }
    if (dto.treatment !== undefined) {
      updates.treatment = dto.treatment;
    }

    const { data, error } = await supabase
      .from('clinical_attentions')
      .update(updates)
      .eq('id', id)
      .eq('is_deleted', false)
      .select(
        'id, appointment_id, patient_id, doctor_id, notes, vitals, diagnosis, treatment, is_deleted',
      )
      .single<ClinicalAttention>();

    if (error) {
      throw new InternalServerErrorException(
        `Error updating clinical attention: ${error.message}`,
      );
    }

    return data;
  }

  async remove(id: string): Promise<void> {
    const supabase = this.supabaseService.getClient();
    const { error } = await supabase
      .from('clinical_attentions')
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      throw new InternalServerErrorException(
        `Error deleting clinical attention: ${error.message}`,
      );
    }
  }
}
