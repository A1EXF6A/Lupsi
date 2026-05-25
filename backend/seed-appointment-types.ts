import { Client } from 'pg';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '.env') });

const dbUrl = process.env.DATABASE_URL || '';

if (!dbUrl) {
  console.error('❌ Error: Falta DATABASE_URL en el archivo .env');
  process.exit(1);
}

const appointmentTypes = [
  {
    name: 'Consulta Inicial',
    desc: 'Primera valoración clínica completa para diagnóstico general, diagnóstico inicial y apertura de historial clínico. Aplica para todas las especialidades.',
    duration: 30
  },
  {
    name: 'Consulta de Control',
    desc: 'Seguimiento médico de rutina, revisión de exámenes de laboratorio y control evolutivo de tratamientos médicos o quirúrgicos. Aplica para todas las especialidades.',
    duration: 20
  },
  {
    name: 'Sesión de Terapia',
    desc: 'Sesión terapéutica personalizada y continua de rehabilitación física, apoyo de salud mental o desarrollo de aprendizaje. Aplica para Fisioterapia, Psicología Clínica y Psicopedagogía.',
    duration: 45
  },
  {
    name: 'Procedimiento Estético',
    desc: 'Tratamientos dermocosméticos avanzados y rejuvenecimiento facial o corporal no invasivo. Aplica para Medicina Estética.',
    duration: 60
  },
  {
    name: 'Procedimiento Clínico / Cirugía Menor',
    desc: 'Intervenciones ambulatorias, cirugías menores en consultorio, colocación de dispositivos de diagnóstico o curaciones complejas. Aplica para Medicina General, Urología, Cardiología, Cirugía General, Traumatología y Medicina Estética.',
    duration: 60
  }
];

async function seedAppointmentTypes() {
  console.log('⏳ Conectando a PostgreSQL para actualizar tipos de citas...');
  const pgClient = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
  });
  await pgClient.connect();

  console.log('🧹 Limpiando tabla public.appointment_types...');
  await pgClient.query('TRUNCATE TABLE public.appointment_types CASCADE;');

  console.log('🌱 Insertando los nuevos tipos de citas inclusivos...');
  for (const type of appointmentTypes) {
    await pgClient.query(
      'INSERT INTO public.appointment_types (name, description, duration_minutes) VALUES ($1, $2, $3);',
      [type.name, type.desc, type.duration]
    );
  }

  console.log('✅ ¡Tipos de citas médicas actualizados e inclusivos sembrados exitosamente!');
  await pgClient.end();
}

seedAppointmentTypes().catch(console.error);
