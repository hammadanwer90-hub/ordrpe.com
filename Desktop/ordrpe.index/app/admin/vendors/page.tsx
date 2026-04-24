import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function toggleVendorSubscription(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const vendorId = String(formData.get("vendor_id"));
  const nextState = String(formData.get("next_state")) === "true";
  if (!vendorId) return;
  await supabase.from("profiles").update({ subscription_active: nextState }).eq("id", vendorId);
  revalidatePath("/admin/vendors");
}

export default async function AdminVendorsPage() {
  const supabase = await createClient();
  const { data: vendors } = await supabase
    .from("profiles")
    .select("id,full_name,subscription_active")
    .eq("role", "vendor")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <header className="ordrpe-card p-6">
        <h1 className="text-3xl font-bold">Vendor Subscriptions</h1>
        <p className="text-muted mt-2 text-sm">Control who can publish products in storefront.</p>
      </header>
      {(vendors ?? []).map((vendor) => (
        <article key={vendor.id} className="ordrpe-card p-4">
          <p className="text-sm">
            {vendor.full_name} ({vendor.id.slice(0, 8)})
          </p>
          <p className="text-muted mt-1 text-sm">
            Subscription: {vendor.subscription_active ? "Active" : "Inactive"}
          </p>
          <form action={toggleVendorSubscription} className="mt-3">
            <input type="hidden" name="vendor_id" value={vendor.id} />
            <input type="hidden" name="next_state" value={vendor.subscription_active ? "false" : "true"} />
            <button type="submit" className="ordrpe-btn">
              Set {vendor.subscription_active ? "Inactive" : "Active"}
            </button>
          </form>
        </article>
      ))}

      {(!vendors || vendors.length === 0) && (
        <div className="ordrpe-card p-5 text-sm text-[#6b5438]">No vendors found yet.</div>
      )}
    </div>
  );
}
