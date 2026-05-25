import { Client } from 'pg';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '.env') });

const dbUrl = process.env.DATABASE_URL || '';

if (!dbUrl) {
  console.error('❌ Error: Falta DATABASE_URL.');
  process.exit(1);
}

const sqlQuery = `
-- 1. LIMPIAR TODOS LOS USUARIOS ACTUALES PARA EVITAR CHOQUES DE CLAVE PRIMARIA
TRUNCATE TABLE public.prescriptions CASCADE;
TRUNCATE TABLE public.available_slots CASCADE;
TRUNCATE TABLE public.medical_records CASCADE;
TRUNCATE TABLE public.appointments CASCADE;
TRUNCATE TABLE public.patients CASCADE;
TRUNCATE TABLE public.doctors CASCADE;
TRUNCATE TABLE public.profiles CASCADE;
DELETE FROM auth.users;

-- 2. CREACIÓN DE LA FUNCIÓN AUXILIAR CON VERIFICACIÓN PREVIA
CREATE OR REPLACE FUNCTION public.crear_usuario_lupsi(
    p_email VARCHAR(255),
    p_password_hash VARCHAR(255),
    p_first_name VARCHAR(100),
    p_last_name VARCHAR(100),
    p_role public.user_role,
    p_specialty VARCHAR(100) DEFAULT NULL,
    p_license VARCHAR(50) DEFAULT NULL,
    p_dni VARCHAR(10) DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
    v_user_id UUID;
BEGIN
    SELECT id INTO v_user_id FROM auth.users WHERE email = p_email;

    IF v_user_id IS NULL THEN
        v_user_id := uuid_generate_v4();

        INSERT INTO auth.users (
            instance_id, id, aud, role, email, encrypted_password, 
            email_confirmed_at, recovery_sent_at, last_sign_in_at, 
            raw_app_meta_data, raw_user_meta_data, created_at, 
            updated_at, confirmation_token, email_change, email_change_token_new, 
            recovery_token
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            v_user_id,
            'authenticated',
            'authenticated',
            p_email,
            p_password_hash,
            NOW(), NULL, NULL,
            '{"provider":"email","providers":["email"]}'::jsonb,
            json_build_object('first_name', p_first_name, 'last_name', p_last_name)::jsonb,
            NOW(), NOW(), '', '', '', ''
        );
    END IF;

    INSERT INTO public.profiles (id, role, email, first_name, last_name, created_at)
    VALUES (v_user_id, p_role, p_email, p_first_name, p_last_name, NOW())
    ON CONFLICT (id) DO NOTHING;

    IF p_role = 'DOCTOR' THEN
        INSERT INTO public.doctors (id, specialty, medical_license, created_at)
        VALUES (v_user_id, p_specialty, p_license, NOW())
        ON CONFLICT (id) DO NOTHING;
    ELSIF p_role = 'PATIENT' THEN
        INSERT INTO public.patients (id, dni, phone, date_of_birth, created_at)
        VALUES (v_user_id, p_dni, '0999999999', '1995-01-01', NOW())
        ON CONFLICT (id) DO NOTHING;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 3. EJECUCIÓN CON HASH OFICIAL DE Password123!
DO $$
BEGIN
    -- Personal Administrativo y de Recepción
    PERFORM public.crear_usuario_lupsi('luzmarina@lupsi.com', '$2a$10$fMZfp.LszTf4VZmhzxgWf.L4m1EIEuOmwMqpKAx/KYjartorXmJKC', 'Luz Marina', 'Sáenz', 'ADMIN');
    PERFORM public.crear_usuario_lupsi('diana.recepcion@gmail.com', '$2a$10$fMZfp.LszTf4VZmhzxgWf.L4m1EIEuOmwMqpKAx/KYjartorXmJKC', 'Diana', 'Altamirano', 'RECEPTIONIST');

    -- Cuentas Médicas Reales
    PERFORM public.crear_usuario_lupsi('diana.altamirano@gmail.com', '$2a$10$fMZfp.LszTf4VZmhzxgWf.L4m1EIEuOmwMqpKAx/KYjartorXmJKC', 'Diana', 'Altamirano', 'DOCTOR', 'Psicología Clínica', 'MED-702984');
    PERFORM public.crear_usuario_lupsi('luz.saenz@gmail.com', '$2a$10$fMZfp.LszTf4VZmhzxgWf.L4m1EIEuOmwMqpKAx/KYjartorXmJKC', 'Luz Marina', 'Sáenz', 'DOCTOR', 'Psicología Clínica', 'MED-992813');
    PERFORM public.crear_usuario_lupsi('edgar.sanchez@gmail.com', '$2a$10$fMZfp.LszTf4VZmhzxgWf.L4m1EIEuOmwMqpKAx/KYjartorXmJKC', 'Edgar', 'Sánchez', 'DOCTOR', 'Urología', 'MED-881928');
    PERFORM public.crear_usuario_lupsi('paulina.bombon@gmail.com', '$2a$10$fMZfp.LszTf4VZmhzxgWf.L4m1EIEuOmwMqpKAx/KYjartorXmJKC', 'Paulina', 'Bombón', 'DOCTOR', 'Neurología', 'MED-772918');
    PERFORM public.crear_usuario_lupsi('juancarlos.salazar@gmail.com', '$2a$10$fMZfp.LszTf4VZmhzxgWf.L4m1EIEuOmwMqpKAx/KYjartorXmJKC', 'Juan Carlos', 'Salazar', 'DOCTOR', 'Medicina Interna', 'MED-661928');
    PERFORM public.crear_usuario_lupsi('paulo.telenchana@gmail.com', '$2a$10$fMZfp.LszTf4VZmhzxgWf.L4m1EIEuOmwMqpKAx/KYjartorXmJKC', 'Paulo', 'Telenchana', 'DOCTOR', 'Traumatología y Ortopedia', 'MED-551029');
    PERFORM public.crear_usuario_lupsi('diego.ortiz@gmail.com', '$2a$10$fMZfp.LszTf4VZmhzxgWf.L4m1EIEuOmwMqpKAx/KYjartorXmJKC', 'Diego', 'Ortiz', 'DOCTOR', 'Medicina General', 'MED-441029');

    -- Cuentas Médicas Inventadas
    PERFORM public.crear_usuario_lupsi('sofia.maldonado@gmail.com', '$2a$10$fMZfp.LszTf4VZmhzxgWf.L4m1EIEuOmwMqpKAx/KYjartorXmJKC', 'Sofía', 'Maldonado', 'DOCTOR', 'Medicina General', 'MED-441030');
    PERFORM public.crear_usuario_lupsi('marcos.vivar@gmail.com', '$2a$10$fMZfp.LszTf4VZmhzxgWf.L4m1EIEuOmwMqpKAx/KYjartorXmJKC', 'Marcos', 'Vivar', 'DOCTOR', 'Neuropsicología', 'MED-110293');
    PERFORM public.crear_usuario_lupsi('alberto.paredes@gmail.com', '$2a$10$fMZfp.LszTf4VZmhzxgWf.L4m1EIEuOmwMqpKAx/KYjartorXmJKC', 'Alberto', 'Paredes', 'DOCTOR', 'Geriatría', 'MED-120938');
    PERFORM public.crear_usuario_lupsi('elena.castro@gmail.com', '$2a$10$fMZfp.LszTf4VZmhzxgWf.L4m1EIEuOmwMqpKAx/KYjartorXmJKC', 'Elena', 'Castro', 'DOCTOR', 'Psicopedagogía', 'MED-130928');
    PERFORM public.crear_usuario_lupsi('andrea.carrera@gmail.com', '$2a$10$fMZfp.LszTf4VZmhzxgWf.L4m1EIEuOmwMqpKAx/KYjartorXmJKC', 'Andrea', 'Carrera', 'DOCTOR', 'Nutrición', 'MED-140298');
    PERFORM public.crear_usuario_lupsi('roberto.freire@gmail.com', '$2a$10$fMZfp.LszTf4VZmhzxgWf.L4m1EIEuOmwMqpKAx/KYjartorXmJKC', 'Roberto', 'Freire', 'DOCTOR', 'Cardiología', 'MED-150293');
    PERFORM public.crear_usuario_lupsi('fernando.teran@gmail.com', '$2a$10$fMZfp.LszTf4VZmhzxgWf.L4m1EIEuOmwMqpKAx/KYjartorXmJKC', 'Fernando', 'Terán', 'DOCTOR', 'Cirugía General', 'MED-160293');
    PERFORM public.crear_usuario_lupsi('christian.ortiz@gmail.com', '$2a$10$fMZfp.LszTf4VZmhzxgWf.L4m1EIEuOmwMqpKAx/KYjartorXmJKC', 'Christian', 'Ortiz', 'DOCTOR', 'Fisioterapia', 'MED-170293');
    PERFORM public.crear_usuario_lupsi('gabriela.jaramillo@gmail.com', '$2a$10$fMZfp.LszTf4VZmhzxgWf.L4m1EIEuOmwMqpKAx/KYjartorXmJKC', 'Gabriela', 'Jaramillo', 'DOCTOR', 'Medicina Estética', 'MED-180293');
    PERFORM public.crear_usuario_lupsi('carlos.galarza@gmail.com', '$2a$10$fMZfp.LszTf4VZmhzxgWf.L4m1EIEuOmwMqpKAx/KYjartorXmJKC', 'Carlos', 'Galarza', 'DOCTOR', 'Neurocirugía', 'MED-190293');
    PERFORM public.crear_usuario_lupsi('patricia.viteri@gmail.com', '$2a$10$fMZfp.LszTf4VZmhzxgWf.L4m1EIEuOmwMqpKAx/KYjartorXmJKC', 'Patricia', 'Viteri', 'DOCTOR', 'Medicina del Dolor', 'MED-200293');

    -- Paciente de Prueba
    PERFORM public.crear_usuario_lupsi('patient@lupsi.com', '$2a$10$fMZfp.LszTf4VZmhzxgWf.L4m1EIEuOmwMqpKAx/KYjartorXmJKC', 'Juan', 'Perez', 'PATIENT', NULL, NULL, '1801234567');
END $$;

-- 4. LIMPIEZA DE LA FUNCIÓN AUXILIAR DE LA BASE DE DATOS
DROP FUNCTION public.crear_usuario_lupsi(VARCHAR, VARCHAR, VARCHAR, VARCHAR, public.user_role, VARCHAR, VARCHAR, VARCHAR);
`;

async function fixUsers() {
  console.log('⏳ Conectando directamente a PostgreSQL...');
  const pgClient = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
  });
  await pgClient.connect();

  console.log('🧹 Limpiando base de datos e inyectando usuarios con HASH REAL...');
  await pgClient.query(sqlQuery);

  console.log('✅ ¡Base de datos de usuarios reparada y configurada exitosamente!');
  await pgClient.end();
}

fixUsers().catch(console.error);
