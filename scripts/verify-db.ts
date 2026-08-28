import { Client } from "pg";

const client = new Client({
  connectionString:
    "postgresql://postgres:!Mrlol1572608@db.khaxithzlhsctkvdxllp.supabase.co:5432/postgres",
});

async function main() {
  await client.connect();
  console.log("✅ Connected to database");

  // Check protocols
  const protocols = await client.query("SELECT id, nome FROM protocolo ORDER BY nome");
  console.log("\n📋 Protocolos criados:");
  protocols.rows.forEach((r) => console.log(`  - ${r.nome} (${r.id})`));

  // Check indexes
  const indexes = await client.query(`
    SELECT indexname FROM pg_indexes
    WHERE schemaname = 'public'
    ORDER BY tablename, indexname
  `);
  console.log(`\n📊 Total indexes: ${indexes.rows.length}`);

  // Check RLS policies
  const policies = await client.query(`
    SELECT tablename, policyname FROM pg_policies
    WHERE schemaname = 'public'
    ORDER BY tablename
  `);
  console.log(`\n🔒 Total RLS policies: ${policies.rows.length}`);

  // Check functions
  const functions = await client.query(`
    SELECT routine_name FROM information_schema.routines
    WHERE routine_schema = 'public'
    ORDER BY routine_name
  `);
  console.log(`\n⚡ Functions: ${functions.rows.length}`);
  functions.rows.forEach((r) => console.log(`  - ${r.routine_name}`));

  await client.end();
}

main().catch(console.error);
