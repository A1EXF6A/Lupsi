import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { ClinicalAttention } from '../database/interfaces/database.interfaces';
import {
  CreateClinicalAttentionDto,
  UpdateClinicalAttentionDto,
} from './dto/clinical-attention.dto';

@Injectable()
export class ClinicalAttentionsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async findByPatient(patientId: string): Promise<ClinicalAttention[]> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('clinical_attentions')
      .select(
        'id, appointment_id, patient_id, doctor_id, notes, vitals, diagnosis, treatment, is_deleted',
      )
      .eq('patient_id', patientId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .returns<ClinicalAttention[]>();

    if (error) {
      throw new InternalServerErrorException(
        `Error fetching clinical attentions: ${error.message}`,
      );
    }

    return data || [];
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
