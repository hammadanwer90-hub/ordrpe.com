import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function moderateReview(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const reviewId = Number(formData.get("review_id"));
  const action = String(formData.get("action"));
  if (!reviewId) return;

  if (action === "approve") {
    await supabase.from("reviews").update({ is_verified: true }).eq("id", reviewId);
  } else if (action === "reject") {
    await supabase.from("reviews").update({ is_verified: false }).eq("id", reviewId);
  }
  revalidatePath("/admin/reviews");
}

export default async function AdminReviewsPage() {
  const supabase = await createClient();
  const { data: reviews } = await supabase
    .from("reviews")
    .select("id,order_id,rating,comment,photo_url,is_verified,created_at")
    .order("id", { ascending: false });

  return (
    <div className="space-y-6">
      <header className="ordrpe-card p-6">
        <h1 className="text-3xl font-bold">Review Verification</h1>
        <p className="text-muted mt-2 text-sm">Moderate customer photo reviews before public trust display.</p>
      </header>
      {(reviews ?? []).map((review) => (
        <article key={review.id} className="ordrpe-card p-4">
          <p className="text-muted text-sm">
            Review #{review.id} | Order #{review.order_id} | Rating {review.rating}/5 |{" "}
            {review.is_verified ? "Verified" : "Unverified"}
          </p>
          {review.comment && <p className="mt-2 text-sm">{review.comment}</p>}
          {review.photo_url && (
            <a href={review.photo_url} target="_blank" className="text-brand mt-2 inline-block text-sm" rel="noreferrer">
              Open photo evidence
            </a>
          )}
          <div className="mt-3 flex gap-2">
            <form action={moderateReview}>
              <input type="hidden" name="review_id" value={review.id} />
              <input type="hidden" name="action" value="approve" />
              <button type="submit" className="ordrpe-btn">
                Approve
              </button>
            </form>
            <form action={moderateReview}>
              <input type="hidden" name="review_id" value={review.id} />
              <input type="hidden" name="action" value="reject" />
              <button type="submit" className="ordrpe-secondary-btn">
                Reject
              </button>
            </form>
          </div>
        </article>
      ))}

      {(!reviews || reviews.length === 0) && (
        <div className="ordrpe-card p-5 text-sm text-[#6b5438]">No reviews waiting for moderation.</div>
      )}
    </div>
  );
}
