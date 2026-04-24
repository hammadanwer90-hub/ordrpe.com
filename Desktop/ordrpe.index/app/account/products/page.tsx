import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function submitProductRequest(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return;

  const productName = String(formData.get("product_name") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const sourceCountry = String(formData.get("source_country") ?? "").trim();
  const budget = Number(formData.get("budget_pkr") ?? 0);
  const notes = String(formData.get("notes") ?? "").trim();
  if (!productName || !category || !sourceCountry || budget <= 0) return;

  const description =
    `Product Request: ${productName}\n` +
    `Category: ${category}\n` +
    `Preferred Source Country: ${sourceCountry}\n` +
    `Target Budget (PKR): ${budget}\n` +
    `Notes: ${notes || "None"}`;

  await supabase.from("pre_orders").insert({
    customer_id: user.id,
    description,
    status: "Open"
  });

  revalidatePath("/account/products");
}

export default async function CustomerProductRequestsPage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: requests } = await supabase
    .from("pre_orders")
    .select("id,description,status,created_at")
    .eq("customer_id", user.id)
    .order("id", { ascending: false });

  return (
    <div className="space-y-6">
      <header className="ordrpe-card p-6">
        <h1 className="text-3xl font-bold">Add Product Request</h1>
        <p className="text-muted mt-2 text-sm">
          Share any product you want and OrdrPe will broadcast it to active vendors for sourcing.
        </p>
      </header>

      <form action={submitProductRequest} className="ordrpe-card grid gap-3 p-5">
        <input
          name="product_name"
          className="ordrpe-input"
          placeholder="Product name"
          required
        />
        <input
          name="category"
          className="ordrpe-input"
          placeholder="Category (Fashion, Beauty, Tech...)"
          required
        />
        <input
          name="source_country"
          className="ordrpe-input"
          placeholder="Preferred source country (USA, UK, UAE...)"
          required
        />
        <input
          type="number"
          name="budget_pkr"
          min="1"
          className="ordrpe-input"
          placeholder="Target budget (PKR)"
          required
        />
        <textarea
          name="notes"
          className="ordrpe-input"
          placeholder="Color, size, brand link, or any extra details"
          rows={4}
        />
        <button type="submit" className="ordrpe-btn">
          Submit Product Request
        </button>
      </form>

      <div className="space-y-3">
        {(requests ?? []).map((item) => (
          <article key={item.id} className="ordrpe-card p-4">
            <p className="text-muted text-xs uppercase tracking-[0.1em]">Request #{item.id} - {item.status}</p>
            <pre className="mt-2 whitespace-pre-wrap text-sm">{item.description}</pre>
          </article>
        ))}
      </div>
    </div>
  );
}
