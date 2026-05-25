const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.qlhmezyxhptvpyiepluw:LupsiProject2026@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true',
});

async function run() {
  await client.connect();
  try {
    // 1. Query triggers on appointments
    const appTriggers = await client.query(`
      SELECT tgname, tgenabled, tgtype, tgdeferrable
      FROM pg_trigger t
      JOIN pg_class c ON c.oid = t.tgrelid
      WHERE c.relname = 'appointments';
    `);
    console.log("\nTriggers on 'appointments':");
    console.table(appTriggers.rows);

    // 2. Query triggers on appointment_payments
    const payTriggers = await client.query(`
      SELECT tgname, tgenabled, tgtype, tgdeferrable
      FROM pg_trigger t
      JOIN pg_class c ON c.oid = t.tgrelid
      WHERE c.relname = 'appointment_payments';
    `);
    console.log("\nTriggers on 'appointment_payments':");
    console.table(payTriggers.rows);

    // 3. Query pg_stat_activity to see if there are any locks or long running queries
    const activity = await client.query(`
      SELECT pid, age(clock_timestamp(), query_start), state, query 
      FROM pg_stat_activity 
      WHERE state != 'idle';
    `);
    console.log("\nCurrently running queries:");
    console.table(activity.rows);

  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.end();
  }
}

run();
