import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import {
  Doctor,
  Profile,
  DoctorWithProfile,
} from '../database/interfaces/database.interfaces';

@Injectable()
export class CatalogsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Obtener lista de especialidades médicas (Estandarizadas)
   */
  getSpecialties() {
    return [
      {
        id: 'GEN',
        name: 'Medicina General',
        description: 'Atención primaria y triaje.',
      },
      {
        id: 'PED',
        name: 'Pediatría',
        description: 'Atención especializada para niños.',
      },
      {
        id: 'GIN',
        name: 'Ginecología',
        description: 'Salud reproductiva femenina.',
      },
      {
        id: 'DER',
        name: 'Dermatología',
        description: 'Afecciones de la piel.',
      },
      { id: 'CAR', name: 'Cardiología', description: 'Salud cardiovascular.' },
      {
        id: 'PSQ',
        name: 'Psiquiatría',
        description: 'Salud mental y emocional.',
      },
    ];
  }

  /**
   * Obtener tipos de cita disponibles
   */
  getAppointmentTypes() {
    return [
      { id: 'CONSULTA', name: 'Consulta Médica', durationMinutes: 20 },
      { id: 'CONTROL', name: 'Control / Seguimiento', durationMinutes: 15 },
      { id: 'EMERGENCIA', name: 'Atención de Emergencia', durationMinutes: 30 },
      { id: 'PROCEDIMIENTO', name: 'Procedimiento Menor', durationMinutes: 45 },
    ];
  }

  /**
   * Obtener lista de consultorios (Offices)
   */
  getOffices() {
    return [
      { id: 'C101', name: 'Consultorio 101', floor: 'Planta Baja' },
      { id: 'C102', name: 'Consultorio 102', floor: 'Planta Baja' },
      { id: 'C201', name: 'Consultorio 201', floor: 'Primer Piso' },
      { id: 'C202', name: 'Consultorio 202', floor: 'Primer Piso' },
    ];
  }

  async getDoctors(): Promise<DoctorWithProfile[]> {
    const supabase = this.supabaseService.getClient();
    console.log('[CatalogsService] Fetching doctors...');

    // 1. Fetch doctors without the relationship to avoid PostgREST RLS planning bugs
    const { data: doctorsData, error: dError } = await supabase
      .from('doctors')
      .select('id, specialty')
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
