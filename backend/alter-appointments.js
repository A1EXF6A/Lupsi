const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.qlhmezyxhptvpyiepluw:LupsiProject2026@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true',
});

async function run() {
  await client.connect();
  try {
    console.log("Adding columns to public.appointments...");
    
    // Add columns if they do not exist
    await client.query(`
      ALTER TABLE public.appointments 
      ADD COLUMN IF NOT EXISTS appointment_type VARCHAR(255),
      ADD COLUMN IF NOT EXISTS specialty VARCHAR(255),
      ADD COLUMN IF NOT EXISTS price NUMERIC(10, 2) DEFAULT 15.00;
    `);
    
    console.log("Success! Columns added successfully.");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await client.end();
  }
}

run();
