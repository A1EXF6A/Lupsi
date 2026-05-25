const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../backend/.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function findUsers() {
  console.log('--- BUSCANDO DOCTORES ---');
  const { data: doctors, error: dError } = await supabase
    .from('doctors')
    .select('id, specialty, profiles(first_name, last_name, email)')
    .limit(3);
  
  if (dError) console.error('Error doctores:', dError);
  else console.log(JSON.stringify(doctors, null, 2));

  console.log('--- BUSCANDO PACIENTES ---');
  const { data: patients, error: pError } = await supabase
    .from('patients')
    .select('id, dni, profiles(first_name, last_name, email)')
    .limit(3);
    
  if (pError) console.error('Error pacientes:', pError);
  else console.log(JSON.stringify(patients, null, 2));
}

findUsers();
