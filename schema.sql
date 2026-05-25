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

-- Política RLS: Cualquier persona autenticada (incluye recepcionista) puede ver la lista de doctores.
CREATE POLICY "Lectura pública de doctores"
ON public.doctors FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Política RLS: Solo ADMIN/RECEPTIONIST pueden crear doctores
CREATE POLICY "Crear doctores por rol"
ON public.doctors FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
          AND role IN ('ADMIN', 'RECEPTIONIST')
    )
);

-- Política RLS: Solo ADMIN/RECEPTIONIST pueden actualizar doctores
CREATE POLICY "Actualizar doctores por rol"
ON public.doctors FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
          AND role IN ('ADMIN', 'RECEPTIONIST')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
          AND role IN ('ADMIN', 'RECEPTIONIST')
    )
);

-- Política RLS: Solo ADMIN/RECEPTIONIST pueden eliminar doctores
CREATE POLICY "Eliminar doctores por rol"
ON public.doctors FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
          AND role IN ('ADMIN', 'RECEPTIONIST')
    )
);

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
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE,
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

-- ==========================================
-- 8. CATÁLOGOS ADMINISTRABLES
-- ==========================================
CREATE TABLE public.specialties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.specialties ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.appointment_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(120) NOT NULL,
    description TEXT,
    duration_minutes INTEGER NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.appointment_types ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.offices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(120) NOT NULL,
    floor VARCHAR(120),
    description TEXT,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.offices ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.doctors
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- ==========================================
-- 9. DISPONIBILIDAD DE DOCTORES
-- ==========================================
CREATE TABLE public.available_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id UUID REFERENCES public.doctors(id) NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.available_slots ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 10. MEDICAMENTOS Y RECETAS
-- ==========================================
CREATE TABLE public.medications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    description TEXT,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.prescriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id UUID REFERENCES public.appointments(id) NOT NULL,
    patient_id UUID REFERENCES public.patients(id) NOT NULL,
    doctor_id UUID REFERENCES public.doctors(id) NOT NULL,
    notes TEXT,
    medications JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS Recetas: paciente/doctor/admin ven, doctor/admin crean/actualizan, admin elimina.
CREATE POLICY "Recetas: select paciente/doctor/admin"
ON public.prescriptions FOR SELECT
USING (
    auth.uid() = patient_id
    OR auth.uid() = doctor_id
    OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'ADMIN'
    )
);

CREATE POLICY "Recetas: insert doctor/admin"
ON public.prescriptions FOR INSERT
WITH CHECK (
    auth.uid() = doctor_id
    OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'ADMIN'
    )
);

CREATE POLICY "Recetas: update doctor/admin"
ON public.prescriptions FOR UPDATE
USING (
    auth.uid() = doctor_id
    OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'ADMIN'
    )
)
WITH CHECK (
    auth.uid() = doctor_id
    OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'ADMIN'
    )
);

CREATE POLICY "Recetas: delete admin"
ON public.prescriptions FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'ADMIN'
    )
);

-- ==========================================
-- 11. RECORDATORIOS Y PAGOS DE CITAS
-- ==========================================
CREATE TABLE public.appointment_reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id UUID REFERENCES public.appointments(id) NOT NULL,
    reminder_time TIMESTAMP WITH TIME ZONE NOT NULL,
    channel VARCHAR(50),
    status VARCHAR(30) DEFAULT 'PENDING',
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.appointment_reminders ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.appointment_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id UUID REFERENCES public.appointments(id) NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    method VARCHAR(50) CHECK (method IN ('CASH', 'CARD', 'TRANSFER')),
    status VARCHAR(30) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED')),
    receipt_url VARCHAR(500),
    paid_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.appointment_payments ENABLE ROW LEVEL SECURITY;

-- Políticas RLS Pagos: Paciente ve los suyos y crea, Recepcionista/Admin gestiona todos.
CREATE POLICY "Pagos: select multirrol"
ON public.appointment_payments FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.appointments a 
        WHERE a.id = appointment_payments.appointment_id 
        AND a.patient_id = auth.uid()
    )
    OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('ADMIN', 'RECEPTIONIST')
    )
);

CREATE POLICY "Pagos: insert paciente y admin"
ON public.appointment_payments FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.appointments a 
        WHERE a.id = appointment_payments.appointment_id 
        AND a.patient_id = auth.uid()
    )
    OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('ADMIN', 'RECEPTIONIST')
    )
);

CREATE POLICY "Pagos: update admin/recepcionista"
ON public.appointment_payments FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('ADMIN', 'RECEPTIONIST')
    )
);

-- ==========================================
-- 12. FICHA DE ATENCIÓN CLÍNICA
-- ==========================================
CREATE TABLE public.clinical_attentions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id UUID REFERENCES public.appointments(id) NOT NULL,
    patient_id UUID REFERENCES public.patients(id) NOT NULL,
    doctor_id UUID REFERENCES public.doctors(id) NOT NULL,
    notes TEXT,
    vitals JSONB,
    diagnosis TEXT,
    treatment TEXT,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.clinical_attentions ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 13. CAMPOS EXTRA EN CITAS
-- ==========================================
ALTER TABLE public.appointments
  ADD COLUMN IF NOT EXISTS arrived BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS paid BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- ==========================================
-- 14. BUCKETS DE STORAGE (COMPROBANTES)
-- ==========================================
-- Configuración del bucket para subir los comprobantes de pago
INSERT INTO storage.buckets (id, name, public) 
VALUES ('payment_receipts', 'payment_receipts', true)
ON CONFLICT (id) DO NOTHING;

-- Política 1: Cualquier usuario autenticado puede subir un comprobante
CREATE POLICY "Permitir subida de comprobantes a usuarios autenticados" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'payment_receipts');

-- Política 2: Cualquier persona puede ver/leer los comprobantes (ya que es un bucket público)
CREATE POLICY "Permitir lectura publica de comprobantes" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'payment_receipts');
