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
  AppointmentBase,
  AvailableSlot,
} from '../database/interfaces/database.interfaces';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import {
  AppointmentPayment,
  AppointmentReminder,
  Prescription,
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
          arrived: false,
          paid: false,
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
    let query = supabase
      .from('appointments')
      .select(
        `
      id,
      patient_id,
      doctor_id,
      appointment_time,
      appointment_end_time,
      status,
      arrived,
      paid
    `,
      )
      .eq('is_deleted', false);

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
        arrived: app.arrived,
        paid: app.paid,
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
      .eq('is_deleted', false)
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

  async updateAppointment(
    id: string,
    dto: UpdateAppointmentDto,
  ): Promise<AppointmentBase> {
    const supabase = this.supabaseService.getClient();
    const updates: Partial<AppointmentBase> = {};

    if (dto.doctor_id !== undefined) {
      updates.doctor_id = dto.doctor_id;
    }
    if (dto.appointment_time !== undefined) {
      const startTime = new Date(dto.appointment_time);
      const endTime = new Date(startTime.getTime() + 30 * 60000);
      updates.appointment_time = startTime.toISOString();
      updates.appointment_end_time = endTime.toISOString();
    }
    if (dto.status !== undefined) {
      updates.status = dto.status;
    }
    if (dto.arrived !== undefined) {
      updates.arrived = dto.arrived;
    }
    if (dto.paid !== undefined) {
      updates.paid = dto.paid;
    }

    const { data, error } = await supabase
      .from('appointments')
      .update(updates)
      .eq('id', id)
      .eq('is_deleted', false)
      .select(
        'id, patient_id, doctor_id, appointment_time, appointment_end_time, status, arrived, paid, is_deleted',
      )
      .single<AppointmentBase>();

    if (error) {
      throw new InternalServerErrorException(
        `Error al actualizar cita: ${error.message}`,
      );
    }

    return data;
  }

  async deleteAppointment(id: string): Promise<void> {
    const supabase = this.supabaseService.getClient();
    const { error } = await supabase
      .from('appointments')
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      throw new InternalServerErrorException(
        `Error al eliminar cita: ${error.message}`,
      );
    }
  }

  async createAvailableSlot(
    doctorId: string,
    startTime: string,
    endTime: string,
  ): Promise<AvailableSlot> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('available_slots')
      .insert([
        {
          doctor_id: doctorId,
          start_time: startTime,
          end_time: endTime,
        },
      ])
      .select('id, doctor_id, start_time, end_time, is_deleted')
      .single<AvailableSlot>();

    if (error) {
      throw new InternalServerErrorException(
        `Error al crear disponibilidad: ${error.message}`,
      );
    }

    return data;
  }

  async updateAvailableSlot(
    id: string,
    startTime: string,
    endTime: string,
  ): Promise<AvailableSlot> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('available_slots')
      .update({
        start_time: startTime,
        end_time: endTime,
      })
      .eq('id', id)
      .eq('is_deleted', false)
      .select('id, doctor_id, start_time, end_time, is_deleted')
      .single<AvailableSlot>();

    if (error) {
      throw new InternalServerErrorException(
        `Error al actualizar disponibilidad: ${error.message}`,
      );
    }

    return data;
  }

  async deleteAvailableSlot(id: string): Promise<void> {
    const supabase = this.supabaseService.getClient();
    const { error } = await supabase
      .from('available_slots')
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      throw new InternalServerErrorException(
        `Error al eliminar disponibilidad: ${error.message}`,
      );
    }
  }

  async getReminders(appointmentId: string): Promise<AppointmentReminder[]> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('appointment_reminders')
      .select('id, appointment_id, reminder_time, channel, status, is_deleted')
      .eq('appointment_id', appointmentId)
      .eq('is_deleted', false)
      .order('reminder_time', { ascending: true })
      .returns<AppointmentReminder[]>();

    if (error) {
      throw new InternalServerErrorException(
        `Error fetching reminders: ${error.message}`,
      );
    }

    return data || [];
  }

  async createReminder(
    appointmentId: string,
    reminderTime: string,
    channel?: string,
    status?: string,
  ): Promise<AppointmentReminder> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('appointment_reminders')
      .insert([
        {
          appointment_id: appointmentId,
          reminder_time: reminderTime,
          channel: channel ?? null,
          status: status ?? 'PENDING',
        },
      ])
      .select('id, appointment_id, reminder_time, channel, status, is_deleted')
      .single<AppointmentReminder>();

    if (error) {
      throw new InternalServerErrorException(
        `Error creating reminder: ${error.message}`,
      );
    }

    return data;
  }

  async updateReminder(
    id: string,
    reminderTime?: string,
    channel?: string,
    status?: string,
  ): Promise<AppointmentReminder> {
    const supabase = this.supabaseService.getClient();
    const updates: Partial<AppointmentReminder> & { updated_at: string } = {
      updated_at: new Date().toISOString(),
    };

    if (reminderTime !== undefined) {
      updates.reminder_time = reminderTime;
    }
    if (channel !== undefined) {
      updates.channel = channel;
    }
    if (status !== undefined) {
      updates.status = status;
    }

    const { data, error } = await supabase
      .from('appointment_reminders')
      .update(updates)
      .eq('id', id)
      .eq('is_deleted', false)
      .select('id, appointment_id, reminder_time, channel, status, is_deleted')
      .single<AppointmentReminder>();

    if (error) {
      throw new InternalServerErrorException(
        `Error updating reminder: ${error.message}`,
      );
    }

    return data;
  }

  async deleteReminder(id: string): Promise<void> {
    const supabase = this.supabaseService.getClient();
    const { error } = await supabase
      .from('appointment_reminders')
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      throw new InternalServerErrorException(
        `Error deleting reminder: ${error.message}`,
      );
    }
  }

  async getPayments(appointmentId: string): Promise<AppointmentPayment[]> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('appointment_payments')
      .select('id, appointment_id, amount, method, status, paid_at')
      .eq('appointment_id', appointmentId)
      .order('created_at', { ascending: false })
      .returns<AppointmentPayment[]>();

    if (error) {
      throw new InternalServerErrorException(
        `Error fetching payments: ${error.message}`,
      );
    }

    return data || [];
  }

  async createPayment(
    appointmentId: string,
    amount: number,
    method?: string,
    status?: string,
    paidAt?: string,
  ): Promise<AppointmentPayment> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('appointment_payments')
      .insert([
        {
          appointment_id: appointmentId,
          amount,
          method: method ?? null,
          status: status ?? 'PENDING',
          paid_at: paidAt ?? null,
        },
      ])
      .select('id, appointment_id, amount, method, status, paid_at')
      .single<AppointmentPayment>();

    if (error) {
      throw new InternalServerErrorException(
        `Error creating payment: ${error.message}`,
      );
    }

    return data;
  }

  async updatePayment(
    id: string,
    amount?: number,
    method?: string,
    status?: string,
    paidAt?: string,
  ): Promise<AppointmentPayment> {
    const supabase = this.supabaseService.getClient();
    const updates: Partial<AppointmentPayment> & { updated_at: string } = {
      updated_at: new Date().toISOString(),
    };

    if (amount !== undefined) {
      updates.amount = amount;
    }
    if (method !== undefined) {
      updates.method = method;
    }
    if (status !== undefined) {
      updates.status = status;
    }
    if (paidAt !== undefined) {
      updates.paid_at = paidAt;
    }

    const { data, error } = await supabase
      .from('appointment_payments')
      .update(updates)
      .eq('id', id)
      .select('id, appointment_id, amount, method, status, paid_at')
      .single<AppointmentPayment>();

    if (error) {
      throw new InternalServerErrorException(
        `Error updating payment: ${error.message}`,
      );
    }

    return data;
  }

  async deletePayment(id: string): Promise<void> {
    const supabase = this.supabaseService.getClient();
    const { error } = await supabase
      .from('appointment_payments')
      .delete()
      .eq('id', id);

    if (error) {
      throw new InternalServerErrorException(
        `Error deleting payment: ${error.message}`,
      );
    }
  }

  async getPrescription(appointmentId: string): Promise<Prescription | null> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('prescriptions')
      .select(
        'id, appointment_id, patient_id, doctor_id, notes, medications, is_deleted',
      )
      .eq('appointment_id', appointmentId)
      .eq('is_deleted', false)
      .maybeSingle<Prescription>();

    if (error) {
      throw new InternalServerErrorException(
        `Error fetching prescription: ${error.message}`,
      );
    }

    return data || null;
  }

  async createPrescription(
    appointmentId: string,
    patientId: string,
    doctorId: string,
    notes?: string,
    medications?: Record<string, unknown>[],
  ): Promise<Prescription> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('prescriptions')
      .insert([
        {
          appointment_id: appointmentId,
          patient_id: patientId,
          doctor_id: doctorId,
          notes: notes ?? null,
          medications: medications ?? [],
        },
      ])
      .select(
        'id, appointment_id, patient_id, doctor_id, notes, medications, is_deleted',
      )
      .single<Prescription>();

    if (error) {
      throw new InternalServerErrorException(
        `Error creating prescription: ${error.message}`,
      );
    }

    return data;
  }

  async updatePrescription(
    id: string,
    notes?: string,
    medications?: Record<string, unknown>[],
  ): Promise<Prescription> {
    const supabase = this.supabaseService.getClient();
    const updates: Partial<Prescription> & { updated_at: string } = {
      updated_at: new Date().toISOString(),
    };

    if (notes !== undefined) {
      updates.notes = notes;
    }
    if (medications !== undefined) {
      updates.medications = medications;
    }

    const { data, error } = await supabase
      .from('prescriptions')
      .update(updates)
      .eq('id', id)
      .eq('is_deleted', false)
      .select(
        'id, appointment_id, patient_id, doctor_id, notes, medications, is_deleted',
      )
      .single<Prescription>();

    if (error) {
      throw new InternalServerErrorException(
        `Error updating prescription: ${error.message}`,
      );
    }

    return data;
  }

  async deletePrescription(id: string): Promise<void> {
    const supabase = this.supabaseService.getClient();
    const { error } = await supabase
      .from('prescriptions')
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      throw new InternalServerErrorException(
        `Error deleting prescription: ${error.message}`,
      );
    }
  }
}
