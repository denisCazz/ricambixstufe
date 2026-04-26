"use server";

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { signIn, signOut } from "@/auth";
import { getDb } from "@/db";
import { appUsers, profiles, dealerProfiles } from "@/db/schema";
import { sendDealerRegistrationNotification } from "@/lib/email";

const SALT = 10;

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const redirectTo = (formData.get("redirectTo") as string) || "/";

  const res = await signIn("credentials", {
    email: normalizeEmail(email),
    password,
    redirect: false,
  });

  if (res?.error) {
    return { error: "Email o password non validi" };
  }

  redirect(redirectTo);
}

export async function register(formData: FormData) {
  const email = normalizeEmail(formData.get("email") as string);
  const password = formData.get("password") as string;
  const firstName = (formData.get("firstName") as string) || "";
  const lastName = (formData.get("lastName") as string) || "";

  const db = getDb();
  const existing = await db
    .select({ id: appUsers.id })
    .from(appUsers)
    .where(eq(appUsers.email, email))
    .limit(1)
    .then((r) => r[0]);

  if (existing) {
    return { error: "Questa email è già registrata. Prova ad accedere o usa un'altra email." };
  }

  const passwordHash = await bcrypt.hash(password, SALT);

  await db.transaction(async (tx) => {
    const [u] = await tx
      .insert(appUsers)
      .values({ email, passwordHash, name: `${firstName} ${lastName}`.trim() || null })
      .returning({ id: appUsers.id });
    if (!u) throw new Error("insert user");
    await tx.insert(profiles).values({
      id: u.id,
      email,
      firstName: firstName || null,
      lastName: lastName || null,
      role: "customer",
    });
  });

  redirect("/login?registered=true");
}

export async function logout() {
  await signOut({ redirect: false });
  redirect("/");
}

export async function registerDealer(formData: FormData) {
  const email = normalizeEmail(formData.get("email") as string);
  const password = formData.get("password") as string;
  const firstName = (formData.get("firstName") as string) || "";
  const lastName = (formData.get("lastName") as string) || "";
  const companyName = (formData.get("companyName") as string) || "";
  const vatNumber = (formData.get("vatNumber") as string) || "";
  const phone = (formData.get("phone") as string) || "";

  const db = getDb();
  const existing = await db
    .select({ id: appUsers.id })
    .from(appUsers)
    .where(eq(appUsers.email, email))
    .limit(1)
    .then((r) => r[0]);

  if (existing) {
    return { error: "Questa email è già registrata. Prova ad accedere o usa un'altra email." };
  }

  const passwordHash = await bcrypt.hash(password, SALT);

  await db.transaction(async (tx) => {
    const [u] = await tx
      .insert(appUsers)
      .values({ email, passwordHash, name: `${firstName} ${lastName}`.trim() || null })
      .returning({ id: appUsers.id });
    if (!u) throw new Error("insert user");
    await tx.insert(profiles).values({
      id: u.id,
      email,
      firstName: firstName || null,
      lastName: lastName || null,
      company: companyName,
      vatNumber: vatNumber,
      phone: phone || null,
      role: "dealer",
    });
    await tx.insert(dealerProfiles).values({
      id: u.id,
      companyName,
      vatNumber,
    });
  });

  sendDealerRegistrationNotification({
    companyName,
    vatNumber,
    dealerName: `${firstName} ${lastName}`.trim(),
    dealerEmail: email,
    phone,
  });

  redirect("/login?dealer_registered=true");
}
