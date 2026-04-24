import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

async function submitReview(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return;

  const orderId = Number(formData.get("order_id"));
  const productId = Number(formData.get("product_id"));
  const rating = Number(formData.get("rating"));
  const comment = String(formData.get("comment") ?? "");
  const photo = formData.get("photo") as File | null;
  if (!orderId || !productId) return;

  let photoUrl = "";
  if (photo && photo.size > 0) {
    const admin = createAdminClient();
    const ext = photo.name.split(".").pop() ?? "jpg";
    const filePath = `${user.id}/${orderId}-${Date.now()}.${ext}`;
    const arrayBuffer = await photo.arrayBuffer();
    const { error: uploadError } = await admin.storage
      .from("review-photos")
      .upload(filePath, Buffer.from(arrayBuffer), {
        contentType: photo.type || "image/jpeg",
        upsert: false
      });
    if (!uploadError) {
      const { data } = admin.storage.from("review-photos").getPublicUrl(filePath);
      photoUrl = data.publicUrl;
    }
  }

  await supabase.from("reviews").upsert({
    order_id: orderId,
    product_id: productId,
    customer_id: user.id,
    rating,
    comment,
    photo_url: photoUrl,
    is_verified: false
  });

  revalidatePath("/account/orders");
}

export default async function CustomerOrdersPage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: orders } = await supabase
    .from("orders")
    .select("id,status,total_price,manual_note,created_at,product_id")
    .eq("customer_id", user.id)
    .order("id", { ascending: false });

  const orderIds = (orders ?? []).map((o) => o.id);
  const [{ data: tracking }, { data: reviews }] = await Promise.all([
    orderIds.length
      ? supabase
          .from("order_tracking_events")
          .select("id,order_id,status,manual_note,created_at")
          .in("order_id", orderIds)
          .order("created_at", { ascending: true })
      : Promise.resolve({ data: [] as Array<{ id: number; order_id: number; status: string; manual_note: string | null; created_at: string }> }),
    orderIds.length
      ? supabase.from("reviews").select("order_id").in("order_id", orderIds)
      : Promise.resolve({ data: [] as Array<{ order_id: number }> })
  ]);

  const reviewedSet = new Set((reviews ?? []).map((r) => r.order_id));

  return (
    <div className="space-y-6">
      <header className="ordrpe-card p-6">
        <h1 className="text-3xl font-bold">My Orders</h1>
        <p className="text-muted mt-2 text-sm">Track delivery progress and submit review after delivery.</p>
      </header>
      {(orders ?? []).map((order) => {
        const orderTracking = (tracking ?? []).filter((entry) => entry.order_id === order.id);
        return (
          <article key={order.id} className="ordrpe-card p-4">
            <p className="text-muted text-sm">
              Order #{order.id} | Status: {order.status} | PKR {Number(order.total_price).toLocaleString()}
            </p>
            <div className="border-soft mt-3 space-y-1 rounded-md border bg-white p-3 text-sm">
              <p className="font-semibold">Tracking Timeline</p>
              {orderTracking.map((entry) => (
                <div key={entry.id} className="text-muted">
                  {entry.status} {entry.manual_note ? `- ${entry.manual_note}` : ""}
                </div>
              ))}
            </div>
            {order.status === "Delivered" && !reviewedSet.has(order.id) && (
              <form action={submitReview} className="border-soft mt-3 space-y-2 rounded-md border bg-white p-3">
                <input type="hidden" name="order_id" value={order.id} />
                <input type="hidden" name="product_id" value={order.product_id ?? ""} />
                <select name="rating" className="ordrpe-input">
                  {[5, 4, 3, 2, 1].map((r) => (
                    <option key={r} value={r}>
                      {r} Star
                    </option>
                  ))}
                </select>
                <textarea name="comment" className="ordrpe-input" placeholder="Write your review..." />
                <input type="file" name="photo" accept="image/*" className="ordrpe-input" required />
                <button type="submit" className="ordrpe-btn">
                  Submit Photo Review
                </button>
              </form>
            )}
          </article>
        );
      })}

      {(!orders || orders.length === 0) && (
        <div className="ordrpe-card p-5 text-sm text-[#6b5438]">No orders yet. Browse products to place your first order.</div>
      )}
    </div>
  );
}
