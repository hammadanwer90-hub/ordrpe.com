import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

async function bootstrapAdmin(formData: FormData) {
  "use server";
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("full_name") ?? "Admin").trim();
  const token = String(formData.get("token") ?? "");
  const expectedToken = process.env.ORDRPE_ADMIN_BOOTSTRAP_TOKEN;

  if (!email || !password || !expectedToken || token !== expectedToken) return;

  const admin = createAdminClient();

  let userId: string | null = null;

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName }
  });

  if (created?.user?.id) {
    userId = created.user.id;
  } else if (createError) {
    const { data: usersPage } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const existing = usersPage?.users.find(
      (u) => (u.email ?? "").toLowerCase() === email
    );
    userId = existing?.id ?? null;
  }

  if (!userId) return;

  await admin.from("profiles").upsert({
    id: userId,
    full_name: fullName || "Admin",
    role: "admin",
    subscription_active: true
  });

  revalidatePath("/setup/admin-user");
}

export default function AdminBootstrapPage() {
  const hasBootstrapToken = Boolean(process.env.ORDRPE_ADMIN_BOOTSTRAP_TOKEN);

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <header className="ordrpe-card p-6">
        <h1 className="text-2xl font-bold">Admin Bootstrap</h1>
        <p className="text-muted mt-2 text-sm">
          Create or promote an admin account using your private bootstrap token.
        </p>
      </header>

      {!hasBootstrapToken ? (
        <div className="rounded-xl border border-amber-300/40 bg-amber-950/30 p-5 text-sm text-amber-100">
          Missing <code>ORDRPE_ADMIN_BOOTSTRAP_TOKEN</code>. Add it to environment variables to use this page.
        </div>
      ) : (
        <form action={bootstrapAdmin} className="ordrpe-card space-y-3 p-5">
          <input name="full_name" className="ordrpe-input" placeholder="Admin full name" defaultValue="Admin" required />
          <input name="email" type="email" className="ordrpe-input" placeholder="Admin email" required />
          <input name="password" type="password" className="ordrpe-input" placeholder="Admin password" required />
          <input name="token" type="password" className="ordrpe-input" placeholder="Bootstrap token" required />
          <button type="submit" className="ordrpe-btn">
            Create / Promote Admin
          </button>
        </form>
      )}
    </div>
  );
}
