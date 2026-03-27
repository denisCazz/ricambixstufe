"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";

export async function updateProfile(formData: FormData) {
  const user = await getUser();
  if (!user) return { error: "Non autenticato" };

  const firstName = (formData.get("firstName") as string)?.trim();
  const lastName = (formData.get("lastName") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim() || undefined;
  const addressLine1 = (formData.get("addressLine1") as string)?.trim() || undefined;
  const addressLine2 = (formData.get("addressLine2") as string)?.trim() || undefined;
  const city = (formData.get("city") as string)?.trim() || undefined;
  const province = (formData.get("province") as string)?.trim() || undefined;
  const postalCode = (formData.get("postalCode") as string)?.trim() || undefined;
  const country = (formData.get("country") as string)?.trim() || undefined;

  if (!firstName || !lastName) {
    return { error: "Nome e cognome sono obbligatori" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      first_name: firstName,
      last_name: lastName,
      phone,
      address_line1: addressLine1,
      address_line2: addressLine2,
      city,
      province,
      postal_code: postalCode,
      country,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    return { error: "Errore durante l'aggiornamento del profilo" };
  }

  revalidatePath("/account");
  return { success: true };
}

export async function getProfile() {
  const user = await getUser();
  if (!user) return null;

  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) return null;

  let dealerInfo = null;
  if (user.role === "dealer") {
    const { data } = await supabase
      .from("dealer_profiles")
      .select("company_name, vat_number, status, discount_percent")
      .eq("id", user.id)
      .single();
    dealerInfo = data;
  }

  return { profile, dealerInfo, role: user.role };
}
