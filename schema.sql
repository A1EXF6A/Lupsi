-- ==========================================
-- PWA Gestión Médica LUPSI
-- Base de Datos: PostgreSQL (Supabase)
-- Sprint 1: Cimientos, Core Data y QA Temprano
-- ==========================================

-- 1. EXTENSIONES NECESARIAS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- Extensión Btree GiST para restricciones de exclusión de rangos de tiempo (crucial para evitar Double-Booking real)
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- ==========================================
-- 2. TIPOS DE DATOS ENUMERADOS
-- ==========================================
CREATE TYPE public.appointment_status AS ENUM ('SCHEDULED', 'CANCELLED', 'COMPLETED');
CREATE TYPE public.user_role AS ENUM ('PATIENT', 'DOCTOR', 'RECEPTIONIST', 'ADMIN');

-- ==========================================
-- 3. TABLA DE PERFILES GLOBALES (IAM y Roles)
-- ==========================================
-- Centraliza los IDs de Supabase Auth para vincularlos con su ROL específico en el sistema.
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role public.user_role NOT NULL DEFAULT 'PATIENT',
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 4. TABLA DE PACIENTES
-- ==========================================
CREATE TABLE public.patients (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    dni VARCHAR(10) UNIQUE NOT NULL CHECK (dni ~ '^[0-9]{10}$'), -- Garantiza que solo sean 10 dígitos numéricos
    phone VARCHAR(20),
    date_of_birth DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- Política RLS: Un paciente lee su perfil, administrativos y doctores leen todos.
CREATE POLICY "Paciente lee su propio perfil" 
ON public.patients FOR SELECT 
USING (
    auth.uid() = id 
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('DOCTOR', 'RECEPTIONIST'))
);

-- ==========================================
-- 5. TABLA DE DOCTORES
-- ==========================================
CREATE TABLE public.doctors (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    specialty VARCHAR(100) NOT NULL,
    medical_license VARCHAR(50) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;

-- Política RLS: Cualquier persona autenticada puede ver la lista de doctores para poder agendar.
CREATE POLICY "Lectura pública de doctores"
ON public.doctors FOR SELECT
USING (auth.uid() IS NOT NULL);

-- ==========================================
-- 6. TABLA DE CITAS (Appointments)
-- ==========================================
CREATE TABLE public.appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES public.patients(id) NOT NULL,
    doctor_id UUID REFERENCES public.doctors(id) NOT NULL,
    appointment_time TIMESTAMP WITH TIME ZONE NOT NULL,
    appointment_end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status public.appointment_status DEFAULT 'SCHEDULED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Restricción REAL contra "Double Booking" usando rangos de tiempo (PostgreSQL EXCLUDE)
    -- El cálculo de 'appointment_end_time' se asume en milisegundos desde el Backend (NestJS)
    CONSTRAINT no_overlapping_appointments EXCLUDE USING gist (
        doctor_id WITH =,
        tstzrange(appointment_time, appointment_end_time) WITH &&
    ) WHERE (status = 'SCHEDULED') -- Ignorar choques lógicos si una cita pasada está CANCELADA
);
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Política RLS Citas: Multirrol
CREATE POLICY "Pacientes leen sus citas" 
ON public.appointments FOR SELECT 
USING (auth.uid() = patient_id);

CREATE POLICY "Doctores leen sus citas" 
ON public.appointments FOR SELECT 
USING (auth.uid() = doctor_id);

CREATE POLICY "Recepcionistas leen todas las citas" 
ON public.appointments FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'RECEPTIONIST'));

-- ==========================================
-- 7. TABLA DE HISTORIAS CLÍNICAS (Digital Records)
-- ==========================================
CREATE TABLE public.medical_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES public.patients(id) NOT NULL,
    doctor_id UUID REFERENCES public.doctors(id) NOT NULL,
    appointment_id UUID REFERENCES public.appointments(id),
    document_url VARCHAR(500) NOT NULL, -- URL estática alojada en Cloudinary
    diagnosis TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;

-- Política RLS Historias: Recepcionista JAMÁS entra aquí, bloqueado en la capa de datos.
CREATE POLICY "Restricción de Privacidad RLS en Historias" 
ON public.medical_records FOR SELECT 
USING (
    auth.uid() = patient_id 
    OR auth.uid() = doctor_id
);
