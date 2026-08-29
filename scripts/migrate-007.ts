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
      resolve(__dirname, '../supabase/migrations/00007_fix_alimento_rls.sql'),
      'utf-8'
    );

    await client.query(sql);
    console.log('✅ Migration 00007 applied successfully');
  } catch (err: any) {
    console.error('❌ Migration 00007 failed:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
