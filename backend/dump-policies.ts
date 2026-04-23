import { Client } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();

async function run() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  await client.connect();
  const res = await client.query(`
    SELECT schemaname, tablename, policyname, roles, cmd, qual, with_check 
    FROM pg_policies 
    WHERE schemaname = 'public';
  `);
  
  console.log(JSON.stringify(res.rows, null, 2));
  await client.end();
}

run().catch(console.error);
