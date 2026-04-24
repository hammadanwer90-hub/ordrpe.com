"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Role } from "@/lib/types";

export default function LoginPage() {
  const router = useRouter();
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<Role>("customer");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function redirectByRole(supabaseClient: any) {
    const {
      data: { user }
    } = await supabaseClient.auth.getUser();
    if (!user) {
      router.push("/");
      router.refresh();
      return;
    }
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    const role = profile?.role;
    if (role === "admin") router.push("/admin");
    else if (role === "vendor") router.push("/vendor");
    else router.push("/");
    router.refresh();
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setNotice(null);
    let supabase;
    try {
      const mod = await import("@/lib/supabase/client");
      supabase = mod.createClient();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Supabase environment variables are missing in deployment."
      );
      setLoading(false);
      return;
    }

    if (isSignup) {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } }
      });
      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }
      if (data.user) {
        const { error: profileError } = await supabase.from("profiles").update({
          full_name: fullName || "New User",
          role,
          // Give new vendors trial access so they can onboard and add products immediately.
          subscription_active: true
        }).eq("id", data.user.id);

        if (profileError) {
          setError(profileError.message);
          setLoading(false);
          return;
        }

        if (!data.session) {
          setNotice("Account created. Please verify your email, then login.");
          setLoading(false);
          return;
        }
        await redirectByRole(supabase);
        setLoading(false);
        return;
      }
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }
      await redirectByRole(supabase);
      setLoading(false);
      return;
    }
    setLoading(false);
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-[1.1fr_0.9fr]">
      <section className="panel-dark rounded-2xl p-6 text-[#fdf8f3] md:p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-[#d4b27a]">Welcome to OrdrPe</p>
        <h1 className="mt-3 text-3xl font-semibold md:text-4xl">Shop global products, delivered to Pakistan.</h1>
        <p className="mt-3 text-sm text-[#fdf8f3]/80">
          Login once and continue with your role-specific experience, just like modern marketplaces.
        </p>
        <div className="mt-5 space-y-2 text-sm text-[#fdf8f3]/85">
          <p>- Customers browse in-stock and place orders</p>
          <p>- Vendors manage inventory and fulfillment</p>
          <p>- Admins manage operations and finance</p>
        </div>
      </section>

      <section className="ordrpe-card p-6 text-[#1a1008]">
        <h2 className="text-2xl font-bold">{isSignup ? "Create Account" : "Login"}</h2>
        <p className="mt-2 text-sm text-[#6b5438]">
        {isSignup
          ? "Choose your role to onboard as customer or vendor."
          : "Sign in to access your role-based dashboard."}
        </p>
        <form onSubmit={onSubmit} className="mt-5 space-y-3">
          {isSignup && (
            <>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="ordrpe-input"
                placeholder="Full name"
                required
              />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="ordrpe-input"
              >
                <option value="customer">Customer</option>
                <option value="vendor">Vendor</option>
              </select>
            </>
          )}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="ordrpe-input"
            placeholder="Email"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="ordrpe-input"
            placeholder="Password"
            required
          />
          {error && <p className="text-sm text-rose-500">{error}</p>}
          {notice && <p className="text-sm text-emerald-600">{notice}</p>}
          <button
            disabled={loading}
            type="submit"
            className="w-full rounded-md bg-[#a97c3a] px-3 py-2 font-semibold text-white"
          >
            {loading ? "Please wait..." : isSignup ? "Create account" : "Login"}
          </button>
        </form>
        <button
          onClick={() => setIsSignup((v) => !v)}
          className="mt-4 text-sm text-[#a97c3a] hover:opacity-80"
        >
          {isSignup ? "Already have an account? Login" : "Need an account? Sign up"}
        </button>
      </section>
    </div>
  );
}
