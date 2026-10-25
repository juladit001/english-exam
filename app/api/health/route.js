import { pool, ensureSchema } from "@/lib/db";
import { json } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* Shows whether the server is set up correctly. Never shows secret values. */
export async function GET() {
  const hasDb = !!(process.env.DATABASE_URL || process.env.POSTGRES_URL);
  const s = process.env.AUTH_SECRET || "";
  const out = {
    DATABASE_URL: hasDb ? "set" : "MISSING: connect Neon in Vercel → Storage, then Redeploy",
    AUTH_SECRET: s.length >= 16 ? "set" : s ? "TOO SHORT: use at least 16 characters, then Redeploy" : "MISSING: add it in Environments → Production, then Redeploy",
    SIGNUP_CODE: process.env.SIGNUP_CODE ? "set" : "not set (anyone can sign up)",
    database: "not checked"
  };
  if (hasDb) {
    try { await ensureSchema(); await pool().query("SELECT 1"); out.database = "connected"; }
    catch (e) { out.database = "ERROR: " + (e.code || "") + " " + String(e.message || e).slice(0, 200); }
  }
  const ok = hasDb && s.length >= 16 && out.database === "connected";
  return json({ ok, ...out }, ok ? 200 : 500);
}
