"use client";
import { useState } from "react";

export default function AuthForm({ mode }) {
  const reg = mode === "register";
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault();
    setErr(""); setBusy(true);
    const f = new FormData(e.currentTarget);
    if (reg && f.get("password") !== f.get("password2")) { setErr("The two passwords don't match. รหัสผ่านไม่ตรงกัน"); setBusy(false); return; }
    try {
      const r = await fetch(`/api/auth/${reg ? "register" : "login"}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: f.get("email"), password: f.get("password"), code: f.get("code") || "" })
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) { setErr(d.error || "Something went wrong. Please try again."); setBusy(false); return; }
      window.location.href = "/app";
    } catch { setErr("Can't reach the server. Check your internet. ติดต่อเซิร์ฟเวอร์ไม่ได้"); setBusy(false); }
  }
  return (
    <main className="auth">
      <form className="card" onSubmit={submit}>
        <span className="eyebrow">100 sets · A1 → B2</span>
        <h1>Road to 20 March</h1>
        <p className="note">{reg ? "Create your account. Your progress is saved to it on every device. สร้างบัญชีเพื่อบันทึกความคืบหน้า" : "Log in to continue your practice. เข้าสู่ระบบเพื่อฝึกต่อ"}</p>
        {err && <div className="err" role="alert">{err}</div>}
        <label>Email<input name="email" type="email" autoComplete="email" required /></label>
        <label>Password · รหัสผ่าน<input name="password" type="password" minLength={reg ? 8 : undefined} autoComplete={reg ? "new-password" : "current-password"} required /></label>
        {reg && <label>Repeat password · ยืนยันรหัสผ่าน<input name="password2" type="password" minLength={8} autoComplete="new-password" required /></label>}
        {reg && <label>Sign-up code (if you set one) · รหัสลงทะเบียน<input name="code" type="text" autoComplete="off" /></label>}
        <button className="btn" disabled={busy}>{busy ? "Please wait…" : reg ? "Create account" : "Log in"}</button>
        <p className="note">{reg ? <>Already have an account? <a href="/login">Log in</a></> : <>No account yet? <a href="/register">Create one</a></>}</p>
      </form>
    </main>
  );
}
