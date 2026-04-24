"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function broadcastPreOrder(formData: FormData) {
  const preOrderId = formData.get("preOrderId") as string;
  const message = formData.get("message") as string;

  const supabase = await createClient();

  const { data: vendors } = await supabase
    .from("profiles")
    .select("id")
    .eq("role", "vendor")
    .eq("subscription_active", true);

  if (!vendors?.length || !preOrderId) return;

  const rows = vendors.map((vendor) => ({
    pre_order_id: preOrderId,
    vendor_id: vendor.id,
    message
  }));

  await supabase.from("pre_order_broadcasts").insert(rows);
  await supabase.from("pre_orders").update({ status: "Quoted" }).eq("id", preOrderId);

  revalidatePath("/admin/preorders");
}
