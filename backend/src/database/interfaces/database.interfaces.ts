export interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  role: string;
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
}

export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_time: string;
  appointment_end_time: string;
  status: 'SCHEDULED' | 'CANCELLED' | 'COMPLETED';
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
  appointment_time: string;
  appointment_end_time: string;
  status: string;
  patients: PatientWithProfile;
  doctors: DoctorWithProfile;
}
