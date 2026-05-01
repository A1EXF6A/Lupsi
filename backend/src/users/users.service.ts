import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { UpdateUserDto } from './dto/user.dto';

type UserProfile = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
};

type PatientProfile = {
  id: string;
  dni: string;
  phone: string | null;
  date_of_birth: string | null;
};

@Injectable()
export class UsersService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async findAll() {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, first_name, last_name, role, created_at')
      .order('created_at', { ascending: false })
      .returns<UserProfile[]>();

    if (error) {
      throw new InternalServerErrorException(
        `Error fetching users: ${error.message}`,
      );
    }

    return data || [];
  }

  async update(id: string, dto: UpdateUserDto) {
    const supabase = this.supabaseService.getClient();
    const updates: Partial<UserProfile> & { updated_at: string } = {
      updated_at: new Date().toISOString(),
    };

    if (dto.email !== undefined) {
      updates.email = dto.email;
    }
    if (dto.first_name !== undefined) {
      updates.first_name = dto.first_name;
    }
    if (dto.last_name !== undefined) {
      updates.last_name = dto.last_name;
    }
    if (dto.role !== undefined) {
      updates.role = dto.role;
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select('id, email, first_name, last_name, role')
      .single<UserProfile>();

    if (error) {
      throw new InternalServerErrorException(
        `Error updating user profile: ${error.message}`,
      );
    }

    if (dto.phone !== undefined || dto.date_of_birth !== undefined) {
      const patientUpdates: Partial<PatientProfile> = {};
      if (dto.phone !== undefined) {
        patientUpdates.phone = dto.phone;
      }
      if (dto.date_of_birth !== undefined) {
        patientUpdates.date_of_birth = dto.date_of_birth;
      }

      const { error: patientError } = await supabase
        .from('patients')
        .update(patientUpdates)
        .eq('id', id);

      if (patientError) {
        throw new InternalServerErrorException(
          `Error updating patient data: ${patientError.message}`,
        );
      }
    }

    return data;
  }
}
