import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { PreferencesToggle } from "@/components/home/preferences-toggle";
import { HeroSection } from "@/components/home/hero-section";
import { MarketingSections } from "@/components/home/marketing-sections";
import { hasPublicSupabaseEnv, missingPublicSupabaseEnv } from "@/lib/supabase/env";

type SearchParams = {
  country?: string;
  category?: string;
};

export default async function Home({
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
          This deployment is missing Supabase environment variables, so the storefront cannot load.
        </p>
        <ul className="mt-3 list-disc pl-5 text-sm">
          {missing.map((name) => (
            <li key={name}>
              <code>{name}</code>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm">
          Add these in Vercel Project Settings - Environment Variables, then redeploy.
        </p>
      </div>
    );
  }

  const supabase = await createClient();
  const cookieStore = await cookies();
  const country = params.country ?? "all";
  const category = params.category ?? "all";
  const theme = cookieStore.get("ordrpe_theme")?.value === "dark" ? "dark" : "light";
  const lang = cookieStore.get("ordrpe_lang")?.value === "ur" ? "ur" : "en";
  const isUrdu = lang === "ur";

  async function placeOrder(formData: FormData) {
    "use server";
    const db = await createClient();
    const {
      data: { user }
    } = await db.auth.getUser();
    if (!user) redirect("/login");

    const productId = Number(formData.get("product_id"));
    const vendorId = String(formData.get("vendor_id") ?? "");
    const totalPrice = Number(formData.get("price_pkr"));

    const { data: profile } = await db.from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role !== "customer") redirect("/account");

    await db.from("orders").insert({
      customer_id: user.id,
      vendor_id: vendorId,
      product_id: productId,
      total_price: totalPrice,
      status: "Pending"
    });
    revalidatePath("/");
  }

  let query = supabase
    .from("storefront_products")
    .select("id,name,origin_country,price_pkr,stock_qty,category,vendor_name,vendor_id")
    .order("id", { ascending: false });

  if (country !== "all") query = query.eq("origin_country", country);
  if (category !== "all") query = query.eq("category", category);

  const [{ data: products }, { data: countries }, { data: categories }] =
    await Promise.all([
      query,
      supabase.from("storefront_products").select("origin_country"),
      supabase.from("storefront_products").select("category")
    ]);

  const distinctCountries = [...new Set((countries ?? []).map((x) => x.origin_country))];
  const distinctCategories = [...new Set((categories ?? []).map((x) => x.category))];

  return (
    <div className={`space-y-6 md:space-y-8 ${theme === "dark" ? "theme-dark-ui" : ""} ${isUrdu ? "text-right" : ""}`}>
      <PreferencesToggle theme={theme} lang={lang} />
      <HeroSection isUrdu={isUrdu} />

      <section className="ordrpe-card grid gap-4 p-4 sm:p-5 md:grid-cols-2">
        <div>
          <p className="mb-2 text-xs uppercase tracking-wide text-[#6b5438]">Filter by Country</p>
          <div className="flex flex-wrap gap-2">
            <Link href="/" className="rounded-full border border-[#d9c8b8] px-3 py-1 text-xs sm:text-sm">
              All
            </Link>
            {distinctCountries.map((value) => (
              <Link
                key={value}
                href={`/?country=${encodeURIComponent(value)}&category=${encodeURIComponent(category)}`}
                className="rounded-full border border-[#d9c8b8] px-3 py-1 text-xs sm:text-sm"
              >
                {value}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs uppercase tracking-wide text-[#6b5438]">Filter by Category</p>
          <div className="flex flex-wrap gap-2">
            <Link href="/" className="rounded-full border border-[#d9c8b8] px-3 py-1 text-xs sm:text-sm">
              All
            </Link>
            {distinctCategories.map((value) => (
              <Link
                key={value}
                href={`/?country=${encodeURIComponent(country)}&category=${encodeURIComponent(value)}`}
                className="rounded-full border border-[#d9c8b8] px-3 py-1 text-xs sm:text-sm"
              >
                {value}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
        {(products ?? []).map((product) => (
          <article key={product.id} className="ordrpe-card p-4">
            <div className="text-xs text-[#6b5438]">
              {product.category} | {product.origin_country}
            </div>
            <h2 className="mt-2 text-base font-semibold sm:text-lg">{product.name}</h2>
            <p className="mt-1 text-sm text-[#6b5438]">Vendor: {product.vendor_name}</p>
            <p className="mt-3 text-[#a97c3a]">PKR {Number(product.price_pkr).toLocaleString()}</p>
            <form action={placeOrder} className="mt-3">
              <input type="hidden" name="product_id" value={product.id} />
              <input type="hidden" name="vendor_id" value={product.vendor_id} />
              <input type="hidden" name="price_pkr" value={product.price_pkr} />
              <button type="submit" className="ordrpe-btn">
                Buy Now
              </button>
            </form>
          </article>
        ))}
      </section>

      <MarketingSections isUrdu={isUrdu} />
    </div>
  );
}
