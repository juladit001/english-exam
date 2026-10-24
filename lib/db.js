import pg from "pg";

const g = globalThis;
function makePool() {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  const local = /localhost|127\.0\.0\.1/.test(url);
  return new pg.Pool({
    connectionString: url,
    ssl: local ? false : { rejectUnauthorized: false },
    max: 3,
    idleTimeoutMillis: 10000
  });
}
export function pool() {
  if (!g.__pgPool) g.__pgPool = makePool();
  return g.__pgPool;
}

let ready = null;
/* Creates the tables the first time the app talks to the database, so no manual setup is needed. */
export function ensureSchema() {
  if (!ready) {
    ready = pool().query(`
      CREATE TABLE IF NOT EXISTS users (
        id BIGSERIAL PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      CREATE TABLE IF NOT EXISTS progress (
        user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        key TEXT NOT NULL,
        value JSONB NOT NULL,
        updated_ms BIGINT NOT NULL,
        PRIMARY KEY (user_id, key)
      );
    `).catch((e) => { ready = null; throw e; });
  }
  return ready;
}

export async function q(text, params) {
  await ensureSchema();
  return pool().query(text, params);
}
