// One-off migration runner. Usage:
//   node scripts/run-migrations.mjs <path-to-sql>
// Connection comes from env: PGHOST, PGUSER, PGPASSWORD, PGDATABASE, PGPORT.
import pg from "pg";
import { readFileSync } from "node:fs";

const sqlPath = process.argv[2] ?? "supabase/migrations/RUN_ALL.sql";
const sql = readFileSync(sqlPath, "utf8");

const ref = process.env.SUPABASE_REF;
const password = process.env.PGPASSWORD;
const region = process.env.SUPABASE_REGION ?? "us-west-2";

// Candidate connection targets (pooler is IPv4-friendly; direct is fallback).
const candidates = [
  { host: `aws-0-${region}.pooler.supabase.com`, port: 5432, user: `postgres.${ref}` },
  { host: `aws-1-${region}.pooler.supabase.com`, port: 5432, user: `postgres.${ref}` },
  { host: `db.${ref}.supabase.co`, port: 5432, user: "postgres" },
];

let lastErr;
for (const c of candidates) {
  const client = new pg.Client({
    host: c.host,
    port: c.port,
    user: c.user,
    password,
    database: "postgres",
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000,
  });
  try {
    process.stdout.write(`Connecting to ${c.host} as ${c.user} … `);
    await client.connect();
    console.log("connected.");
    await client.query(sql);
    console.log("✅ Migration applied successfully.");
    await client.end();
    process.exit(0);
  } catch (e) {
    lastErr = e;
    console.log(`failed: ${e.message}`);
    try { await client.end(); } catch {}
  }
}
console.error("\n❌ All connection attempts failed.");
console.error(lastErr?.message);
process.exit(1);
