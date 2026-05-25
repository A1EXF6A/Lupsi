const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../backend/.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function setupTestData() {
  console.log('🛠️ Preparando datos de prueba...');

  const testEmail = 'test_patient_stress@example.com';
  const testDoctorEmail = 'test_doctor_stress@example.com';
  const password = 'LupsiProject2026';

  // 1. Crear Paciente en Auth si no existe
  let { data: patientAuth, error: pError } = await supabase.auth.admin.createUser({
    email: testEmail,
    password: password,
    email_confirm: true
  });

  if (pError && pError.message.includes('already registered')) {
    console.log('👤 El paciente de prueba ya existe.');
    const { data: users } = await supabase.auth.admin.listUsers();
    patientAuth = { user: users.users.find(u => u.email === testEmail) };
  } else if (pError) {
    console.error('Error creando paciente auth:', pError);
  }

  // 2. Crear Doctor en Auth si no existe
  let { data: doctorAuth, error: dError } = await supabase.auth.admin.createUser({
    email: testDoctorEmail,
    password: password,
    email_confirm: true
  });

  if (dError && dError.message.includes('already registered')) {
    console.log('👨‍⚕️ El doctor de prueba ya existe.');
    const { data: users } = await supabase.auth.admin.listUsers();
    doctorAuth = { user: users.users.find(u => u.email === testDoctorEmail) };
  } else if (dError) {
    console.error('Error creando doctor auth:', dError);
  }

  const patientId = patientAuth.user.id;
  const doctorId = doctorAuth.user.id;

  // 3. Asegurar perfiles y roles
  await supabase.from('profiles').upsert([
    { id: patientId, email: testEmail, role: 'PATIENT', first_name: 'Test', last_name: 'Patient' },
    { id: doctorId, email: testDoctorEmail, role: 'DOCTOR', first_name: 'Test', last_name: 'Doctor' }
  ]);

  await supabase.from('patients').upsert([{ id: patientId, dni: '1721522437' }]);
  await supabase.from('doctors').upsert([{ id: doctorId, specialty: 'General' }]);

  console.log(`✅ Datos listos.`);
  console.log(`Paciente ID: ${patientId}`);
  console.log(`Doctor ID: ${doctorId}`);
}

setupTestData();
