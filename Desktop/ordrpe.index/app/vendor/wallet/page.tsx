import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function requestWithdrawal(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const amount = Number(formData.get("amount"));
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user || amount <= 0) return;
  await supabase.from("withdrawal_requests").insert({ vendor_id: user.id, amount });
  revalidatePath("/vendor/wallet");
}

export default async function VendorWalletPage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: profile }, { data: pending }, { data: withdrawals }] = await Promise.all([
    supabase.from("profiles").select("wallet_balance").eq("id", user.id).single(),
    supabase
      .from("orders")
      .select("vendor_payout")
      .eq("vendor_id", user.id)
      .neq("status", "Delivered"),
    supabase
      .from("withdrawal_requests")
      .select("id,amount,status,created_at")
      .eq("vendor_id", user.id)
      .order("id", { ascending: false })
  ]);

  const pendingBalance = (pending ?? []).reduce((sum, x) => sum + Number(x.vendor_payout), 0);
  const availableBalance = Number(profile?.wallet_balance ?? 0);

  return (
    <div className="space-y-5">
      <header className="ordrpe-card p-6">
        <h1 className="text-3xl font-bold">Vendor Wallet</h1>
        <p className="text-muted mt-2 text-sm">Monitor escrow and request withdrawals from available balance.</p>
      </header>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="ordrpe-card p-4">
          <p className="text-muted text-xs uppercase tracking-wide">Pending Balance (Escrow)</p>
          <p className="mt-2 text-2xl font-semibold text-amber-500">PKR {pendingBalance.toLocaleString()}</p>
        </div>
        <div className="ordrpe-card p-4">
          <p className="text-muted text-xs uppercase tracking-wide">Available Balance</p>
          <p className="text-brand mt-2 text-2xl font-semibold">PKR {availableBalance.toLocaleString()}</p>
        </div>
      </div>
      <form action={requestWithdrawal} className="flex max-w-md gap-2">
        <input type="number" min="1" name="amount" className="ordrpe-input flex-1" placeholder="Withdrawal amount (PKR)" required />
        <button type="submit" className="ordrpe-btn">Request</button>
      </form>
      <div className="space-y-2">
        {(withdrawals ?? []).map((item) => (
          <div key={item.id} className="ordrpe-card rounded-md p-3 text-sm">
            Request #{item.id} | PKR {Number(item.amount).toLocaleString()} | {item.status}
          </div>
        ))}
      </div>
    </div>
  );
}
