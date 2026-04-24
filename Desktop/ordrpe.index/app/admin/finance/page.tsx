import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function approveWithdrawal(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const requestId = Number(formData.get("request_id"));
  if (!requestId) return;

  const { data: request } = await supabase
    .from("withdrawal_requests")
    .select("id,vendor_id,amount,status")
    .eq("id", requestId)
    .single();
  if (!request || request.status !== "pending") return;

  const { data: profile } = await supabase
    .from("profiles")
    .select("wallet_balance")
    .eq("id", request.vendor_id)
    .single();
  const balance = Number(profile?.wallet_balance ?? 0);
  if (balance < Number(request.amount)) return;

  await supabase.from("profiles").update({ wallet_balance: balance - Number(request.amount) }).eq("id", request.vendor_id);
  await supabase.from("withdrawal_requests").update({ status: "approved" }).eq("id", request.id);
  revalidatePath("/admin/finance");
}

export default async function AdminFinancePage() {
  const supabase = await createClient();
  const [{ data: deliveredOrders }, { data: withdrawals }] = await Promise.all([
    supabase.from("orders").select("commission_fee").eq("status", "Delivered"),
    supabase.from("withdrawal_requests").select("id,vendor_id,amount,status,created_at").order("id", { ascending: false })
  ]);

  const totalCommissions = (deliveredOrders ?? []).reduce((sum, x) => sum + Number(x.commission_fee), 0);

  return (
    <div className="space-y-6">
      <header className="ordrpe-card p-6">
        <h1 className="text-3xl font-bold">Finance</h1>
        <p className="text-muted mt-2 text-sm">Review commission totals and approve payout requests.</p>
      </header>
      <div className="ordrpe-card p-4">
        <p className="text-muted text-xs uppercase tracking-wide">Total Commissions Earned</p>
        <p className="text-brand mt-2 text-2xl font-semibold">PKR {totalCommissions.toLocaleString()}</p>
      </div>
      <div className="space-y-3">
        {(withdrawals ?? []).map((item) => (
          <article key={item.id} className="ordrpe-card p-4">
            <p className="text-muted text-sm">
              Request #{item.id} | Vendor {item.vendor_id.slice(0, 8)} | PKR {Number(item.amount).toLocaleString()} | {item.status}
            </p>
            {item.status === "pending" && (
              <form action={approveWithdrawal} className="mt-2">
                <input type="hidden" name="request_id" value={item.id} />
                <button type="submit" className="ordrpe-btn">
                  Approve Withdrawal
                </button>
              </form>
            )}
          </article>
        ))}
      </div>
      {(!withdrawals || withdrawals.length === 0) && (
        <div className="ordrpe-card p-5 text-sm text-[#6b5438]">No withdrawal requests yet.</div>
      )}
    </div>
  );
}
