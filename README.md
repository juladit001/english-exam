# Road to 20 March

Daily English practice for a retake on 20 March 2027: 100 exam sets (A1–B2, 50 questions each, 4,000 vocabulary words), bilingual explanations (English + Thai), a mistake bank, a grammar guide with 580 practice questions, and word partners (collocations) with 200 more.

- **Frontend:** the exam app in `public/app/` (plain HTML/JS, data in `public/app/sets/`), plus login and sign-up pages in Next.js.
- **Backend:** Next.js API routes on Vercel. Email and password login (bcrypt), sessions in a signed httpOnly cookie, progress stored in Postgres (Neon).
- Answers save as you tap them and again when the tab closes, so you can continue on any device. When two copies differ, the newest one wins.

## Deploy on Vercel (one time)

1. Go to **vercel.com** → sign in with GitHub → **Add New… → Project** → import this repository → **Deploy**. The first deploy fails until steps 2–3 are done; that's expected.
2. In the project, open **Storage → Create Database → Neon (Postgres)** → connect it to this project. This adds `DATABASE_URL` automatically.
3. Open **Settings → Environment Variables** and add:
   - `AUTH_SECRET`: a long random string (for example, run `openssl rand -base64 32`, or type 40+ random characters).
   - `SIGNUP_CODE`: a code only you know. You'll need it once to create your account, and it stops strangers from signing up.
4. Go to **Deployments** → the latest one → **⋯ → Redeploy**.
5. Open the site → **Create one** → sign up with your email, password and sign-up code.
6. To bring your progress from the Claude page: click **Import progress** and choose `english-progress.json`.

The database tables are created automatically on first use. Every push to `main` deploys again.

## Run locally

```bash
npm install
cp .env.example .env.local   # fill in DATABASE_URL and AUTH_SECRET
npm run dev                  # http://localhost:3000
```

## API

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/auth/register` | `{email, password, code}` → creates the account and signs in |
| POST | `/api/auth/login` | `{email, password}` → signs in |
| POST | `/api/auth/logout` | signs out |
| GET | `/api/auth/me` | current user's email |
| GET | `/api/data` | all saved progress `{items: {key: {v, t}}}` |
| PUT | `/api/data` | save `{items: [{k, v, t}]}`; an older write never overwrites a newer one |
| DELETE | `/api/data` | delete all progress |
