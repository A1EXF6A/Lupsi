import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { Medication } from '../database/interfaces/database.interfaces';
import {
  CreateMedicationDto,
  UpdateMedicationDto,
} from './dto/medication.dto';

@Injectable()
export class MedicationsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async findAll(): Promise<Medication[]> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('medications')
      .select('id, name, description, is_deleted')
      .eq('is_deleted', false)
      .order('name', { ascending: true })
      .returns<Medication[]>();

    if (error) {
      throw new InternalServerErrorException(
        `Error fetching medications: ${error.message}`,
      );
    }

    return data || [];
  }

  async create(dto: CreateMedicationDto): Promise<Medication> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('medications')
      .insert([
        {
          name: dto.name,
          description: dto.description ?? null,
        },
      ])
      .select('id, name, description, is_deleted')
      .single<Medication>();

    if (error) {
      throw new InternalServerErrorException(
        `Error creating medication: ${error.message}`,
      );
    }

    return data;
  }

  async update(id: string, dto: UpdateMedicationDto): Promise<Medication> {
    const supabase = this.supabaseService.getClient();
    const updates: Partial<Medication> & { updated_at: string } = {
      updated_at: new Date().toISOString(),
    };

    if (dto.name !== undefined) {
      updates.name = dto.name;
    }
    if (dto.description !== undefined) {
      updates.description = dto.description;
    }

    const { data, error } = await supabase
      .from('medications')
      .update(updates)
      .eq('id', id)
      .eq('is_deleted', false)
      .select('id, name, description, is_deleted')
      .single<Medication>();

    if (error) {
      throw new InternalServerErrorException(
        `Error updating medication: ${error.message}`,
      );
    }

    return data;
  }

  async remove(id: string): Promise<void> {
    const supabase = this.supabaseService.getClient();
    const { error } = await supabase
      .from('medications')
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      throw new InternalServerErrorException(
        `Error deleting medication: ${error.message}`,
      );
    }
  }
}
