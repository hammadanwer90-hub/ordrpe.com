import { NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import type { Role } from "@/lib/types";

const roleRoutes: Record<string, Role[]> = {
  "/admin": ["admin"],
  "/vendor": ["vendor"],
  "/account": ["customer", "vendor", "admin"]
};

function getRequiredRoles(pathname: string): Role[] | null {
  const matchedPrefix = Object.keys(roleRoutes).find((prefix) =>
    pathname.startsWith(prefix)
  );
  return matchedPrefix ? roleRoutes[matchedPrefix] : null;
}

export async function middleware(request: NextRequest) {
  const { user, supabase, response } = await updateSession(request);
  const requiredRoles = getRequiredRoles(request.nextUrl.pathname);

  if (!requiredRoles) return response;
  if (!supabase) return NextResponse.redirect(new URL("/setup", request.url));
  if (!user) return NextResponse.redirect(new URL("/login", request.url));

  const { data: profile } = await supabase
    .from("profiles")
    .select("role,subscription_active")
    .eq("id", user.id)
    .single();

  if (!profile || !requiredRoles.includes(profile.role as Role)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (profile.role === "vendor" && profile.subscription_active === false) {
    return NextResponse.redirect(new URL("/vendor/subscription", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/vendor/:path*", "/account/:path*"]
};
