"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let browser: SupabaseClient | null = null;

export function supa() {
  if (!browser) {
    browser = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
    );
  }
  return browser;
}

export function supaConfigured() {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function callbackUrl() {
  return `${window.location.origin}/auth/callback`;
}
