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
      resolve(__dirname, '../supabase/migrations/00009_move_functions_to_private_schema.sql'),
      'utf-8'
    );

    await client.query(sql);
    console.log('✅ Migration 00009 applied successfully');
  } catch (err: any) {
    console.error('❌ Migration 00009 failed:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
