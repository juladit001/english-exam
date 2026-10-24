import { q } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { json, fail, body } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const KEY = /^rt20-[A-Za-z0-9_-]{1,40}$/;
const MAX_VALUE = 256 * 1024;

/* All of the signed-in user's saved progress: { items: { key: { v, t } } } */
export async function GET() {
  const u = await currentUser();
  if (!u) return fail("Not signed in.", 401);
  const r = await q("SELECT key, value, updated_ms FROM progress WHERE user_id = $1", [u.id]);
  const items = {};
  for (const row of r.rows) items[row.key] = { v: row.value, t: Number(row.updated_ms) };
  return json({ items });
}

/* Save one or more keys: { items: [{ k, v, t }] }. The newest copy wins: an older write never replaces a newer one. */
export async function PUT(req) {
  const u = await currentUser();
  if (!u) return fail("Not signed in.", 401);
  const b = await body(req);
  const list = Array.isArray(b?.items) ? b.items : null;
  if (!list || !list.length || list.length > 300) return fail("Nothing to save.");
  let saved = 0;
  for (const it of list) {
    const k = String(it?.k || "");
    const t = Math.floor(Number(it?.t) || Date.now());
    if (!KEY.test(k) || it.v === undefined) return fail(`Invalid key: ${k}`);
    const text = JSON.stringify(it.v);
    if (text.length > MAX_VALUE) return fail(`Value too large: ${k}`, 413);
    const r = await q(
      `INSERT INTO progress (user_id, key, value, updated_ms) VALUES ($1, $2, $3::jsonb, $4)
       ON CONFLICT (user_id, key) DO UPDATE SET value = EXCLUDED.value, updated_ms = EXCLUDED.updated_ms
       WHERE progress.updated_ms <= EXCLUDED.updated_ms`,
      [u.id, k, text, t]
    );
    saved += r.rowCount;
  }
  return json({ ok: true, saved });
}

/* Delete all progress (used by "Reset all progress"). */
export async function DELETE() {
  const u = await currentUser();
  if (!u) return fail("Not signed in.", 401);
  await q("DELETE FROM progress WHERE user_id = $1", [u.id]);
  return json({ ok: true });
}
