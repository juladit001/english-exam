import { currentUser } from "@/lib/auth";
import { json, fail } from "@/lib/http";
export const runtime = "nodejs";
export async function GET() {
  const u = await currentUser();
  return u ? json({ email: u.email }) : fail("Not signed in.", 401);
}
