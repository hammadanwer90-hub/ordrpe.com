import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

async function logout() {
  "use server";
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export default function LogoutPage() {
  return (
    <div className="mx-auto max-w-md rounded-xl border border-[#d9c8b8] bg-[#fff9f2] p-6 text-[#1a1008] shadow-[0_6px_20px_rgba(30,18,7,0.04)]">
      <h1 className="text-2xl font-bold">Logout</h1>
      <p className="mt-2 text-sm text-[#6b5438]">You are about to end this session.</p>
      <form action={logout} className="mt-4">
        <button type="submit" className="w-full rounded-md bg-[#a97c3a] px-3 py-2 font-semibold text-white">
          Confirm Logout
        </button>
      </form>
    </div>
  );
}
