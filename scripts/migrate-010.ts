import { Client } from 'pg';
import { readFileSync } from 'fs';
import { resolve } from 'path';

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  await client.connect();

  try {
    const sql = readFileSync(
      resolve(__dirname, '../supabase/migrations/00010_make_medidas_consulta_id_nullable.sql'),
      'utf-8'
    );

    await client.query(sql);
    console.log('✅ Migration 00010 applied successfully');
  } catch (err: any) {
    console.error('❌ Migration 00010 failed:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
