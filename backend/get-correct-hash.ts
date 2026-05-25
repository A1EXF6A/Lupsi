import { createClient } from '@supabase/supabase-js';
import { Client } from 'pg';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '.env') });

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const dbUrl = process.env.DATABASE_URL || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function getHash() {
  console.log('⏳ Conectando a Supabase...');
  
  // 1. Limpiar usuario anterior si existe
  const pgClient = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
  });
  await pgClient.connect();
  await pgClient.query("DELETE FROM auth.users WHERE email = 'testuser@lupsi.com';");

  // 2. Crear usuario temporal vía API Oficial de Supabase
  console.log('⏳ Creando usuario de prueba temporario...');
  const { data, error } = await supabase.auth.admin.createUser({
    email: 'testuser@lupsi.com',
    password: 'Password123!',
    email_confirm: true
  });

  if (error) {
    console.error('❌ Error al crear usuario de prueba:', error.message);
    await pgClient.end();
    return;
  }

  // 3. Consultar el hash exacto en la base de datos
  console.log('⏳ Consultando el hash generado...');
  const res = await pgClient.query("SELECT encrypted_password FROM auth.users WHERE email = 'testuser@lupsi.com';");
  const hash = res.rows[0]?.encrypted_password;

  console.log('\n======================================================');
  console.log('✅ HASH ENCONTRADO EN TU SUPABASE PARA Password123!:');
  console.log(hash);
  console.log('======================================================\n');

  // Limpiar
  await pgClient.query("DELETE FROM auth.users WHERE email = 'testuser@lupsi.com';");
  await pgClient.end();
}

getHash().catch(console.error);
