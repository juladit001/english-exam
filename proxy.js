import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const COOKIE = "ee_session";
async function signedIn(req) {
  const t = req.cookies.get(COOKIE)?.value;
  const s = process.env.AUTH_SECRET;
  if (!t || !s) return false;
  try { await jwtVerify(t, new TextEncoder().encode(s)); return true; } catch { return false; }
}

export async function proxy(req) {
  const { pathname } = req.nextUrl;
  const ok = await signedIn(req);
  if (pathname === "/") return NextResponse.redirect(new URL(ok ? "/app" : "/login", req.url));
  if (pathname.startsWith("/app") && !ok) return NextResponse.redirect(new URL("/login", req.url));
  if ((pathname === "/login" || pathname === "/register") && ok) return NextResponse.redirect(new URL("/app", req.url));
  return NextResponse.next();
}
export const config = { matcher: ["/", "/app", "/app/:path*", "/login", "/register"] };
