"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

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

  const { error } = await supabase.auth.signUp({
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

  // Update profile with company info
  const { error: profileError } = await supabase
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

  // Create dealer profile (pending approval)
  const { error: dealerError } = await supabase
    .from("dealer_profiles")
    .insert({
      id: authData.user.id,
      company_name: companyName,
      vat_number: vatNumber,
    });

  if (dealerError) {
    return { error: dealerError.message };
  }

  redirect("/login?dealer_registered=true");
}
