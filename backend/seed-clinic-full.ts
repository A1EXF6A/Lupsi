import { createClient } from '@supabase/supabase-js';
import { Client } from 'pg';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '.env') });

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const dbUrl = process.env.DATABASE_URL || '';

if (!supabaseUrl || !supabaseKey || !dbUrl) {
  console.error('❌ Error: Faltan credenciales en el archivo .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Definición de las 16 especialidades oficiales
const specialtiesList = [
  { name: 'Medicina General', desc: 'Atención médica primaria y preventiva para la familia.' },
  { name: 'Psicología Clínica', desc: 'Evaluación, diagnóstico y terapia psicológica para la salud mental.' },
  { name: 'Neuropsicología', desc: 'Estudio y tratamiento cognitivo del cerebro, cubriendo Neuropsicología y Educación.' },
  { name: 'Geriatría', desc: 'Atención médica especializada para adultos mayores.' },
  { name: 'Medicina Interna', desc: 'Diagnóstico y tratamiento no quirúrgico de enfermedades complejas en adultos.' },
  { name: 'Psicopedagogía', desc: 'Intervención y soporte en dificultades de aprendizaje y desarrollo escolar.' },
  { name: 'Nutrición', desc: 'Asesoría dietética e inmunonutrición clínica personalizada.' },
  { name: 'Cardiología', desc: 'Evaluación cardiovascular integral y lecturas de Electrocardiograma (ECG).' },
  { name: 'Cirugía General', desc: 'Procedimientos quirúrgicos y control pre/post-operatorio.' },
  { name: 'Traumatología y Ortopedia', desc: 'Diagnóstico y tratamiento de lesiones óseas, musculares y articulares.' },
  { name: 'Fisioterapia', desc: 'Rehabilitación física y motora bajo modalidad de citas agendadas.' },
  { name: 'Urología', desc: 'Atención del sistema urinario masculino/femenino y reproductor masculino.' },
  { name: 'Medicina Estética', desc: 'Tratamientos dermocosméticos no invasivos y rejuvenecimiento facial.' },
  { name: 'Neurología', desc: 'Estudio y tratamiento de trastornos neurológicos de la vejez y de adultos.' },
  { name: 'Neurocirugía', desc: 'Intervención quirúrgica del sistema nervioso, cerebro y columna.' },
  { name: 'Medicina del Dolor', desc: 'Terapia analgésica y cuidados paliativos para pacientes con dolor crónico.' }
];

// Usuarios del sistema
const systemUsers = [
  // 1. Administrador (Luz Marina Sáenz)
  {
    email: 'luzmarina@lupsi.com',
    password: 'Password123!',
    first_name: 'Luz Marina',
    last_name: 'Sáenz',
    role: 'ADMIN',
    specialty: null
  },
  // 2. Recepcionista (Diana Altamirano - Cuenta 1)
  {
    email: 'diana.recepcion@gmail.com',
    password: 'Password123!',
    first_name: 'Diana',
    last_name: 'Altamirano',
    role: 'RECEPTIONIST',
    specialty: null
  },
  // 3. Psicóloga Diana Altamirano (Doctora - Cuenta 2)
  {
    email: 'diana.altamirano@gmail.com',
    password: 'Password123!',
    first_name: 'Diana',
    last_name: 'Altamirano',
    role: 'DOCTOR',
    specialty: 'Psicología Clínica',
    license: 'MED-702984'
  },
  // 4. Psicóloga Luz Marina Sáenz (Doctora - Opcional por si también consulta)
  {
    email: 'luz.saenz@gmail.com',
    password: 'Password123!',
    first_name: 'Luz Marina',
    last_name: 'Sáenz',
    role: 'DOCTOR',
    specialty: 'Psicología Clínica',
    license: 'MED-992813'
  },
  // 5. Urólogo Edgar Sánchez
  {
    email: 'edgar.sanchez@gmail.com',
    password: 'Password123!',
    first_name: 'Edgar',
    last_name: 'Sánchez',
    role: 'DOCTOR',
    specialty: 'Urología',
    license: 'MED-881928'
  },
  // 6. Neuróloga Paulina Bombón
  {
    email: 'paulina.bombon@gmail.com',
    password: 'Password123!',
    first_name: 'Paulina',
    last_name: 'Bombón',
    role: 'DOCTOR',
    specialty: 'Neurología',
    license: 'MED-772918'
  },
  // 7. Medicina Interna Juan Carlos Salazar
  {
    email: 'juancarlos.salazar@gmail.com',
    password: 'Password123!',
    first_name: 'Juan Carlos',
    last_name: 'Salazar',
    role: 'DOCTOR',
    specialty: 'Medicina Interna',
    license: 'MED-661928'
  },
  // 8. Traumatólogo Paulo Telenchana
  {
    email: 'paulo.telenchana@gmail.com',
    password: 'Password123!',
    first_name: 'Paulo',
    last_name: 'Telenchana',
    role: 'DOCTOR',
    specialty: 'Traumatología y Ortopedia',
    license: 'MED-551029'
  },
  // 9. Medicina General Diego Ortiz
  {
    email: 'diego.ortiz@gmail.com',
    password: 'Password123!',
    first_name: 'Diego',
    last_name: 'Ortiz',
    role: 'DOCTOR',
    specialty: 'Medicina General',
    license: 'MED-441029'
  },
  // 10. Medicina General 2 (Dra. Sofía Maldonado - Inventado)
  {
    email: 'sofia.maldonado@gmail.com',
    password: 'Password123!',
    first_name: 'Sofía',
    last_name: 'Maldonado',
    role: 'DOCTOR',
    specialty: 'Medicina General',
    license: 'MED-441030'
  },
  // 11. Neuropsicología (Dr. Marcos Vivar - Inventado)
  {
    email: 'marcos.vivar@gmail.com',
    password: 'Password123!',
    first_name: 'Marcos',
    last_name: 'Vivar',
    role: 'DOCTOR',
    specialty: 'Neuropsicología',
    license: 'MED-110293'
  },
  // 12. Geriatría (Dr. Alberto Paredes - Inventado)
  {
    email: 'alberto.paredes@gmail.com',
    password: 'Password123!',
    first_name: 'Alberto',
    last_name: 'Paredes',
    role: 'DOCTOR',
    specialty: 'Geriatría',
    license: 'MED-120938'
  },
  // 13. Psicopedagogía (Dra. Elena Castro - Inventado)
  {
    email: 'elena.castro@gmail.com',
    password: 'Password123!',
    first_name: 'Elena',
    last_name: 'Castro',
    role: 'DOCTOR',
    specialty: 'Psicopedagogía',
    license: 'MED-130928'
  },
  // 14. Nutrición (Dra. Andrea Carrera - Inventado)
  {
    email: 'andrea.carrera@gmail.com',
    password: 'Password123!',
    first_name: 'Andrea',
    last_name: 'Carrera',
    role: 'DOCTOR',
    specialty: 'Nutrición',
    license: 'MED-140298'
  },
  // 15. Cardiología (Dr. Roberto Freire - Inventado)
  {
    email: 'roberto.freire@gmail.com',
    password: 'Password123!',
    first_name: 'Roberto',
    last_name: 'Freire',
    role: 'DOCTOR',
    specialty: 'Cardiología',
    license: 'MED-150293'
  },
  // 16. Cirugía General (Dr. Fernando Terán - Inventado)
  {
    email: 'fernando.teran@gmail.com',
    password: 'Password123!',
    first_name: 'Fernando',
    last_name: 'Terán',
    role: 'DOCTOR',
    specialty: 'Cirugía General',
    license: 'MED-160293'
  },
  // 17. Fisioterapia (Lic. Christian Ortiz - Inventado)
  {
    email: 'christian.ortiz@gmail.com',
    password: 'Password123!',
    first_name: 'Christian',
    last_name: 'Ortiz',
    role: 'DOCTOR',
    specialty: 'Fisioterapia',
    license: 'MED-170293'
  },
  // 18. Medicina Estética (Dra. Gabriela Jaramillo - Inventado)
  {
    email: 'gabriela.jaramillo@gmail.com',
    password: 'Password123!',
    first_name: 'Gabriela',
    last_name: 'Jaramillo',
    role: 'DOCTOR',
    specialty: 'Medicina Estética',
    license: 'MED-180293'
  },
  // 19. Neurocirugía (Dr. Carlos Galarza - Inventado)
  {
    email: 'carlos.galarza@gmail.com',
    password: 'Password123!',
    first_name: 'Carlos',
    last_name: 'Galarza',
    role: 'DOCTOR',
    specialty: 'Neurocirugía',
    license: 'MED-190293'
  },
  // 20. Medicina del Dolor (Dra. Patricia Viteri - Inventado)
  {
    email: 'patricia.viteri@gmail.com',
    password: 'Password123!',
    first_name: 'Patricia',
    last_name: 'Viteri',
    role: 'DOCTOR',
    specialty: 'Medicina del Dolor',
    license: 'MED-200293'
  },
  // 21. Paciente de Prueba (Juan Perez)
  {
    email: 'patient@lupsi.com',
    password: 'Password123!',
    first_name: 'Juan',
    last_name: 'Perez',
    role: 'PATIENT',
    specialty: null,
    dni: '1801234567'
  }
];

async function seedEverything() {
  console.log('⏳ 1. Conectando directamente a PostgreSQL...');
  const pgClient = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
  });
  await pgClient.connect();

  console.log('🧹 2. Limpiando todas las tablas en cascada...');
  await pgClient.query('TRUNCATE TABLE public.prescriptions CASCADE;');
  await pgClient.query('TRUNCATE TABLE public.available_slots CASCADE;');
  await pgClient.query('TRUNCATE TABLE public.medical_records CASCADE;');
  await pgClient.query('TRUNCATE TABLE public.appointments CASCADE;');
  await pgClient.query('TRUNCATE TABLE public.patients CASCADE;');
  await pgClient.query('TRUNCATE TABLE public.doctors CASCADE;');
  await pgClient.query('TRUNCATE TABLE public.profiles CASCADE;');
  await pgClient.query('TRUNCATE TABLE public.specialties CASCADE;');
  await pgClient.query('DELETE FROM auth.users;');
  
  console.log('✅ Base de datos limpia (tablas y usuarios de auth vaciados).');

  console.log('\n🌱 3. Insertando las 16 especialidades oficiales...');
  for (const spec of specialtiesList) {
    await pgClient.query(
      'INSERT INTO public.specialties (name, description) VALUES ($1, $2);',
      [spec.name, spec.desc]
    );
  }
  console.log(`✅ ${specialtiesList.length} Especialidades sembradas en la base de datos.`);
  await pgClient.end();

  console.log('\n🔐 4. Creando usuarios en Supabase Auth y sincronizando perfiles...');
  for (const user of systemUsers) {
    console.log(`- Creando cuenta para: ${user.first_name} ${user.last_name} (${user.role}) -> ${user.email}`);

    // Crear el usuario en auth.users a través del API Admin
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true
    });

    if (authError) {
      console.error(`❌ Error en Auth para ${user.email}:`, authError.message);
      continue;
    }

    const userId = authData.user.id;

    // Insertar el perfil
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          id: userId,
          role: user.role,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name
        }
      ]);

    if (profileError) {
      console.error(`❌ Error en perfil para ${user.email}:`, profileError.message);
      continue;
    }

    // Insertar en la tabla específica según el rol
    if (user.role === 'DOCTOR') {
      const { error: doctorError } = await supabase
        .from('doctors')
        .insert([
          {
            id: userId,
            specialty: user.specialty,
            medical_license: user.license || `MED-${Math.floor(100000 + Math.random() * 900000)}`
          }
        ]);

      if (doctorError) {
        console.error(`❌ Error en tabla "doctors" para ${user.email}:`, doctorError.message);
      }
    } else if (user.role === 'PATIENT') {
      const { error: patientError } = await supabase
        .from('patients')
        .insert([
          {
            id: userId,
            dni: user.dni || '1799999999',
            phone: '0999999999',
            date_of_birth: '1995-01-01'
          }
        ]);

      if (patientError) {
        console.error(`❌ Error en tabla "patients" para ${user.email}:`, patientError.message);
      }
    }
  }

  console.log('\n🎉 ¡PROCESO FINALIZADO CON ÉXITO ABSOLUTO! 🎉');
  console.log('Todo el sistema Lupsi ha sido restablecido con la estructura e integrantes correctos.');
  console.log('Todas las cuentas tienen la contraseña: Password123!');
}

seedEverything().catch(console.error);
