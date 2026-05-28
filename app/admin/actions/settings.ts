"use server";

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "@/db";
import { appUsers, profiles, dealerProfiles } from "@/db/schema";
import { getUser } from "@/lib/auth";
import { isValidItalianPartitaIva } from "@/lib/italian-vat";
import { Resend } from "resend";
import type { UserRole } from "@/lib/types";

const SALT = 10;

async function requireAdmin() {
  const user = await getUser();
  if (!user || user.role !== "admin") throw new Error("Non autorizzato");
}

export async function testDbConnection(): Promise<{ ok: boolean; message: string }> {
  await requireAdmin();
  try {
    const db = getDb();
    await db.execute("SELECT 1");
    return { ok: true, message: "Connessione al database OK" };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Errore sconosciuto" };
  }
}

export async function testEmail(): Promise<{ ok: boolean; message: string }> {
  await requireAdmin();
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    return { ok: false, message: "ADMIN_EMAIL non configurata nelle variabili d'ambiente" };
  }
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const from = process.env.RESEND_FROM_EMAIL || "RicambiXStufe <onboarding@resend.dev>";
    const { error } = await resend.emails.send({
      from,
      to: adminEmail,
      subject: "Test email — RicambiXStufe",
      html: `<p>Questa è un'email di prova inviata dal pannello admin di <strong>RicambiXStufe</strong>.</p><p>Se stai leggendo questo messaggio, la configurazione email funziona correttamente.</p>`,
    });
    if (error) return { ok: false, message: error.message };
    return { ok: true, message: `Email inviata con successo a ${adminEmail}` };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Errore sconosciuto" };
  }
}

export async function createUser(formData: FormData): Promise<{ ok: boolean; message: string }> {
  await requireAdmin();

  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;
  const firstName = (formData.get("firstName") as string)?.trim() || "";
  const lastName = (formData.get("lastName") as string)?.trim() || "";
  const role = (formData.get("role") as UserRole) || "customer";
  const companyName = (formData.get("companyName") as string)?.trim() || "";
  const vatNumber = ((formData.get("vatNumber") as string) || "").trim().replace(/^IT/i, "");

  if (!email || !password) {
    return { ok: false, message: "Email e password sono obbligatorie" };
  }
  if (password.length < 8) {
    return { ok: false, message: "La password deve essere di almeno 8 caratteri" };
  }
  if (role === "dealer") {
    if (!companyName) {
      return { ok: false, message: "La ragione sociale è obbligatoria per i rivenditori" };
    }
    if (!vatNumber) {
      return { ok: false, message: "La Partita IVA è obbligatoria per i rivenditori" };
    }
    if (!isValidItalianPartitaIva(vatNumber)) {
      return { ok: false, message: "Partita IVA italiana non valida" };
    }
  }

  const db = getDb();
  const existing = await db
    .select({ id: appUsers.id })
    .from(appUsers)
    .where(eq(appUsers.email, email))
    .limit(1)
    .then((r) => r[0]);

  if (existing) {
    return { ok: false, message: "Esiste già un utente con questa email" };
  }

  const passwordHash = await bcrypt.hash(password, SALT);

  await db.transaction(async (tx) => {
    const [u] = await tx
      .insert(appUsers)
      .values({ email, passwordHash, name: `${firstName} ${lastName}`.trim() || null })
      .returning({ id: appUsers.id });
    if (!u) throw new Error("Errore inserimento utente");
    await tx.insert(profiles).values({
      id: u.id,
      email,
      firstName: firstName || null,
      lastName: lastName || null,
      role,
      company: role === "dealer" ? companyName : null,
      vatNumber: role === "dealer" ? vatNumber : null,
    });
    if (role === "dealer") {
      await tx.insert(dealerProfiles).values({
        id: u.id,
        companyName,
        vatNumber,
      });
    }
  });

  revalidatePath("/admin/users");
  revalidatePath("/admin/dealers");
  return {
    ok: true,
    message:
      role === "dealer"
        ? `Rivenditore ${email} creato. Approva la richiesta in Admin → Dealer.`
        : `Utente ${email} creato con ruolo "${role}"`,
  };
}
