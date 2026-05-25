const { Client } = require('pg');
const fs = require('fs');

const client = new Client({
  connectionString: 'postgresql://postgres.qlhmezyxhptvpyiepluw:LupsiProject2026@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true',
});

async function run() {
  await client.connect();
  try {
    const res = await client.query("SELECT id, appointment_id, amount, method, status, receipt_url, paid_at, created_at FROM appointment_payments ORDER BY created_at DESC LIMIT 10;");
    fs.writeFileSync('payments_debug.json', JSON.stringify(res.rows, null, 2));
    console.log("✅ Payments exported to payments_debug.json successfully!");
  } catch (err) {
    fs.writeFileSync('payments_debug.json', JSON.stringify({ error: err.message }, null, 2));
    console.error(err);
  } finally {
    await client.end();
  }
}

run();
