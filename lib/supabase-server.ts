import { createClient } from "@supabase/supabase-js";

export type SupaUser = { id: string; email: string; name: string; verified: boolean };

/** Validates a Supabase access token with Supabase's servers. Google logins count as verified. */
export async function verifySupabaseToken(token: string): Promise<SupaUser | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon || !token) return null;
  try {
    const c = createClient(url, anon, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data, error } = await c.auth.getUser(token);
    if (error || !data.user?.email) return null;
    const u = data.user;
    const email = (u.email as string).toLowerCase();
    const providers = (u.app_metadata?.providers || []) as string[];
    const meta = (u.user_metadata || {}) as any;
    return {
      id: u.id,
      email,
      name: String(meta.full_name || meta.name || email.split("@")[0]),
      verified: !!u.email_confirmed_at || providers.includes("google"),
    };
  } catch {
    return null;
  }
}
