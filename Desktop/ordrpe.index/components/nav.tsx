import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AccountDropdown } from "@/components/account-dropdown";
import type { Role } from "@/lib/types";

export async function Nav() {
  let userEmail: string | null = null;
  let role: Role | null = null;
  let dashboardHref: "/admin" | "/vendor" | "/account/orders" = "/account/orders";
  try {
    const supabase = await createClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (user) {
      userEmail = user.email ?? null;
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      role = (profile?.role as Role | null) ?? null;
      if (role === "admin") {
        dashboardHref = "/admin";
      } else if (role === "vendor") {
        dashboardHref = "/vendor";
      }
    }
  } catch {
    // Keep nav usable even if backend config is unavailable.
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-black/10 bg-[#1a1008]/95 shadow-[0_4px_16px_rgba(0,0,0,0.14)] backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between md:py-4">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="text-xl font-semibold tracking-[0.14em] text-white md:text-2xl">
            ORDR<span className="text-[#a97c3a]">PE</span>
          </Link>
          {!userEmail ? (
            <Link href="/login" className="inline-flex min-h-9 items-center rounded-full border border-white/20 px-3 py-1 text-[11px] uppercase tracking-[0.1em] text-white/85 hover:border-white/45 hover:text-white">
              Login
            </Link>
          ) : (
            <span className="inline-flex min-h-9 max-w-[55vw] items-center overflow-hidden text-ellipsis whitespace-nowrap rounded-full border border-white/20 px-3 py-1 text-[10px] tracking-[0.08em] text-white/85 md:max-w-none">
              {userEmail}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] uppercase tracking-[0.12em] text-white/75 md:gap-4">
          <Link href="/" className="inline-flex min-h-9 items-center hover:text-white">
            Home
          </Link>
          <Link href="/instock" className="inline-flex min-h-9 items-center hover:text-white">
            In Stock
          </Link>
          {userEmail && (
            <AccountDropdown role={role} dashboardHref={dashboardHref} />
          )}
        </div>
      </div>
    </nav>
  );
}
