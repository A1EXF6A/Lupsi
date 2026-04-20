import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const dummyDoctors = [
  {
    email: 'dr.house@lupsi.test',
    password: 'Password123!',
    first_name: 'Gregory',
    last_name: 'House',
    specialty: 'Diagnóstico Médico',
    license: 'MED-783921'
  },
  {
    email: 'dra.grey@lupsi.test',
    password: 'Password123!',
    first_name: 'Meredith',
    last_name: 'Grey',
    specialty: 'Cirugía General',
    license: 'MED-102934'
  },
  {
    email: 'dr.strange@lupsi.test',
    password: 'Password123!',
    first_name: 'Stephen',
    last_name: 'Strange',
    specialty: 'Neurología',
    license: 'MED-994432'
  }
];

async function seedDoctors() {
  console.log('🌱 Sembrando profesionales médicos de prueba...');

  for (const doc of dummyDoctors) {
    console.log(`\nProcesando a Dr/a. ${doc.first_name} ${doc.last_name}...`);
    
    // 1. Create User in Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: doc.email,
      password: doc.password,
      email_confirm: true,
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
         console.log(`⚠️ ${doc.email} ya existe en Auth, omitiendo.`);
         continue;
      }
      console.error(`❌ Error en Auth para ${doc.email}:`, authError.message);
      continue;
    }

    const userId = authData.user.id;

    // 2. Create Profile (Role: DOCTOR)
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          id: userId,
          role: 'DOCTOR',
          email: doc.email,
          first_name: doc.first_name,
          last_name: doc.last_name,
        }
      ]);

    if (profileError) {
      console.error(`❌ Error al crear perfil para ${doc.email}:`, profileError.message);
      continue;
    }

    // 3. Create Doctor Record
    const { error: doctorError } = await supabase
      .from('doctors')
      .insert([
        {
          id: userId,
          specialty: doc.specialty,
          medical_license: doc.license
        }
      ]);

    if (doctorError) {
      console.error(`❌ Error al crear médico para ${doc.email}:`, doctorError.message);
      continue;
    }

    console.log(`✅ Doctor ${doc.first_name} ${doc.last_name} creado exitosamente.`);
  }

  console.log('\n🎉 ¡Misión cumplida! Profesionales médicos de ejemplo inyectados en la base de datos.');
}

seedDoctors().catch(console.error);
