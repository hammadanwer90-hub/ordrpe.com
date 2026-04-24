import Link from "next/link";

export default function AccountPage() {
  return (
    <div className="ordrpe-card p-6">
      <h1 className="text-2xl font-bold">My Account</h1>
      <p className="text-muted mt-2 text-sm">Track orders, post photo reviews, and submit pre-orders.</p>
      <div className="mt-5 flex flex-wrap gap-3">
        <Link href="/account/orders" className="border-soft rounded-md border px-3 py-2 text-sm">
          My Orders
        </Link>
        <Link href="/account/preorders" className="border-soft rounded-md border px-3 py-2 text-sm">
          My Pre-Orders
        </Link>
        <Link href="/account/products" className="border-soft rounded-md border px-3 py-2 text-sm">
          Add Product Request
        </Link>
        <Link href="/instock" className="border-soft rounded-md border px-3 py-2 text-sm">
          Browse In Stock
        </Link>
      </div>
    </div>
  );
}
