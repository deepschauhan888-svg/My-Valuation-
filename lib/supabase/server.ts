import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Use inside Server Components, Server Actions, and Route Handlers only.
 * Respects the signed-in user's session via cookies, so RLS policies
 * (is_admin(), etc.) apply exactly as they would client-side.
 */
export function createClient() {
  const cookieStore = cookies();

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
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Called from a Server Component render — safe to ignore because
            // middleware.ts refreshes the session on every request anyway.
          }
        },
      },
    }
  );
}
