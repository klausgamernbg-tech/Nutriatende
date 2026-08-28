import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// Load env vars from .env.local
const envPath = path.resolve("apps/web/.env.local");
const envContent = fs.readFileSync(envPath, "utf8");

function getEnv(key: string): string {
  const match = envContent.match(new RegExp(`^${key}=(.+)$`, "m"));
  if (!match) throw new Error(`${key} not found in .env.local`);
  return match[1].trim();
}

const supabaseUrl = getEnv("NEXT_PUBLIC_SUPABASE_URL");
const serviceRoleKey = getEnv("SUPABASE_SERVICE_ROLE_KEY");

console.log("URL:", supabaseUrl);
console.log("Service key starts with:", serviceRoleKey.substring(0, 20) + "...");

const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  // Test 1: Can we read clinica table?
  console.log("\n--- Test 1: Read clinica ---");
  const { data: clinicas, error: readErr } = await admin
    .from("clinica")
    .select("id, nome")
    .limit(5);

  if (readErr) {
    console.error("READ ERROR:", readErr.message, readErr.code);
  } else {
    console.log("Clinicas:", clinicas);
  }

  // Test 2: Can we insert into clinica?
  console.log("\n--- Test 2: Insert clinica ---");
  const { data: newClinica, error: insertErr } = await admin
    .from("clinica")
    .insert({ nome: "Teste Admin Client" })
    .select("id, nome")
    .single();

  if (insertErr) {
    console.error("INSERT ERROR:", insertErr.message, insertErr.code);
  } else {
    console.log("Created:", newClinica);
    // Clean up
    await admin.from("clinica").delete().eq("id", newClinica.id);
    console.log("Cleaned up test record");
  }

  // Test 3: List all tables
  console.log("\n--- Test 3: Check tables ---");
  const { data: tables } = await admin.rpc("exec_sql", {
    query: "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name",
  }).catch(() => ({ data: null, error: { message: "rpc not available" } }));
  
  console.log("Tables query result:", tables ? "OK" : "RPC not available");
}

main().catch(console.error);
