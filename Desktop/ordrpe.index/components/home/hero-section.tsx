import { homeContent } from "@/lib/home-content";
import Link from "next/link";

type Props = {
  isUrdu: boolean;
};

export function HeroSection({ isUrdu }: Props) {
  const copy = isUrdu ? homeContent.hero.ur : homeContent.hero.en;
  return (
    <section className="reveal panel-dark grid overflow-hidden rounded-[22px] border border-[#2a1c0f] md:grid-cols-2">
      <div className="p-6 sm:p-8 md:p-10">
        <p className="text-xs uppercase tracking-[0.25em] text-[#a97c3a]">International Sourcing</p>
        <h1 className="mt-3 text-3xl font-semibold leading-tight text-[#fdf8f3] sm:text-4xl md:text-6xl">
          {copy.titleStart}
          <span className="italic text-[#a97c3a]">OrdrPe</span> {copy.titleEnd}
        </h1>
        <p className="mt-4 max-w-md text-sm leading-6 text-[#fdf8f3]/75 md:leading-7">{copy.description}</p>
      </div>
      <div className="grid grid-cols-2 gap-[2px] bg-[#2a1c0f] text-[10px] uppercase tracking-[0.16em] text-white/80 sm:text-xs">
        <Link href="/instock?country=USA" className="hero-tile flex min-h-24 items-end bg-[#3a2a16] p-3 sm:min-h-28 sm:p-4">USA Deals</Link>
        <Link href="/instock?country=UK" className="hero-tile flex min-h-24 items-end bg-[#4a3420] p-3 sm:min-h-28 sm:p-4">UK Brands</Link>
        <Link href="/instock?country=UAE" className="hero-tile flex min-h-24 items-end bg-[#5a4128] p-3 sm:min-h-28 sm:p-4">UAE Stock</Link>
        <Link href="/instock" className="hero-tile flex min-h-24 items-end bg-[#6b4d30] p-3 sm:min-h-28 sm:p-4">PK Delivery</Link>
      </div>
    </section>
  );
}
