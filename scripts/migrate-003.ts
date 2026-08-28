import { Client } from "pg";
import fs from "fs";
import path from "path";

const envPath = path.resolve("apps/web/.env.local");
const envContent = fs.readFileSync(envPath, "utf8");
const dbMatch = envContent.match(/^DATABASE_URL=(.+)$/m);
if (!dbMatch) throw new Error("DATABASE_URL not found");

const client = new Client({ connectionString: dbMatch[1].trim() });

async function main() {
  await client.connect();
  console.log("✅ Connected");

  const sql = fs.readFileSync("supabase/migrations/00003_fix_rls_usuario_sistema.sql", "utf8");

  try {
    await client.query(sql);
    console.log("🎉 Migration 00003 applied!");
  } catch (err: any) {
    console.error("❌ Error:", err.message);
  }

  // Verify
  const { rows } = await client.query(`
    SELECT policyname, cmd FROM pg_policies
    WHERE tablename = 'usuario_sistema' AND schemaname = 'public'
    ORDER BY policyname
  `);
  console.log("\nusuario_sistema policies:");
  rows.forEach((r) => console.log(`  - ${r.policyname} (${r.cmd})`));

  await client.end();
}

main().catch(console.error);
