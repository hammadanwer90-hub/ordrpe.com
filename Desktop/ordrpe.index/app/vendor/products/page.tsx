import { ORIGIN_COUNTRIES } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function createProduct(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return;

  const payload = {
    vendor_id: user.id,
    name: String(formData.get("name") ?? ""),
    category: String(formData.get("category") ?? "General"),
    origin_country: String(formData.get("origin_country") ?? ""),
    price_pkr: Number(formData.get("price_pkr") ?? 0),
    stock_qty: Number(formData.get("stock_qty") ?? 0),
    is_approved: false
  };

  if (payload.stock_qty <= 0) return;
  await supabase.from("products").insert(payload);
  revalidatePath("/vendor/products");
}

export default async function VendorProductsPage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const { data: products } = await supabase
    .from("products")
    .select("id,name,category,origin_country,price_pkr,stock_qty,is_approved")
    .eq("vendor_id", user?.id ?? "")
    .order("id", { ascending: false });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Vendor Inventory</h1>
      <form action={createProduct} className="ordrpe-card grid gap-3 p-5">
        <input name="name" className="ordrpe-input" placeholder="Product name" required />
        <input name="category" className="ordrpe-input" placeholder="Category" required />
        <select name="origin_country" className="ordrpe-input" required>
          {ORIGIN_COUNTRIES.map((country) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </select>
        <input type="number" name="price_pkr" min="1" className="ordrpe-input" placeholder="Price (PKR)" required />
        <input type="number" name="stock_qty" min="1" className="ordrpe-input" placeholder="Stock Qty" required />
        <button type="submit" className="ordrpe-btn">Add Product</button>
      </form>
      <div className="grid gap-3">
        {(products ?? []).map((product) => (
          <article key={product.id} className="ordrpe-card p-4">
            <h2 className="font-semibold">{product.name}</h2>
            <p className="text-muted text-sm">
              {product.category} | {product.origin_country} | PKR {Number(product.price_pkr).toLocaleString()} | Stock {product.stock_qty}
            </p>
            <p className="text-muted mt-2 text-xs">{product.is_approved ? "Approved" : "Pending admin approval"}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
