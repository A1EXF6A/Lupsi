import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '.env') });

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Falta SUPABASE_URL o llaves de acceso.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testLogin() {
  console.log('Testing login for patient@lupsi.com...');
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'patient@lupsi.com',
    password: 'Password123!'
  });

  if (error) {
    console.error('❌ Login failed in Supabase Auth:', error.message);
  } else {
    console.log('✅ Login successful! User ID:', data.user?.id);
  }
}

testLogin().catch(console.error);
