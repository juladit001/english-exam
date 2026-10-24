import bcrypt from "bcryptjs";
import { q } from "@/lib/db";
import { createSession } from "@/lib/auth";
import { json, fail, body } from "@/lib/http";

export const runtime = "nodejs";
const DUMMY = bcrypt.hashSync("not-a-real-password", 10);

export async function POST(req) {
  const b = await body(req);
  if (!b) return fail("Invalid request.");
  const email = String(b.email || "").trim().toLowerCase();
  const password = String(b.password || "");
  try {
    const r = await q("SELECT id, email, password_hash FROM users WHERE email = $1", [email]);
    const u = r.rows[0];
    const ok = u ? await bcrypt.compare(password, u.password_hash) : await bcrypt.compare(password, DUMMY);
    if (!u || !ok) return fail("Wrong email or password.", 401);
    await createSession(u);
    return json({ ok: true, email: u.email });
  } catch (e) {
    console.error(e);
    return fail("Could not log in. Please try again.", 500);
  }
}
