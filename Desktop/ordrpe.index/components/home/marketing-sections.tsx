import Link from "next/link";
import { homeContent } from "@/lib/home-content";

type Props = {
  isUrdu: boolean;
};

export function MarketingSections({ isUrdu }: Props) {
  return (
    <>
      <section className="reveal delay-1 bg-card border-soft overflow-hidden rounded-full border py-2">
        <div className="ordrpe-marquee flex gap-2 whitespace-nowrap px-3 text-[10px] font-bold uppercase tracking-[0.18em]">
          {Array.from({ length: 2 }).map((_, idx) => (
            <div key={idx} className="flex gap-2">
              <span className="rounded-full bg-[#a97c3a] px-4 py-2 text-white">USA to Pakistan</span>
              <span className="marquee-pill border-soft rounded-full border px-4 py-2">Multi Vendor Marketplace</span>
              <span className="rounded-full bg-[#a97c3a] px-4 py-2 text-white">7-14 Day Delivery</span>
              <span className="marquee-pill border-soft rounded-full border px-4 py-2">Escrow Protected Orders</span>
              <span className="rounded-full bg-[#a97c3a] px-4 py-2 text-white">OrdrPe Verified Vendors</span>
            </div>
          ))}
        </div>
      </section>

      <section className="reveal delay-2 space-y-4 md:space-y-5">
        <div>
          <p className="text-brand text-[10px] font-semibold uppercase tracking-[0.25em]">Shop by Category</p>
          <h2 className="mt-2 text-2xl font-semibold leading-tight sm:text-3xl md:text-4xl">
            {isUrdu ? "جو بھی پسند ہو،" : "Everything you love,"}{" "}
            <em className="text-[#c4748a]">{isUrdu ? "اب آپ کے دروازے تک۔" : "now at your doorstep."}</em>
          </h2>
        </div>
        <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
          {homeContent.featuredCategories.map((item) => (
            <Link
              key={item.title}
              href="/instock"
              className="cat-tile border-soft block rounded-[20px] border bg-gradient-to-br from-[#2a1c0f] to-[#6b4d30] p-4 text-[#fdf8f3] sm:p-5"
            >
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#e8d4aa]">{item.tag}</p>
              <p className="mt-3 text-xs uppercase tracking-[0.15em] text-[#f5dce3]">{item.subtitle}</p>
              <h3 className="mt-2 text-xl font-semibold leading-tight sm:text-2xl">{item.title}</h3>
              <p className="mt-3 text-xs leading-5 text-[#fdf8f3]/75">{item.brands}</p>
              <img src={item.image} alt={item.subtitle} className="mt-4 h-28 w-full rounded-xl object-cover opacity-85 sm:h-32" />
            </Link>
          ))}
        </div>
      </section>

      <section className="reveal delay-3 panel-dark grid gap-5 rounded-[22px] p-5 text-[#fdf8f3] sm:p-6 md:grid-cols-2 md:gap-8 md:p-7">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#a97c3a]">Why Ordrpe</p>
          <h2 className="mt-2 text-3xl leading-tight sm:text-4xl md:text-5xl">Simple. <em className="text-[#a97c3a]">Trusted.</em> Delivered.</h2>
          <p className="mt-4 text-sm text-[#fdf8f3]/80">
            We built Ordrpe so every Pakistani can access the USA's best, straight to their door.
          </p>
        </div>
        <div className="space-y-3 text-sm">
          <div className="rounded-xl border border-white/10 p-3">01 - Send any product link from Amazon, Sephora, Nike, or any trusted store.</div>
          <div className="rounded-xl border border-white/10 p-3">02 - We buy, ship, and handle customs with full upfront PKR cost.</div>
          <div className="rounded-xl border border-white/10 p-3">03 - Delivered in 7-14 days across Pakistan with real-time manual tracking.</div>
          <div className="rounded-xl border border-white/10 p-3">04 - WhatsApp support from real humans, not bots.</div>
        </div>
      </section>

      <section className="reveal delay-4 panel-dark grid gap-5 rounded-[22px] p-5 text-[#fdf8f3] sm:p-6 md:grid-cols-2 md:gap-8 md:p-7">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#a97c3a]">Our Home City</p>
          <h2 className="mt-2 text-3xl font-semibold sm:text-4xl">Proudly <em className="text-[#a97c3a]">Karachi.</em></h2>
          <p className="mt-4 text-sm text-[#fdf8f3]/80">Born in Karachi, delivering across all of Pakistan.</p>
          <div className="mt-4 rounded-xl border border-[#a97c3a]/30 bg-[#a97c3a]/10 p-4">
            <p className="font-semibold">Free Pickup - DHA / Clifton, Karachi</p>
            <p className="mt-1 text-sm text-[#fdf8f3]/75">Skip delivery charges with same-day handoff options.</p>
          </div>
        </div>
        <div className="rounded-xl border border-[#a97c3a]/30 p-5">
          <img
            src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=800&q=90"
            alt="Karachi style"
            className="mb-3 h-40 w-full rounded-xl object-cover"
          />
          <p className="text-xs uppercase tracking-[0.2em] text-[#a97c3a]">Karachi Girls - USA Style</p>
          <p className="mt-3 text-sm text-[#fdf8f3]/80">
            Headquartered in Karachi, Pakistan, with cross-border sourcing from USA, UK, UAE and beyond.
          </p>
        </div>
      </section>

      <section className="reveal delay-5 grid gap-5 md:grid-cols-2 md:gap-8">
        <div className="bg-card border-soft rounded-[20px] border p-5 sm:p-6">
          <p className="text-brand text-[10px] font-semibold uppercase tracking-[0.25em]">Our Story</p>
          <h2 className="mt-2 text-3xl font-semibold sm:text-4xl">Led by girls. <em className="text-[#c4748a]">For everyone.</em></h2>
          <p className="text-muted mt-4 text-sm">
            Girl-led team from Karachi. No hidden fees, no scams, just real imported products with transparent pricing.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <div className="ordrpe-card p-4 text-center"><p className="text-brand text-3xl font-semibold">1,000+</p><p className="text-muted text-xs">Happy customers</p></div>
          <div className="ordrpe-card p-4 text-center"><p className="text-brand text-3xl font-semibold">100%</p><p className="text-muted text-xs">Girl-led team</p></div>
          <div className="ordrpe-card p-4 text-center"><p className="text-brand text-3xl font-semibold">7-14</p><p className="text-muted text-xs">Days to Pakistan</p></div>
          <div className="ordrpe-card p-4 text-center"><p className="text-brand text-3xl font-semibold">0</p><p className="text-muted text-xs">Hidden fees</p></div>
        </div>
      </section>

      <section className="reveal delay-5 panel-dark flex flex-wrap items-center justify-between gap-4 rounded-[22px] p-5 text-[#fdf8f3] sm:p-6">
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-[#a97c3a]">Bulk Buyers & Resellers</p>
          <h3 className="mt-2 text-3xl font-semibold">
            Buying for your store or <em className="text-[#a97c3a]">business?</em>
          </h3>
          <p className="mt-2 text-sm text-[#fdf8f3]/75">Special rates, priority handling, and business invoices for wholesale orders.</p>
        </div>
        <a href="https://wa.me/923218705726" target="_blank" className="rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold" rel="noreferrer">
          Get Wholesale Pricing
        </a>
      </section>

      <section className="reveal delay-5 panel-cream border-soft relative overflow-hidden rounded-[22px] border p-6 text-center sm:p-8">
        <p className="text-brand text-[10px] uppercase tracking-[0.2em]">Contact</p>
        <h2 className="mt-2 text-3xl font-semibold leading-tight sm:text-4xl md:text-5xl">Your order is one message <em className="text-[#a97c3a]">away.</em></h2>
        <p className="text-muted mt-3 text-lg italic sm:text-xl">Jo bhi chahye, Ordrpe mangwalo.</p>
        <p className="text-muted mx-auto mt-3 max-w-2xl text-sm">
          Send a link, get PKR price, and we handle everything with receipts and delivery updates.
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <a href="https://wa.me/923218705726" target="_blank" className="ordrpe-btn inline-flex min-h-10 items-center" rel="noreferrer">
            Chat on WhatsApp
          </a>
          <Link href="/instock" className="text-brand border-soft inline-flex min-h-10 items-center rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em]">
            Browse In Stock Items
          </Link>
        </div>
      </section>

      <footer className="reveal delay-5 panel-footer rounded-[22px] p-5 text-[#fdf8f3] sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <p className="text-2xl font-semibold tracking-[0.12em]">Order<span className="text-[#a97c3a]">Pe</span></p>
            <p className="mt-2 max-w-sm text-sm text-[#fdf8f3]/70">
              USA products delivered to Pakistan. Honest pricing, real receipts, zero surprises.
            </p>
            <p className="mt-2 text-xs text-[#fdf8f3]/70">Headquarters: <span className="text-[#a97c3a]">Karachi, Pakistan</span></p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm text-[#fdf8f3]/80">
            <a href="https://instagram.com/ordrpe.co" target="_blank" rel="noreferrer">Instagram</a>
            <a href="https://tiktok.com/@ordrpe" target="_blank" rel="noreferrer">TikTok</a>
            <a href="https://facebook.com/ordrpe" target="_blank" rel="noreferrer">Facebook</a>
            <a href="https://youtube.com/@ordrpe" target="_blank" rel="noreferrer">YouTube</a>
          </div>
        </div>
      </footer>
    </>
  );
}
