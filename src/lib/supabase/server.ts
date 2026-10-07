import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * SOP-3H-02: 服务端 Supabase 客户端
 *
 * 供 Server Component / Route Handler / Server Action 使用。
 * cookies() 在 Next 16 是 Promise，需 await。
 *
 * setAll 包 try/catch no-op：在 Server Component 中调用 set 会抛错，
 * 但有 middleware 刷新 session 时可忽略（cookie 由 middleware 设置）。
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // 在 Server Component 中调用 set 会抛错；
            // 有 middleware 刷新 session 时可忽略。
          }
        },
      },
    },
  );
}
