import Link from "next/link";

export default function AdminPage() {
  return (
    <div className="space-y-5">
      <header className="ordrpe-card p-6">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <p className="text-muted mt-2 text-sm">
          Control logistics, finance, subscriptions, broadcasts, and moderation.
        </p>
      </header>
      <div className="grid gap-4 md:grid-cols-2">
        <Link href="/admin/orders" className="ordrpe-card p-4">
          <h2 className="font-semibold">Manual Logistics Tracking</h2>
          <p className="text-muted mt-1 text-sm">
            Update statuses and manual notes for cross-border and local courier updates.
          </p>
        </Link>
        <Link href="/admin/finance" className="ordrpe-card p-4">
          <h2 className="font-semibold">Finance & Withdrawals</h2>
          <p className="text-muted mt-1 text-sm">
            View commissions earned and approve vendor withdrawal requests.
          </p>
        </Link>
        <Link href="/admin/preorders" className="ordrpe-card p-4">
          <h2 className="font-semibold">Pre-Order Broadcast</h2>
          <p className="text-muted mt-1 text-sm">Review requests and broadcast anonymized demand.</p>
        </Link>
        <Link href="/admin/vendors" className="ordrpe-card p-4">
          <h2 className="font-semibold">Vendor Subscriptions</h2>
          <p className="text-muted mt-1 text-sm">Activate or disable vendor monthly subscriptions.</p>
        </Link>
        <Link href="/admin/reviews" className="ordrpe-card p-4">
          <h2 className="font-semibold">Review Verification</h2>
          <p className="text-muted mt-1 text-sm">Approve photo reviews for delivered orders.</p>
        </Link>
      </div>
    </div>
  );
}
