"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { appUsers, profiles } from "@/db/schema";
import { getUser } from "@/lib/auth";
import type { UserRole } from "@/lib/types";

async function requireAdmin() {
  const user = await getUser();
  if (!user || user.role !== "admin") {
    throw new Error("Non autorizzato");
  }
  return user;
}

export async function verifyUserEmail(userId: string) {
  await requireAdmin();
  const db = getDb();
  try {
    await db
      .update(appUsers)
      .set({ emailVerifiedAt: new Date(), updatedAt: new Date() })
      .where(eq(appUsers.id, userId));
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Errore" };
  }
  revalidatePath("/admin/users");
}

export async function updateUserRole(userId: string, role: UserRole) {
  const admin = await requireAdmin();
  if (userId === admin.id) {
    return { error: "Non puoi modificare il tuo stesso ruolo" };
  }
  const db = getDb();
  try {
    await db
      .update(profiles)
      .set({ role, updatedAt: new Date() })
      .where(eq(profiles.id, userId));
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Errore" };
  }
  revalidatePath("/admin/users");
}
