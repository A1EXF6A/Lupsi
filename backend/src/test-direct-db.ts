import { Client } from 'pg';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '../.env') });

const connectionString = process.env.DATABASE_URL || '';

if (!connectionString) {
  console.error('❌ Error: DATABASE_URL no definida en el .env');
  process.exit(1);
}

const client = new Client({
  connectionString,
  ssl: {
    rejectUnauthorized: false, // Necesario para conexiones externas a Supabase
  },
});

async function testDirectConnection() {
  console.log('⏳ Probando conexión DIRECTA a PostgreSQL (Supabase)...');

  try {
    await client.connect();
    console.log(
      '✅ ¡Conexión establecida con éxito al motor de base de datos!',
    );

    const res = await client.query('SELECT current_database(), now();');
    console.log('📊 Información de sesión:', res.rows[0]);

    await client.end();
    console.log('🎉 Todo funcionando al 100%. Estás listo para el Sprint 2.');
  } catch (err: any) {
    console.error('❌ Error fatal de conexión:', err.message);
    console.error(
      '📋 Sugerencia: Revisa que tu contraseña y el host sean correctos.',
    );
    process.exit(1);
  }
}

testDirectConnection();
