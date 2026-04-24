import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function submitPreOrder(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return;

  const description = String(formData.get("description") ?? "");
  if (!description) return;
  await supabase.from("pre_orders").insert({ customer_id: user.id, description, status: "Open" });
  revalidatePath("/account/preorders");
}

export default async function CustomerPreOrdersPage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  const { data: preorders } = await supabase
    .from("pre_orders")
    .select("id,description,status,created_at")
    .eq("customer_id", user?.id ?? "")
    .order("id", { ascending: false });

  return (
    <div className="space-y-6">
      <header className="ordrpe-card p-6">
        <h1 className="text-3xl font-bold">My Pre-Orders</h1>
        <p className="text-muted mt-2 text-sm">Request products that are not currently listed in stock.</p>
      </header>
      <form action={submitPreOrder} className="ordrpe-card space-y-2 p-4">
        <textarea
          name="description"
          className="ordrpe-input"
          placeholder="Describe what you want OrdrPe vendors to source internationally..."
          required
        />
        <button type="submit" className="ordrpe-btn">
          Submit Request
        </button>
      </form>
      <div className="space-y-2">
        {(preorders ?? []).map((item) => (
          <div key={item.id} className="ordrpe-card rounded-md p-3 text-sm">
            #{item.id} | {item.status} | {item.description}
          </div>
        ))}
      </div>

      {(!preorders || preorders.length === 0) && (
        <div className="ordrpe-card p-5 text-sm text-[#6b5438]">No pre-order requests submitted yet.</div>
      )}
    </div>
  );
}
