"use server";

import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { profiles } from "@/db/schema";
import { getUser } from "@/lib/auth";
import { parseLocale } from "@/lib/user-locale";

export async function saveUserLocale(locale: string) {
  const parsed = parseLocale(locale);
  if (!parsed) return;

  const user = await getUser();
  if (!user) return;

  try {
    const db = getDb();
    await db
      .update(profiles)
      .set({ locale: parsed, updatedAt: new Date() })
      .where(eq(profiles.id, user.id));
  } catch (error) {
    console.error("Failed to save user locale:", error);
  }
}
