const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.qlhmezyxhptvpyiepluw:LupsiProject2026@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true',
});

async function run() {
  await client.connect();
  try {
    console.log("Notifying PostgREST to reload schema cache...");
    await client.query("NOTIFY pgrst, 'reload schema';");
    console.log("✅ Schema cache reloaded successfully in Supabase!");
  } catch (err) {
    console.error("❌ Error reloading schema:", err);
  } finally {
    await client.end();
  }
}

run();
