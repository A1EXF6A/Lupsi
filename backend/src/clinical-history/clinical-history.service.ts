import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import {
  MedicalRecord,
} from '../database/interfaces/database.interfaces';
import {
  CreateClinicalHistoryDto,
  UpdateClinicalHistoryDto,
} from './dto/clinical-history.dto';

@Injectable()
export class ClinicalHistoryService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async findByPatient(patientId: string): Promise<MedicalRecord[]> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('medical_records')
      .select('id, patient_id, doctor_id, appointment_id, document_url, diagnosis, is_deleted')
      .eq('patient_id', patientId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .returns<MedicalRecord[]>();

    if (error) {
      throw new InternalServerErrorException(
        `Error fetching clinical history: ${error.message}`,
      );
    }

    return data || [];
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
          document_url: dto.document_url,
          diagnosis: dto.diagnosis ?? null,
        },
      ])
      .select('id, patient_id, doctor_id, appointment_id, document_url, diagnosis, is_deleted')
      .single<MedicalRecord>();

    if (error) {
      throw new InternalServerErrorException(
        `Error creating clinical history: ${error.message}`,
      );
    }

    return data;
  }

  async update(id: string, dto: UpdateClinicalHistoryDto): Promise<MedicalRecord> {
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
      .select('id, patient_id, doctor_id, appointment_id, document_url, diagnosis, is_deleted')
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
