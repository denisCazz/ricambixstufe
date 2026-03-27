"use server";

import { createClient, createServiceClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { sendDealerRegistrationNotification } from "@/lib/email";

export async function login(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const redirectTo = formData.get("redirectTo") as string;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect(redirectTo || "/");
}

export async function register(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  // Supabase returns a fake user with no identities when the email
  // is already registered (to avoid leaking existing accounts).
  if (data.user && data.user.identities?.length === 0) {
    return { error: "Questa email è già registrata. Prova ad accedere o usa un'altra email." };
  }

  redirect("/login?registered=true");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function registerDealer(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const companyName = formData.get("companyName") as string;
  const vatNumber = formData.get("vatNumber") as string;
  const phone = formData.get("phone") as string;

  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
      },
    },
  });

  if (authError) {
    return { error: authError.message };
  }

  if (!authData.user) {
    return { error: "Errore nella registrazione" };
  }

  // Supabase returns a fake user with no identities when the email
  // is already registered (to avoid leaking existing accounts).
  if (authData.user.identities?.length === 0) {
    return { error: "Questa email è già registrata. Prova ad accedere o usa un'altra email." };
  }

  // Use service client for post-signup operations — the user session
  // may not be established yet (e.g. email confirmation pending),
  // so auth.uid() would be NULL and RLS would block the inserts.
  const service = await createServiceClient();

  // Wait for the trigger-created profile row to exist before updating.
  // The handle_new_user trigger fires on auth.users INSERT and creates
  // the profiles row, but there can be a brief delay.
  let profileExists = false;
  for (let i = 0; i < 10; i++) {
    const { data } = await service
      .from("profiles")
      .select("id")
      .eq("id", authData.user.id)
      .single();
    if (data) {
      profileExists = true;
      break;
    }
    await new Promise((r) => setTimeout(r, 300));
  }

  if (!profileExists) {
    // Trigger didn't fire — create the profile directly
    const { error: insertError } = await service
      .from("profiles")
      .insert({
        id: authData.user.id,
        email,
        first_name: firstName,
        last_name: lastName,
        company: companyName,
        vat_number: vatNumber,
        phone,
        role: "dealer",
      });
    if (insertError) {
      return { error: insertError.message };
    }
  } else {
    // Update the trigger-created profile with dealer info
    const { error: profileError } = await service
      .from("profiles")
      .update({
        company: companyName,
        vat_number: vatNumber,
        phone,
        role: "dealer",
      })
      .eq("id", authData.user.id);

    if (profileError) {
      return { error: profileError.message };
    }
  }

  // Create dealer profile (pending approval)
  const { error: dealerError } = await service
    .from("dealer_profiles")
    .insert({
      id: authData.user.id,
      company_name: companyName,
      vat_number: vatNumber,
    });

  if (dealerError) {
    return { error: dealerError.message };
  }

  // Send email notification to admin
  sendDealerRegistrationNotification({
    companyName,
    vatNumber,
    dealerName: `${firstName} ${lastName}`,
    dealerEmail: email,
    phone,
  });

  redirect("/login?dealer_registered=true");
}
