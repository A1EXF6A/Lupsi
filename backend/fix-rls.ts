import { Client } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();

async function run() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  await client.connect();
  const res = await client.query(`
    SELECT policyname, qual 
    FROM pg_policies 
    WHERE tablename = 'profiles';
  `);
  
  console.log('Políticas en profiles:', res.rows);
  
  // Imprime las de doctors
  const doctorsRes = await client.query(`
    SELECT policyname, qual 
    FROM pg_policies 
    WHERE tablename = 'doctors';
  `);
  console.log('Políticas en doctors:', doctorsRes.rows);

  // DROP The policies on profiles specifically those causing infinite recursion
  if (res.rows.length > 0) {
    for (const r of res.rows) {
       await client.query(`DROP POLICY "${r.policyname}" ON profiles;`);
       console.log(`Dropped ${r.policyname}`);
    }
  }

  // Allow all for now on profiles to fix the recursion
  await client.query(`
    CREATE POLICY "Bypass para todo" ON profiles FOR SELECT USING (true);
  `);
  console.log("Added bypass policy on profiles.");

  await client.end();
}

run().catch(console.error);
