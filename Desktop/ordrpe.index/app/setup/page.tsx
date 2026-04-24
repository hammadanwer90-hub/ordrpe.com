import { missingPublicSupabaseEnv } from "@/lib/supabase/env";

export default function SetupPage() {
  const missing = missingPublicSupabaseEnv();

  return (
    <div className="mx-auto max-w-3xl rounded-xl border border-amber-300/40 bg-amber-950/30 p-6 text-amber-100">
      <h1 className="text-2xl font-bold">Supabase Setup Required</h1>
      <p className="mt-2 text-sm">
        This app is deployed, but required Supabase environment variables are missing.
      </p>
      <ul className="mt-3 list-disc pl-5 text-sm">
        {missing.map((name) => (
          <li key={name}>
            <code>{name}</code>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-sm">
        Add them in Vercel Project Settings, then redeploy production.
      </p>
      <p className="mt-4 text-sm">
        After env setup, you can bootstrap admin at <code>/setup/admin-user</code>.
      </p>
    </div>
  );
}
