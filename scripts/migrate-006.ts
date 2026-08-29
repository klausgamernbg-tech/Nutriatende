import { Client } from 'pg';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('Missing DATABASE_URL env var');
  process.exit(1);
}

async function main() {
  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();

  const sql = readFileSync(
    resolve(__dirname, '../supabase/migrations/00006_security_and_performance_fixes.sql'),
    'utf-8'
  );

  console.log('Running migration 00006: security and performance fixes...');
  
  try {
    await client.query(sql);
    console.log('✅ Migration 00006 applied successfully!');
  } catch (err: any) {
    console.error('❌ Migration error:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
