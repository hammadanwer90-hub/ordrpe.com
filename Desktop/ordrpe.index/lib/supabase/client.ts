import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv, missingPublicSupabaseEnv } from "@/lib/supabase/env";

export function createClient() {
  const { url, anonKey } = getSupabaseEnv();
  if (!url || !anonKey) {
    throw new Error(`Missing Supabase env vars: ${missingPublicSupabaseEnv().join(", ")}`);
  }

  return createBrowserClient(
    url,
    anonKey
  );
}
