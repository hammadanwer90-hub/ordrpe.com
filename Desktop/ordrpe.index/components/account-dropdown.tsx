"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Role } from "@/lib/types";

type Props = {
  role: Role | null;
  dashboardHref: "/admin" | "/vendor" | "/account/orders";
};

export function AccountDropdown({ role, dashboardHref }: Props) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);

  function closeDropdown() {
    setOpen(false);
  }

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      const root = rootRef.current;
      if (!root || !open) return;
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
  }, [open]);

  return (
    <div ref={rootRef} className="nav-account-dropdown group relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="inline-flex min-h-9 cursor-pointer list-none items-center rounded-full border border-white/25 px-3 py-1 hover:border-white/50 hover:text-white"
      >
        Account & Lists
      </button>
      <div
        className={`nav-account-menu absolute right-0 top-full z-[60] mt-2 w-56 rounded-xl border border-[#3a2b1f] bg-[#20140a] p-2 text-[11px] uppercase tracking-[0.1em] text-white/85 shadow-[0_12px_28px_rgba(0,0,0,0.28)] ${
          open ? "block" : "hidden"
        }`}
      >
        <Link onClick={closeDropdown} href={dashboardHref} className="block rounded-md px-3 py-2 hover:bg-white/10 hover:text-white">
          {role === "admin" || role === "vendor" ? "Dashboard" : "My Orders"}
        </Link>
        {role === "customer" && (
          <>
            <Link onClick={closeDropdown} href="/account/preorders" className="block rounded-md px-3 py-2 hover:bg-white/10 hover:text-white">
              My Pre-Orders
            </Link>
            <Link onClick={closeDropdown} href="/account/products" className="block rounded-md px-3 py-2 hover:bg-white/10 hover:text-white">
              Product Requests
            </Link>
          </>
        )}
        {role === "vendor" && (
          <>
            <Link onClick={closeDropdown} href="/vendor/products" className="block rounded-md px-3 py-2 hover:bg-white/10 hover:text-white">
              Inventory
            </Link>
            <Link onClick={closeDropdown} href="/vendor/orders" className="block rounded-md px-3 py-2 hover:bg-white/10 hover:text-white">
              Orders
            </Link>
            <Link onClick={closeDropdown} href="/vendor/wallet" className="block rounded-md px-3 py-2 hover:bg-white/10 hover:text-white">
              Wallet
            </Link>
          </>
        )}
        {role === "admin" && (
          <>
            <Link onClick={closeDropdown} href="/admin/orders" className="block rounded-md px-3 py-2 hover:bg-white/10 hover:text-white">
              Logistics
            </Link>
            <Link onClick={closeDropdown} href="/admin/finance" className="block rounded-md px-3 py-2 hover:bg-white/10 hover:text-white">
              Finance
            </Link>
            <Link onClick={closeDropdown} href="/admin/vendors" className="block rounded-md px-3 py-2 hover:bg-white/10 hover:text-white">
              Vendors
            </Link>
            <Link onClick={closeDropdown} href="/admin/reviews" className="block rounded-md px-3 py-2 hover:bg-white/10 hover:text-white">
              Reviews
            </Link>
          </>
        )}
        <div className="my-1 border-t border-white/15" />
        <Link onClick={closeDropdown} href="/logout" className="block rounded-md px-3 py-2 hover:bg-white/10 hover:text-white">
          Logout
        </Link>
      </div>
    </div>
  );
}
