"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
import { sendDealerApprovedEmail, sendDealerRejectedEmail } from "@/lib/email";

async function requireAdmin() {
  const user = await getUser();
  if (!user || user.role !== "admin") {
    throw new Error("Non autorizzato");
  }
  return user;
}

export async function approveDealer(dealerId: string, discountPercent: number) {
  const admin = await requireAdmin();
  const supabase = await createServiceClient();

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

  // Fetch dealer email for notification
  const { data: profile } = await supabase
    .from("profiles")
    .select("email")
    .eq("id", dealerId)
    .single();

  const { data: dealer } = await supabase
    .from("dealer_profiles")
    .select("company_name")
    .eq("id", dealerId)
    .single();

  if (profile?.email && dealer?.company_name) {
    sendDealerApprovedEmail({
      dealerEmail: profile.email,
      companyName: dealer.company_name,
      discountPercent,
    });
  }

  revalidatePath("/admin/dealers");
  revalidatePath("/admin");
}

export async function rejectDealer(dealerId: string, reason: string) {
  await requireAdmin();
  const supabase = await createServiceClient();

  const { error } = await supabase
    .from("dealer_profiles")
    .update({
      status: "rejected",
      rejection_reason: reason || null,
    })
    .eq("id", dealerId);

  if (error) return { error: error.message };

  // Fetch dealer email for notification
  const { data: profile } = await supabase
    .from("profiles")
    .select("email")
    .eq("id", dealerId)
    .single();

  const { data: dealer } = await supabase
    .from("dealer_profiles")
    .select("company_name")
    .eq("id", dealerId)
    .single();

  if (profile?.email && dealer?.company_name) {
    sendDealerRejectedEmail({
      dealerEmail: profile.email,
      companyName: dealer.company_name,
      reason: reason || null,
    });
  }

  revalidatePath("/admin/dealers");
  revalidatePath("/admin");
}

export async function updateDealerDiscount(dealerId: string, discountPercent: number) {
  await requireAdmin();
  const supabase = await createServiceClient();

  const { error } = await supabase
    .from("dealer_profiles")
    .update({ discount_percent: discountPercent })
    .eq("id", dealerId);

  if (error) return { error: error.message };

  revalidatePath("/admin/dealers");
}

export async function updateDealerData(
  dealerId: string,
  data: {
    companyName: string;
    vatNumber: string;
    firstName: string;
    lastName: string;
    phone: string;
    discountPercent: number;
  }
) {
  await requireAdmin();
  const supabase = await createServiceClient();

  const { error: dealerError } = await supabase
    .from("dealer_profiles")
    .update({
      company_name: data.companyName,
      vat_number: data.vatNumber,
      discount_percent: data.discountPercent,
    })
    .eq("id", dealerId);

  if (dealerError) return { error: dealerError.message };

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      first_name: data.firstName,
      last_name: data.lastName,
      phone: data.phone || null,
      company: data.companyName,
      vat_number: data.vatNumber,
    })
    .eq("id", dealerId);

  if (profileError) return { error: profileError.message };

  revalidatePath("/admin/dealers");
}

export async function deleteDealer(dealerId: string) {
  await requireAdmin();
  const supabase = await createServiceClient();

  // Delete dealer_profiles first (FK constraint)
  const { error: dealerError } = await supabase
    .from("dealer_profiles")
    .delete()
    .eq("id", dealerId);

  if (dealerError) return { error: dealerError.message };

  // Delete the auth user entirely (cascades to profiles)
  // This allows the email to be re-used for a new registration
  const { error: authError } = await supabase.auth.admin.deleteUser(dealerId);

  if (authError) return { error: authError.message };

  revalidatePath("/admin/dealers");
}
