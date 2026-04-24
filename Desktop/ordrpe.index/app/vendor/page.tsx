import Link from "next/link";

export default function VendorPage() {
  return (
    <div className="space-y-5">
      <header className="ordrpe-card p-6">
        <h1 className="text-3xl font-bold">Vendor Panel</h1>
        <p className="text-muted mt-2 text-sm">
          Quick actions: add products, update order status, and manage payouts.
        </p>
      </header>
      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/vendor/products" className="ordrpe-card p-4">
          <h2 className="font-semibold">Inventory</h2>
          <p className="text-muted mt-1 text-sm">List in-stock products with origin country.</p>
        </Link>
        <Link href="/vendor/orders" className="ordrpe-card p-4">
          <h2 className="font-semibold">Order Management</h2>
          <p className="text-muted mt-1 text-sm">Mark items as sent to OrdrPe warehouse.</p>
        </Link>
        <Link href="/vendor/wallet" className="ordrpe-card p-4">
          <h2 className="font-semibold">Wallet</h2>
          <p className="text-muted mt-1 text-sm">Track pending escrow and available balance.</p>
        </Link>
      </div>
    </div>
  );
}
