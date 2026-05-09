"use server";

import { desc } from "drizzle-orm";
import { getDb } from "@/db";
import { daneaImportLogs } from "@/db/schema";
import { getUser } from "@/lib/auth";

export type DaneaLogRow = {
  id: number;
  createdAt: string;
  success: boolean;
  source: string;
  mode: string | null;
  message: string | null;
  stats: {
    created: number;
    updated: number;
    deactivatedFull: number;
    deactivatedDeleted: number;
    skipped: number;
  } | null;
  xmlBytes: number | null;
};

export async function getDaneaImportLogs(limit = 80): Promise<DaneaLogRow[]> {
  const user = await getUser();
  if (!user || user.role !== "admin") {
    throw new Error("Non autorizzato");
  }

  const db = getDb();
  const rows = await db
    .select()
    .from(daneaImportLogs)
    .orderBy(desc(daneaImportLogs.createdAt))
    .limit(limit);

  return rows.map((r) => ({
    id: r.id,
    createdAt: r.createdAt.toISOString(),
    success: r.success,
    source: r.source,
    mode: r.mode,
    message: r.message,
    stats: r.stats,
    xmlBytes: r.xmlBytes,
  }));
}
