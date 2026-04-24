import { ORDER_STATUSES } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function updateOrderStatus(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const orderId = Number(formData.get("order_id"));
  const status = String(formData.get("status"));
  const manualNote = String(formData.get("manual_note") ?? "");
  if (!orderId) return;
  await supabase.from("orders").update({ status, manual_note: manualNote }).eq("id", orderId);
  revalidatePath("/admin/orders");
}

export default async function AdminOrdersPage() {
  const supabase = await createClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("id,status,total_price,commission_fee,vendor_payout,manual_note,created_at")
    .order("id", { ascending: false });

  return (
    <div className="space-y-6">
      <header className="ordrpe-card p-6">
        <h1 className="text-3xl font-bold">Manual Logistics Dashboard</h1>
        <p className="text-muted mt-2 text-sm">Update status timeline and add local courier notes.</p>
      </header>
      {(orders ?? []).map((order) => (
        <article key={order.id} className="ordrpe-card p-4">
          <p className="text-muted text-sm">
            #{order.id} | Total PKR {Number(order.total_price).toLocaleString()} | Commission PKR {Number(order.commission_fee).toLocaleString()}
          </p>
          <form action={updateOrderStatus} className="mt-3 grid gap-2 md:grid-cols-3">
            <input type="hidden" name="order_id" value={order.id} />
            <select name="status" defaultValue={order.status} className="ordrpe-input text-sm">
              {ORDER_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <input
              name="manual_note"
              defaultValue={order.manual_note ?? ""}
              className="ordrpe-input text-sm md:col-span-2"
              placeholder="Manual note (TCS/Leopards ID once in PK)"
            />
            <button type="submit" className="ordrpe-btn md:col-span-3">
              Save Update
            </button>
          </form>
        </article>
      ))}
      {(!orders || orders.length === 0) && (
        <div className="ordrpe-card p-5 text-sm text-[#6b5438]">No orders found.</div>
      )}
    </div>
  );
}
