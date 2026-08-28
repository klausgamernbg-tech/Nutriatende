import { Client } from "pg";
import { readFileSync } from "fs";
import { resolve } from "path";

const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://postgres:!Mrlol1572608@db.khaxithzlhsctkvdxllp.supabase.co:5432/postgres";

async function main() {
  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();

  try {
    const sql = readFileSync(
      resolve(__dirname, "../supabase/migrations/00004_alimento_table.sql"),
      "utf8"
    );
    await client.query(sql);
    console.log("✅ Migration 00004 applied successfully");

    // Verify
    const { rows } = await client.query(
      "SELECT COUNT(*) as count FROM alimento"
    );
    console.log(`   Alimentos seedados: ${rows[0].count}`);
  } catch (err: any) {
    console.error("❌ Migration failed:", err.message);
  } finally {
    await client.end();
  }
}

main();
