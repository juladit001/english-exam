import bcrypt from "bcryptjs";
import { q } from "@/lib/db";
import { createSession } from "@/lib/auth";
import { json, fail, body } from "@/lib/http";

export const runtime = "nodejs";
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req) {
  const b = await body(req);
  if (!b) return fail("Invalid request.");
  const email = String(b.email || "").trim().toLowerCase();
  const password = String(b.password || "");
  const code = String(b.code || "");
  if (process.env.SIGNUP_CODE && code !== process.env.SIGNUP_CODE) return fail("The sign-up code is not correct.", 403);
  if (!EMAIL.test(email) || email.length > 200) return fail("Please enter a valid email address.");
  if (password.length < 8 || password.length > 200) return fail("Password must be at least 8 characters.");
  const hash = await bcrypt.hash(password, 10);
  try {
    const r = await q("INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email", [email, hash]);
    await createSession(r.rows[0]);
    return json({ ok: true, email });
  } catch (e) {
    if (e.code === "23505") return fail("An account with this email already exists. Please log in.", 409);
    console.error(e);
    return fail("Could not create the account. Please try again.", 500);
  }
}
