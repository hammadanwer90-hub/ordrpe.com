"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import type { Role } from "@/lib/types";

type Props = {
  role: Role | null;
  dashboardHref: "/admin" | "/vendor" | "/account/orders";
};

export function AccountDropdown({ role, dashboardHref }: Props) {
  const detailsRef = useRef<HTMLDetailsElement | null>(null);

  useEffect(() => {
    function closeDropdown() {
      detailsRef.current?.removeAttribute("open");
    }

    function onPointerDown(event: PointerEvent) {
      const root = detailsRef.current;
      if (!root || !root.hasAttribute("open")) return;
      if (event.target instanceof Node && !root.contains(event.target)) {
        closeDropdown();
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeDropdown();
    }

    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <details ref={detailsRef} className="nav-account-dropdown group relative">
      <summary className="inline-flex min-h-9 cursor-pointer list-none items-center rounded-full border border-white/25 px-3 py-1 hover:border-white/50 hover:text-white">
        Account & Lists
      </summary>
      <div className="nav-account-menu absolute right-0 top-full mt-2 w-56 rounded-xl border border-[#3a2b1f] bg-[#20140a] p-2 text-[11px] uppercase tracking-[0.1em] text-white/85 shadow-[0_12px_28px_rgba(0,0,0,0.28)]">
        <Link href={dashboardHref} className="block rounded-md px-3 py-2 hover:bg-white/10 hover:text-white">
          {role === "admin" || role === "vendor" ? "Dashboard" : "My Orders"}
        </Link>
        {role === "customer" && (
          <>
            <Link href="/account/preorders" className="block rounded-md px-3 py-2 hover:bg-white/10 hover:text-white">
              My Pre-Orders
            </Link>
            <Link href="/account/products" className="block rounded-md px-3 py-2 hover:bg-white/10 hover:text-white">
              Product Requests
            </Link>
          </>
        )}
        {role === "vendor" && (
          <>
            <Link href="/vendor/products" className="block rounded-md px-3 py-2 hover:bg-white/10 hover:text-white">
              Inventory
            </Link>
            <Link href="/vendor/orders" className="block rounded-md px-3 py-2 hover:bg-white/10 hover:text-white">
              Orders
            </Link>
            <Link href="/vendor/wallet" className="block rounded-md px-3 py-2 hover:bg-white/10 hover:text-white">
              Wallet
            </Link>
          </>
        )}
        {role === "admin" && (
          <>
            <Link href="/admin/orders" className="block rounded-md px-3 py-2 hover:bg-white/10 hover:text-white">
              Logistics
            </Link>
            <Link href="/admin/finance" className="block rounded-md px-3 py-2 hover:bg-white/10 hover:text-white">
              Finance
            </Link>
            <Link href="/admin/vendors" className="block rounded-md px-3 py-2 hover:bg-white/10 hover:text-white">
              Vendors
            </Link>
            <Link href="/admin/reviews" className="block rounded-md px-3 py-2 hover:bg-white/10 hover:text-white">
              Reviews
            </Link>
          </>
        )}
        <div className="my-1 border-t border-white/15" />
        <Link href="/logout" className="block rounded-md px-3 py-2 hover:bg-white/10 hover:text-white">
          Logout
        </Link>
      </div>
    </details>
  );
}
