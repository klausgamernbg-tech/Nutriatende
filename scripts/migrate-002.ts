import { Client } from "pg";
import fs from "fs";
import path from "path";

// Load DATABASE_URL from .env.local
const envPath = path.resolve("apps/web/.env.local");
const envContent = fs.readFileSync(envPath, "utf8");
const dbMatch = envContent.match(/^DATABASE_URL=(.+)$/m);
if (!dbMatch) throw new Error("DATABASE_URL not found in .env.local");

const client = new Client({
  connectionString: dbMatch[1].trim(),
});

async function main() {
  await client.connect();
  console.log("✅ Connected to database");

  const sql = fs.readFileSync(
    "supabase/migrations/00002_rls_insert_policies.sql",
    "utf8"
  );
  console.log(`📄 Migration 00002 loaded, ${sql.length} chars`);

  try {
    await client.query(sql);
    console.log("🎉 Migration 00002 applied successfully!");
  } catch (err: any) {
    console.error("❌ Migration error:", err.message);
  }

  // Verify new policies
  const policies = await client.query(`
    SELECT tablename, policyname, cmd FROM pg_policies
    WHERE schemaname = 'public' AND cmd = 'INSERT'
    ORDER BY tablename
  `);
  console.log(`\n📋 INSERT policies now:`);
  policies.rows.forEach((r) =>
    console.log(`  - ${r.tablename}: ${r.policyname}`)
  );

  await client.end();
}

main().catch(console.error);
