export interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  role: string;
  email?: string;
}

export interface Patient {
  id: string;
  dni: string;
  profiles?: Profile;
}

export interface Doctor {
  id: string;
  specialty: string;
  profiles?: Profile;
  is_deleted?: boolean;
}

export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_time: string;
  appointment_end_time: string;
  status: 'SCHEDULED' | 'CANCELLED' | 'COMPLETED';
  arrived?: boolean;
  paid?: boolean;
  is_deleted?: boolean;
  appointment_type?: string;
  specialty?: string;
  price?: number;
}

export interface PatientWithProfile {
  id: string;
  first_name: string;
  last_name: string;
  dni: string;
}

export interface DoctorWithProfile {
  id: string;
  specialty: string;
  profiles: {
    first_name: string;
    last_name: string;
  };
}

export interface AppointmentWithDetails {
  id: string;
  patient_id?: string;
  doctor_id?: string;
  appointment_time: string;
  appointment_end_time: string;
  status: string;
  arrived?: boolean;
  paid?: boolean;
  patients: PatientWithProfile;
  doctors: DoctorWithProfile;
  appointment_type?: string;
  specialty?: string;
  price?: number;
}

export interface AppointmentBase {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_time: string;
  appointment_end_time: string;
  status: 'SCHEDULED' | 'CANCELLED' | 'COMPLETED';
  arrived?: boolean;
  paid?: boolean;
  is_deleted?: boolean;
  appointment_type?: string;
  specialty?: string;
  price?: number;
}

export interface Specialty {
  id: string;
  name: string;
  description: string | null;
  is_deleted?: boolean;
}

export interface AppointmentType {
  id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  is_deleted?: boolean;
}

export interface Office {
  id: string;
  name: string;
  floor: string | null;
  description: string | null;
  is_deleted?: boolean;
}

export interface AvailableSlot {
  id: string;
  doctor_id: string;
  start_time: string;
  end_time: string;
  is_deleted?: boolean;
}

export interface MedicalRecord {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_id: string | null;
  document_url: string;
  diagnosis: string | null;
  is_deleted?: boolean;
  created_at?: string;
  patients?: PatientWithProfile;
  doctors?: DoctorWithProfile;
}

export interface ClinicalAttention {
  id: string;
  appointment_id: string;
  patient_id: string;
  doctor_id: string;
  notes: string | null;
  vitals: Record<string, unknown> | null;
  diagnosis: string | null;
  treatment: string | null;
  is_deleted?: boolean;
  created_at?: string;
  patients?: PatientWithProfile;
  doctors?: DoctorWithProfile;
}

export interface Medication {
  id: string;
  name: string;
  description: string | null;
  is_deleted?: boolean;
}

export interface Prescription {
  id: string;
  appointment_id: string;
  patient_id: string;
  doctor_id: string;
  notes: string | null;
  medications: Record<string, unknown>[];
  is_deleted?: boolean;
}

export interface AppointmentReminder {
  id: string;
  appointment_id: string;
  reminder_time: string;
  channel: string | null;
  status: string;
  is_deleted?: boolean;
}

export interface AppointmentPayment {
  id: string;
  appointment_id: string;
  amount: number;
  method: string | null;
  status: string;
  paid_at: string | null;
  receipt_url?: string | null;
}
