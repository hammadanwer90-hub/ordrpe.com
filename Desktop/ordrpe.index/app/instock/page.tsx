import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { hasPublicSupabaseEnv, missingPublicSupabaseEnv } from "@/lib/supabase/env";

type SearchParams = {
  country?: string;
  category?: string;
};

export default async function InStockPage({
  searchParams
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  if (!hasPublicSupabaseEnv()) {
    const missing = missingPublicSupabaseEnv();
    return (
      <div className="mx-auto max-w-3xl rounded-xl border border-amber-300/40 bg-amber-950/30 p-6 text-amber-100">
        <h1 className="text-2xl font-bold">Setup Required</h1>
        <p className="mt-2 text-sm">
          This deployment is missing Supabase environment variables, so in-stock products cannot load.
        </p>
        <ul className="mt-3 list-disc pl-5 text-sm">
          {missing.map((name) => (
            <li key={name}>
              <code>{name}</code>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const supabase = await createClient();
  const country = params.country ?? "all";
  const category = params.category ?? "all";

  let query = supabase
    .from("storefront_products")
    .select("id,name,origin_country,price_pkr,stock_qty,category,vendor_name,vendor_id")
    .order("id", { ascending: false });

  if (country !== "all") query = query.eq("origin_country", country);
  if (category !== "all") query = query.eq("category", category);

  const [{ data: products }, { data: countries }, { data: categories }] = await Promise.all([
    query,
    supabase.from("storefront_products").select("origin_country"),
    supabase.from("storefront_products").select("category")
  ]);

  const distinctCountries = [...new Set((countries ?? []).map((x) => x.origin_country))];
  const distinctCategories = [...new Set((categories ?? []).map((x) => x.category))];

  return (
    <div className="space-y-6">
      <header className="ordrpe-card p-6">
        <h1 className="text-3xl font-bold">Browse In Stock</h1>
        <p className="text-muted mt-2 text-sm">
          Only approved products from active vendors are visible here.
        </p>
      </header>

      <section className="ordrpe-card grid gap-4 p-5 md:grid-cols-2">
        <div>
          <p className="mb-2 text-xs uppercase tracking-wide text-[#6b5438]">Filter by Country</p>
          <div className="flex flex-wrap gap-2">
            <Link href="/instock" className="rounded-full border border-[#d9c8b8] px-3 py-1 text-sm">
              All
            </Link>
            {distinctCountries.map((value) => (
              <Link
                key={value}
                href={`/instock?country=${encodeURIComponent(value)}&category=${encodeURIComponent(category)}`}
                className="rounded-full border border-[#d9c8b8] px-3 py-1 text-sm"
              >
                {value}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs uppercase tracking-wide text-[#6b5438]">Filter by Category</p>
          <div className="flex flex-wrap gap-2">
            <Link href="/instock" className="rounded-full border border-[#d9c8b8] px-3 py-1 text-sm">
              All
            </Link>
            {distinctCategories.map((value) => (
              <Link
                key={value}
                href={`/instock?country=${encodeURIComponent(country)}&category=${encodeURIComponent(value)}`}
                className="rounded-full border border-[#d9c8b8] px-3 py-1 text-sm"
              >
                {value}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {(products ?? []).map((product) => (
          <article key={product.id} className="ordrpe-card p-4">
            <div className="text-xs text-[#6b5438]">
              {product.category} | {product.origin_country}
            </div>
            <h2 className="mt-2 text-lg font-semibold">{product.name}</h2>
            <p className="mt-1 text-sm text-[#6b5438]">Vendor: {product.vendor_name}</p>
            <p className="mt-3 text-[#a97c3a]">PKR {Number(product.price_pkr).toLocaleString()}</p>
            <p className="mt-1 text-xs text-[#6b5438]">In Stock: {product.stock_qty}</p>
          </article>
        ))}
      </section>

      {(!products || products.length === 0) && (
        <section className="ordrpe-card p-6 text-center">
          <h2 className="text-xl font-semibold">No in-stock items found</h2>
          <p className="text-muted mt-2 text-sm">
            Try changing filters, or ask vendors to add and publish stock.
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <Link href="/instock" className="ordrpe-btn">
              Reset Filters
            </Link>
            <Link href="/vendor/products" className="text-brand border-soft rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em]">
              Add Vendor Product
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
