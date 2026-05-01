import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import {
  Doctor,
  Profile,
  DoctorWithProfile,
  Specialty,
  AppointmentType,
  Office,
} from '../database/interfaces/database.interfaces';
import {
  CreateAppointmentTypeDto,
  CreateOfficeDto,
  CreateSpecialtyDto,
  UpdateAppointmentTypeDto,
  UpdateOfficeDto,
  UpdateSpecialtyDto,
} from './dto/catalog.dto';

@Injectable()
export class CatalogsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getSpecialties(): Promise<Specialty[]> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('specialties')
      .select('id, name, description, is_deleted')
      .eq('is_deleted', false)
      .order('name', { ascending: true })
      .returns<Specialty[]>();

    if (error) {
      throw new InternalServerErrorException(
        `Error fetching specialties: ${error.message}`,
      );
    }

    return data || [];
  }

  async getAppointmentTypes(): Promise<AppointmentType[]> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('appointment_types')
      .select('id, name, description, duration_minutes, is_deleted')
      .eq('is_deleted', false)
      .order('name', { ascending: true })
      .returns<AppointmentType[]>();

    if (error) {
      throw new InternalServerErrorException(
        `Error fetching appointment types: ${error.message}`,
      );
    }

    return data || [];
  }

  async getOffices(): Promise<Office[]> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('offices')
      .select('id, name, floor, description, is_deleted')
      .eq('is_deleted', false)
      .order('name', { ascending: true })
      .returns<Office[]>();

    if (error) {
      throw new InternalServerErrorException(
        `Error fetching offices: ${error.message}`,
      );
    }

    return data || [];
  }

  async createSpecialty(dto: CreateSpecialtyDto): Promise<Specialty> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('specialties')
      .insert([
        {
          name: dto.name,
          description: dto.description ?? null,
        },
      ])
      .select('id, name, description, is_deleted')
      .single<Specialty>();

    if (error) {
      throw new InternalServerErrorException(
        `Error creating specialty: ${error.message}`,
      );
    }

    return data;
  }

  async updateSpecialty(
    id: string,
    dto: UpdateSpecialtyDto,
  ): Promise<Specialty> {
    const supabase = this.supabaseService.getClient();
    const updates: Partial<Specialty> & { updated_at: string } = {
      updated_at: new Date().toISOString(),
    };

    if (dto.name !== undefined) {
      updates.name = dto.name;
    }
    if (dto.description !== undefined) {
      updates.description = dto.description;
    }

    const { data, error } = await supabase
      .from('specialties')
      .update(updates)
      .eq('id', id)
      .eq('is_deleted', false)
      .select('id, name, description, is_deleted')
      .single<Specialty>();

    if (error) {
      throw new InternalServerErrorException(
        `Error updating specialty: ${error.message}`,
      );
    }

    return data;
  }

  async deleteSpecialty(id: string): Promise<void> {
    const supabase = this.supabaseService.getClient();
    const { error } = await supabase
      .from('specialties')
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      throw new InternalServerErrorException(
        `Error deleting specialty: ${error.message}`,
      );
    }
  }

  async createAppointmentType(
    dto: CreateAppointmentTypeDto,
  ): Promise<AppointmentType> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('appointment_types')
      .insert([
        {
          name: dto.name,
          description: dto.description ?? null,
          duration_minutes: dto.duration_minutes,
        },
      ])
      .select('id, name, description, duration_minutes, is_deleted')
      .single<AppointmentType>();

    if (error) {
      throw new InternalServerErrorException(
        `Error creating appointment type: ${error.message}`,
      );
    }

    return data;
  }

  async updateAppointmentType(
    id: string,
    dto: UpdateAppointmentTypeDto,
  ): Promise<AppointmentType> {
    const supabase = this.supabaseService.getClient();
    const updates: Partial<AppointmentType> & { updated_at: string } = {
      updated_at: new Date().toISOString(),
    };

    if (dto.name !== undefined) {
      updates.name = dto.name;
    }
    if (dto.description !== undefined) {
      updates.description = dto.description;
    }
    if (dto.duration_minutes !== undefined) {
      updates.duration_minutes = dto.duration_minutes;
    }

    const { data, error } = await supabase
      .from('appointment_types')
      .update(updates)
      .eq('id', id)
      .eq('is_deleted', false)
      .select('id, name, description, duration_minutes, is_deleted')
      .single<AppointmentType>();

    if (error) {
      throw new InternalServerErrorException(
        `Error updating appointment type: ${error.message}`,
      );
    }

    return data;
  }

  async deleteAppointmentType(id: string): Promise<void> {
    const supabase = this.supabaseService.getClient();
    const { error } = await supabase
      .from('appointment_types')
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      throw new InternalServerErrorException(
        `Error deleting appointment type: ${error.message}`,
      );
    }
  }

  async createOffice(dto: CreateOfficeDto): Promise<Office> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('offices')
      .insert([
        {
          name: dto.name,
          floor: dto.floor ?? null,
          description: dto.description ?? null,
        },
      ])
      .select('id, name, floor, description, is_deleted')
      .single<Office>();

    if (error) {
      throw new InternalServerErrorException(
        `Error creating office: ${error.message}`,
      );
    }

    return data;
  }

  async updateOffice(id: string, dto: UpdateOfficeDto): Promise<Office> {
    const supabase = this.supabaseService.getClient();
    const updates: Partial<Office> & { updated_at: string } = {
      updated_at: new Date().toISOString(),
    };

    if (dto.name !== undefined) {
      updates.name = dto.name;
    }
    if (dto.floor !== undefined) {
      updates.floor = dto.floor;
    }
    if (dto.description !== undefined) {
      updates.description = dto.description;
    }

    const { data, error } = await supabase
      .from('offices')
      .update(updates)
      .eq('id', id)
      .eq('is_deleted', false)
      .select('id, name, floor, description, is_deleted')
      .single<Office>();

    if (error) {
      throw new InternalServerErrorException(
        `Error updating office: ${error.message}`,
      );
    }

    return data;
  }

  async deleteOffice(id: string): Promise<void> {
    const supabase = this.supabaseService.getClient();
    const { error } = await supabase
      .from('offices')
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      throw new InternalServerErrorException(
        `Error deleting office: ${error.message}`,
      );
    }
  }

  async getDoctors(): Promise<DoctorWithProfile[]> {
    const supabase = this.supabaseService.getClient();
    console.log('[CatalogsService] Fetching doctors...');

    // 1. Fetch doctors without the relationship to avoid PostgREST RLS planning bugs
    const { data: doctorsData, error: dError } = await supabase
      .from('doctors')
      .select('id, specialty, is_deleted')
      .eq('is_deleted', false)
      .returns<Doctor[]>();
    if (dError) {
      console.error(
        '[CatalogsService] Error fetching doctorsData:',
        dError.message,
      );
      throw new Error(dError.message);
    }

    console.log(
      `[CatalogsService] Found ${doctorsData?.length || 0} doctors in DB.`,
    );

    if (!doctorsData || doctorsData.length === 0) return [];

    // 2. Fetch profiles directly
    const doctorIds = doctorsData.map((d: Doctor) => d.id);
    console.log('[CatalogsService] Fetching profiles for IDs:', doctorIds);
    const { data: profilesData, error: pError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name')
      .in('id', doctorIds)
      .returns<Profile[]>();

    if (pError) {
      console.error(
        '[CatalogsService] Error fetching profilesData:',
        pError.message,
      );
      throw new Error(pError.message);
    }

    console.log(
      `[CatalogsService] Found ${profilesData?.length || 0} profiles matching.`,
    );

    // 3. Merge them
    const merged = doctorsData.map((d: Doctor) => {
      const profile = profilesData?.find((p: Profile) => p.id === d.id);
      return {
        id: d.id,
        specialty: d.specialty,
        profiles: {
          first_name: profile?.first_name || 'Desconocido',
          last_name: profile?.last_name || '',
        },
      };
    });

    return merged;
  }
}
