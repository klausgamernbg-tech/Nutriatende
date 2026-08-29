import { Client } from 'pg';
import { readFileSync } from 'fs';
import { resolve } from 'path';

async function migrate() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('❌ DATABASE_URL not set');
    process.exit(1);
  }

  const client = new Client({ connectionString: dbUrl });
  await client.connect();

  try {
    const sql = readFileSync(
      resolve(__dirname, '../supabase/migrations/00008_fix_security_definer_warnings.sql'),
      'utf-8'
    );

    console.log('🚀 Applying migration 00008...');
    await client.query(sql);
    console.log('✅ Migration 00008 applied successfully!');
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

migrate();
