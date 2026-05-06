import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { UpdateUserDto } from './dto/user.dto';
import { CreateDoctorDto } from './dto/create-doctor.dto';

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

  async findOne(id: string) {
    console.log('[UsersService] findOne calling Supabase for ID:', id);
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, first_name, last_name, role, created_at')
      .eq('id', id)
      .single<UserProfile>();

    if (error) {
      console.error('[UsersService] findOne error:', error.message);
      throw new InternalServerErrorException(
        `Error fetching user profile: ${error.message}`,
      );
    }

    console.log('[UsersService] findOne success for:', data?.email);
    return data;
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

  async remove(id: string) {
    const supabase = this.supabaseService.getClient();
    // Delete from Supabase Auth (this should cascade to profiles, doctors, patients if configured)
    // If not cascading, we should manually delete from profiles, etc.
    // Auth deletion requires service role key (admin) which our SupabaseService has.
    const { error } = await supabase.auth.admin.deleteUser(id);
    if (error) {
      throw new InternalServerErrorException(
        `Error deleting user: ${error.message}`,
      );
    }
    return { message: 'Usuario eliminado' };
  }

  async createDoctor(dto: CreateDoctorDto) {
    const supabase = this.supabaseService.getClient();

    // 1. Create user in Auth
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email: dto.email,
        password: dto.password,
        email_confirm: true,
      });

    if (authError) {
      throw new InternalServerErrorException(
        `Error creating user auth: ${authError.message}`,
      );
    }

    const userId = authData.user.id;

    // 2. Create Profile
    const { error: profileError } = await supabase.from('profiles').insert([
      {
        id: userId,
        role: 'DOCTOR',
        email: dto.email,
        first_name: dto.first_name,
        last_name: dto.last_name,
      },
    ] as unknown as any);

    if (profileError) {
      await supabase.auth.admin.deleteUser(userId);
      throw new InternalServerErrorException(
        `Error creating profile: ${profileError.message}`,
      );
    }

    // 3. Create Doctor record
    const { error: doctorError } = await supabase.from('doctors').insert([
      {
        id: userId,
        specialty: dto.specialty || 'General',
      },
    ] as unknown as any);

    if (doctorError) {
      await supabase.auth.admin.deleteUser(userId);
      throw new InternalServerErrorException(
        `Error creating doctor: ${doctorError.message}`,
      );
    }

    return { message: 'Doctor creado exitosamente', id: userId };
  }
}
