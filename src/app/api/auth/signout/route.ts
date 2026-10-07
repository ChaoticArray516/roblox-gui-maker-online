import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * SOP-3H-03: 登出
 *
 * POST /api/auth/signout → signOut() → 303 /auth/login
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();

  const { origin } = new URL(request.url);
  return NextResponse.redirect(`${origin}/auth/login`, { status: 303 });
}
