import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Cargamos el .env desde la carpeta backend
dotenv.config({ path: resolve(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error(
    '❌ Error: SUPABASE_URL o SUPABASE_ANON_KEY no están definidas en el .env',
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('⏳ Probando conexión a Supabase...');
  console.log(`🔗 URL: ${supabaseUrl}`);

  // Intentamos leer de la tabla 'profiles' que definimos en el schema.sql
  const { error } = await supabase
    .from('profiles')
    .select('count', { count: 'exact', head: true });

  if (error) {
    if (error.code === 'PGRST116') {
      // Esto significa que la tabla existe pero está vacía (común al inicio)
      console.log(
        '✅ Conexión exitosa. La tabla "profiles" existe pero no tiene registros aún.',
      );
    } else {
      console.error('❌ Error de conexión:', error.message);
      console.error('Detalles:', error);
    }
  } else {
    console.log('✅ ¡Conexión exitosa! Supabase responde correctamente.');
    console.log('📊 Estado de la tabla "profiles": Conexión establecida.');
  }
}

testConnection().catch((err: unknown) => {
  console.error('Fatal error in connection test:', err);
  process.exit(1);
});
