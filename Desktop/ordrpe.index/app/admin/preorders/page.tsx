import { createClient } from "@/lib/supabase/server";
import { broadcastPreOrder } from "./actions";

export default async function AdminPreOrdersPage() {
  const supabase = await createClient();
  const { data: preOrders } = await supabase
    .from("pre_orders")
    .select("id,description,status,created_at")
    .in("status", ["Open", "Admin_Reviewing"])
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <header className="ordrpe-card p-6">
        <h1 className="text-3xl font-bold">Pre-Order Broadcast</h1>
        <p className="text-muted mt-1 text-sm">
          Customer identity is hidden. Broadcast demand details to active vendors only.
        </p>
      </header>

      <div className="space-y-4">
        {(preOrders ?? []).map((preOrder) => (
          <article key={preOrder.id} className="ordrpe-card p-5">
            <div className="text-muted text-xs">Status: {preOrder.status}</div>
            <p className="mt-2">{preOrder.description}</p>
            <form action={broadcastPreOrder} className="mt-4 space-y-3">
              <input type="hidden" name="preOrderId" value={preOrder.id} />
              <textarea
                name="message"
                className="ordrpe-input text-sm"
                placeholder="Broadcast instructions for vendors (without customer details)"
                required
              />
              <button type="submit" className="ordrpe-btn">
                Broadcast to Active Vendors
              </button>
            </form>
          </article>
        ))}
      </div>

      {(!preOrders || preOrders.length === 0) && (
        <div className="ordrpe-card p-5 text-sm text-[#6b5438]">
          No open pre-orders right now.
        </div>
      )}
    </div>
  );
}
