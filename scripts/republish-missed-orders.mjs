// Republish orders whose logistics handoff never landed.
//
//   npm run logistics:republish
//   npm run logistics:republish -- --older-than 15 --limit 100
//   npm run logistics:republish -- --dry-run
//
// ── Why this is needed ──
//
// `notifyLogistics` swallows its own failures, deliberately: a
// logistics outage must never fail a customer's checkout, because the
// order exists and the stock is held either way.
//
// The cost of that choice is that an order can end up placed, paid and
// reserved, which the logistics system has never heard of. Nobody
// would be dispatched, and nothing would say so. This finds them.
//
// Safe to run repeatedly — publishing is idempotent on the order id,
// so an order that did land simply returns its existing tracking id.
//
// Run it from cron, or by hand after an incident.

import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

// Load .env without a dependency. Does not overwrite a variable already
// set, so CI and the shell win over a stale file.
for (const file of [".env.local", ".env"]) {
  const path = join(ROOT, file);
  if (!existsSync(path)) continue;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq < 1) continue;
    const key = t.slice(0, eq).trim();
    let val = t.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

const args = process.argv.slice(2);
const flag = (n) => args.includes(`--${n}`);
const value = (n, d) => {
  const i = args.indexOf(`--${n}`);
  return i >= 0 && args[i + 1] ? Number(args[i + 1]) : d;
};

const olderThan = value("older-than", 5);
const limit = value("limit", 50);

const { republishMissedOrders } = await import("../src/services/logistics.ts");

if (flag("dry-run")) {
  // Listing without sending still needs the service-role key, so this
  // is a rehearsal of the real thing rather than a cheaper substitute.
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.error(
      "\n  Needs SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY " +
      "(server-side only — never NEXT_PUBLIC_).\n");
    process.exit(1);
  }

  const { createClient } = await import("@supabase/supabase-js");
  const admin = createClient(url, key);

  const cutoff = new Date(Date.now() - olderThan * 60_000).toISOString();
  const { data, error } = await admin
    .from("orders")
    .select("id, created_at, fulfilment_location_code")
    .eq("status", "PAID")
    .is("logistics_tracking_id", null)
    .not("delivery_lat", "is", null)
    .lt("created_at", cutoff)
    .order("created_at", { ascending: true })
    .limit(limit);

  if (error) { console.error(error.message); process.exit(1); }

  console.log(`\n  ${data.length} order(s) would be republished:\n`);
  for (const o of data) console.log(`    ${o.id}  ${o.created_at}  ${o.fulfilment_location_code}`);
  console.log();
  process.exit(0);
}

let results;
try {
  results = await republishMissedOrders(olderThan, limit);
} catch (e) {
  // A missing environment variable is an operator's problem to fix, not
  // a stack trace to decipher.
  console.error(`\n  ${e instanceof Error ? e.message : e}\n`);
  process.exit(1);
}

if (results.length === 0) {
  console.log("\n  Nothing to republish — every placed order has a tracking id.\n");
  process.exit(0);
}

console.log(`\n  Republished ${results.length} order(s):\n`);
for (const r of results) {
  console.log(`    ${r.ok ? "ok  " : "FAIL"}  ${r.orderId}  ${r.detail ?? ""}`);
}

const failed = results.filter((r) => !r.ok).length;
console.log(`\n  ${results.length - failed} succeeded, ${failed} failed.\n`);
process.exit(failed ? 1 : 0);
