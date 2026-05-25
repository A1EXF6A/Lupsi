const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.qlhmezyxhptvpyiepluw:LupsiProject2026@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true',
});

async function check() {
  await client.connect();
  try {
    const res = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'appointment_payments';
    `);
    console.log("appointment_payments schema:");
    console.table(res.rows);
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.end();
  }
}

check();
