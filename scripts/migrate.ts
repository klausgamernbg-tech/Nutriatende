import { Client } from "pg";
import fs from "fs";

const client = new Client({
  connectionString:
    "postgresql://postgres:!Mrlol1572608@db.khaxithzlhsctkvdxllp.supabase.co:5432/postgres",
});

async function main() {
  await client.connect();
  console.log("✅ Connected to database");

  const sql = fs.readFileSync(
    "supabase/migrations/00001_initial_schema.sql",
    "utf8"
  );
  console.log(`📄 SQL file loaded, ${sql.length} chars`);

  try {
    await client.query(sql);
    console.log("🎉 Migration applied successfully!");
  } catch (err: any) {
    console.error("❌ Migration error:", err.message);
  }

  // Verify tables
  const res = await client.query(`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name
  `);
  console.log("\n📋 Tables created:");
  res.rows.forEach((r) => console.log(`  - ${r.table_name}`));

  await client.end();
}

main().catch(console.error);
