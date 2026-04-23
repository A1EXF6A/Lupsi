-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.appointments (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  patient_id uuid NOT NULL,
  doctor_id uuid NOT NULL,
  appointment_time timestamp with time zone NOT NULL,
  appointment_end_time timestamp with time zone NOT NULL,
  status USER-DEFINED DEFAULT 'SCHEDULED'::appointment_status,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT appointments_pkey PRIMARY KEY (id),
  CONSTRAINT appointments_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id),
  CONSTRAINT appointments_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.doctors(id)
);
CREATE TABLE public.doctors (
  id uuid NOT NULL,
  specialty character varying NOT NULL,
  medical_license character varying UNIQUE,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT doctors_pkey PRIMARY KEY (id),
  CONSTRAINT doctors_id_fkey FOREIGN KEY (id) REFERENCES public.profiles(id)
);
CREATE TABLE public.medical_records (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  patient_id uuid NOT NULL,
  doctor_id uuid NOT NULL,
  appointment_id uuid,
  document_url character varying NOT NULL,
  diagnosis text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT medical_records_pkey PRIMARY KEY (id),
  CONSTRAINT medical_records_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id),
  CONSTRAINT medical_records_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.doctors(id),
  CONSTRAINT medical_records_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.appointments(id)
);
CREATE TABLE public.patients (
  id uuid NOT NULL,
  dni character varying NOT NULL UNIQUE CHECK (dni::text ~ '^[0-9]{10}$'::text),
  phone character varying,
  date_of_birth date,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT patients_pkey PRIMARY KEY (id),
  CONSTRAINT patients_id_fkey FOREIGN KEY (id) REFERENCES public.profiles(id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  role USER-DEFINED NOT NULL DEFAULT 'PATIENT'::user_role,
  email character varying NOT NULL UNIQUE,
  first_name character varying NOT NULL,
  last_name character varying NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);