import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function markSentToWarehouse(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const orderId = Number(formData.get("order_id"));
  const manualNote = String(formData.get("manual_note") ?? "");
  if (!orderId) return;
  await supabase
    .from("orders")
    .update({ status: "At Intl Warehouse", manual_note: manualNote })
    .eq("id", orderId);
  revalidatePath("/vendor/orders");
}

export default async function VendorOrdersPage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const { data: orders } = await supabase
    .from("orders")
    .select("id,status,total_price,vendor_payout,manual_note,created_at")
    .eq("vendor_id", user?.id ?? "")
    .order("id", { ascending: false });

  return (
    <div className="space-y-6">
      <header className="ordrpe-card p-6">
        <h1 className="text-3xl font-bold">Vendor Orders</h1>
        <p className="text-muted mt-2 text-sm">Track assigned orders and mark handoff to OrdrPe warehouse.</p>
      </header>
      {(orders ?? []).map((order) => (
        <article key={order.id} className="ordrpe-card p-4">
          <p className="text-muted text-sm">
            Order #{order.id} | Status: {order.status} | Total PKR {Number(order.total_price).toLocaleString()}
          </p>
          <p className="text-brand text-sm">Vendor payout: PKR {Number(order.vendor_payout).toLocaleString()}</p>
          <form action={markSentToWarehouse} className="mt-3 space-y-2">
            <input type="hidden" name="order_id" value={order.id} />
            <input
              name="manual_note"
              defaultValue={order.manual_note ?? ""}
              className="ordrpe-input text-sm"
              placeholder="Shipment note / airway bill"
            />
            <button type="submit" className="ordrpe-btn">
              Mark Sent to OrdrPe Warehouse
            </button>
          </form>
        </article>
      ))}

      {(!orders || orders.length === 0) && (
        <div className="ordrpe-card p-5 text-sm text-[#6b5438]">No vendor orders yet.</div>
      )}
    </div>
  );
}
