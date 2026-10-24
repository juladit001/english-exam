import { NextResponse } from "next/server";
export const json = (data, status = 200) => NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });
export const fail = (message, status = 400) => json({ error: message }, status);
export async function body(req) { try { return await req.json(); } catch { return null; } }
