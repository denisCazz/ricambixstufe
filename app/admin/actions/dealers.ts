"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";

async function requireAdmin() {
  const user = await getUser();
  if (!user || user.role !== "admin") {
    throw new Error("Non autorizzato");
  }
  return user;
}

export async function approveDealer(dealerId: string, discountPercent: number) {
  const admin = await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from("dealer_profiles")
    .update({
      status: "approved",
      discount_percent: discountPercent,
      approved_by: admin.id,
      approved_at: new Date().toISOString(),
    })
    .eq("id", dealerId);

  if (error) return { error: error.message };

  revalidatePath("/admin/dealers");
  revalidatePath("/admin");
}

export async function rejectDealer(dealerId: string, reason: string) {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from("dealer_profiles")
    .update({
      status: "rejected",
      rejection_reason: reason || null,
    })
    .eq("id", dealerId);

  if (error) return { error: error.message };

  revalidatePath("/admin/dealers");
  revalidatePath("/admin");
}

export async function updateDealerDiscount(dealerId: string, discountPercent: number) {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from("dealer_profiles")
    .update({ discount_percent: discountPercent })
    .eq("id", dealerId);

  if (error) return { error: error.message };

  revalidatePath("/admin/dealers");
}
