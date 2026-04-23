import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import {
  Appointment,
  AppointmentWithDetails,
  Patient,
  Doctor,
  Profile,
} from '../database/interfaces/database.interfaces';

@Injectable()
export class AppointmentsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async create(patientId: string, createAppointmentDto: CreateAppointmentDto) {
    const supabase = this.supabaseService.getClient();

    // Sumamos 30 minutos fijos asumiendo que es la duración de la cita médica
    const startTime = new Date(createAppointmentDto.appointment_time);
    const endTime = new Date(startTime.getTime() + 30 * 60000); // +30 mins

    const { data, error } = await supabase
      .from('appointments')
      .insert([
        {
          patient_id: patientId,
          doctor_id: createAppointmentDto.doctor_id,
          appointment_time: startTime.toISOString(),
          appointment_end_time: endTime.toISOString(),
          status: 'SCHEDULED',
        },
      ])
      .select()
      .single<Appointment>();

    if (error) {
      if (error.code === '23P01') {
        // exclusion_violation (Double-booking constraint)
        throw new ConflictException(
          'El horario seleccionado ya se encuentra ocupado por otra cita.',
        );
      }
      throw new InternalServerErrorException(
        `Error al crear cita: ${error.message}`,
      );
    }

    return data;
  }

  async findAll(
    userId: string,
    role: string,
    date?: string,
  ): Promise<AppointmentWithDetails[]> {
    const supabase = this.supabaseService.getClient();
    let query = supabase.from('appointments').select(`
      id,
      patient_id,
      doctor_id,
      appointment_time,
      appointment_end_time,
      status
    `);

    // El supabase client está configurado con service_role.
    // Aplicamos los filtros manualmente basados en el rol.
    if (role === 'PATIENT') {
      query = query.eq('patient_id', userId);
    } else if (role === 'DOCTOR') {
      query = query.eq('doctor_id', userId);
    } // RECEPTIONIST / ADMIN see all

    if (date) {
      // filter by date
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      query = query
        .gte('appointment_time', startDate.toISOString())
        .lte('appointment_time', endDate.toISOString());
    }

    const { data, error } = await query.order('appointment_time', {
      ascending: true,
    });

    if (error) {
      throw new InternalServerErrorException(
        `Error fetching appointments: ${error.message}`,
      );
    }

    if (!data || data.length === 0) return [];

    // Manually fetch and merge relationships to bypass PostgREST RLS recursion bugs
    const patientIds = [...new Set(data.map((a: Appointment) => a.patient_id))];
    const doctorIds = [...new Set(data.map((a: Appointment) => a.doctor_id))];

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

    return data.map((app: Appointment) => {
      const pProfile = profilesData?.find(
        (p: Profile) => p.id === app.patient_id,
      );
      const patient = patientsData?.find(
        (p: Patient) => p.id === app.patient_id,
      );

      const dProfile = profilesData?.find(
        (p: Profile) => p.id === app.doctor_id,
      );
      const doctor = doctorsData?.find((d: Doctor) => d.id === app.doctor_id);

      return {
        id: app.id,
        appointment_time: app.appointment_time,
        appointment_end_time: app.appointment_end_time,
        status: app.status,
        patients: {
          id: app.patient_id,
          first_name: pProfile?.first_name || '',
          last_name: pProfile?.last_name || '',
          dni: patient?.dni || '',
        },
        doctors: {
          id: app.doctor_id,
          specialty: doctor?.specialty || '',
          profiles: {
            first_name: dProfile?.first_name || '',
            last_name: dProfile?.last_name || '',
          },
        },
      };
    });
  }

  async getAvailableSlots(doctorId: string, date: string) {
    const supabase = this.supabaseService.getClient();

    // Generar fechas de inicio y fin del día en UTC para filtrar correctamente en la DB
    // Asumimos que el usuario quiere el día 'date' en horario de Ecuador (-05:00)
    const startDate = new Date(`${date}T00:00:00-05:00`);
    const endDate = new Date(`${date}T23:59:59-05:00`);

    const { data: appointments, error } = await supabase
      .from('appointments')
      .select('appointment_time, appointment_end_time')
      .eq('doctor_id', doctorId)
      .eq('status', 'SCHEDULED')
      .gte('appointment_time', startDate.toISOString())
      .lte('appointment_time', endDate.toISOString())
      .returns<Partial<Appointment>[]>();

    if (error) {
      throw new InternalServerErrorException(
        `Error fetching slots: ${error.message}`,
      );
    }

    // Generar franjas de 8 AM a 5 PM (Ecuador Time)
    const slots: { start: string; end: string }[] = [];

    // Iteramos desde las 08:00 hasta las 17:00 en el horario que el usuario espera ver
    for (let hour = 8; hour < 17; hour++) {
      for (const minute of [0, 30]) {
        const hh = hour.toString().padStart(2, '0');
        const mm = minute.toString().padStart(2, '0');

        // Crear el objeto Date representando esa hora específica en ECUADOR (-05:00)
        const currentSlotStart = new Date(`${date}T${hh}:${mm}:00-05:00`);
        const currentSlotEnd = new Date(
          currentSlotStart.getTime() + 30 * 60000,
        );

        // Comprobar si hay superposición con alguna cita existente
        const isOccupied = (appointments || []).some(
          (app: Partial<Appointment>) => {
            const appStart = new Date(app.appointment_time as string);
            const appEnd = new Date(app.appointment_end_time as string);
            // Superposición: start1 < end2 AND end1 > start2
            return currentSlotStart < appEnd && currentSlotEnd > appStart;
          },
        );

        if (!isOccupied) {
          slots.push({
            start: currentSlotStart.toISOString(),
            end: currentSlotEnd.toISOString(),
          });
        }
      }
    }

    return slots;
  }
}
