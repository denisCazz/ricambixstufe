"use server";

import { desc, eq, and, inArray, type SQL } from "drizzle-orm";
import { getDb } from "@/db";
import { orders, orderItems, profiles } from "@/db/schema";
import { getUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import type { OrderStatus } from "@/lib/types";

export async function getOrders(filters?: {
  status?: string;
  daneaExported?: boolean;
}) {
  const user = await getUser();
  if (!user || user.role !== "admin") throw new Error("Unauthorized");

  const db = getDb();
  const conds: SQL[] = [];
  if (filters?.status && filters.status !== "all") {
    conds.push(eq(orders.status, filters.status as OrderStatus));
  }
  if (filters?.daneaExported !== undefined) {
    conds.push(eq(orders.daneaExported, filters.daneaExported));
  }
  const whereClause = conds.length ? and(...conds) : undefined;

  const orderRows = whereClause
    ? await db
        .select()
        .from(orders)
        .where(whereClause)
        .orderBy(desc(orders.id))
    : await db.select().from(orders).orderBy(desc(orders.id));

  const orderIds = orderRows.map((o) => o.id);
  const itemRows =
    orderIds.length > 0
      ? await db
          .select()
          .from(orderItems)
          .where(inArray(orderItems.orderId, orderIds))
      : [];

  const itemsByOrder = new Map<number, typeof itemRows>();
  for (const it of itemRows) {
    const list = itemsByOrder.get(it.orderId) || [];
    list.push(it);
    itemsByOrder.set(it.orderId, list);
  }

  const userIds = orderRows
    .map((o) => o.userId)
    .filter((id): id is string => !!id);

  let profileMap: Record<
    string,
    { email: string; first_name: string | null; last_name: string | null }
  > = {};

  if (userIds.length > 0) {
    const profs = await db
      .select({
        id: profiles.id,
        email: profiles.email,
        firstName: profiles.firstName,
        lastName: profiles.lastName,
      })
      .from(profiles)
      .where(inArray(profiles.id, userIds));
    profileMap = Object.fromEntries(
      profs.map((p) => [
        p.id,
        {
          email: p.email,
          first_name: p.firstName,
          last_name: p.lastName,
        },
      ])
    );
  }

  const data = orderRows.map((o) => ({
    id: o.id,
    created_at: o.createdAt.toISOString(),
    status: o.status,
    payment_status: o.paymentStatus,
    subtotal: Number(o.subtotal),
    shipping_cost: Number(o.shippingCost),
    total: Number(o.total),
    shipping_address: o.shippingAddress as Record<string, unknown>,
    billing_address: o.billingAddress as Record<string, unknown>,
    guest_email: o.guestEmail,
    user_id: o.userId,
    notes: o.notes,
    danea_exported: o.daneaExported,
    tracking_number: o.trackingNumber,
    order_items: (itemsByOrder.get(o.id) || []).map((it) => ({
      id: it.id,
      product_name: it.productName,
      product_sku: it.productSku,
      quantity: it.quantity,
      unit_price: Number(it.unitPrice),
      discount_percent: it.discountPercent,
      line_total: Number(it.lineTotal),
    })),
  }));

  return { orders: data, profileMap };
}

export async function updateOrderStatus(orderId: number, status: string) {
  const user = await getUser();
  if (!user || user.role !== "admin") throw new Error("Unauthorized");

  const db = getDb();
  await db
    .update(orders)
    .set({ status: status as OrderStatus, updatedAt: new Date() })
    .where(eq(orders.id, orderId));
  revalidatePath("/admin/orders");
}

export async function updateTrackingNumber(
  orderId: number,
  trackingNumber: string
) {
  const user = await getUser();
  if (!user || user.role !== "admin") throw new Error("Unauthorized");

  const db = getDb();
  await db
    .update(orders)
    .set({ trackingNumber, updatedAt: new Date() })
    .where(eq(orders.id, orderId));
  revalidatePath("/admin/orders");
}

export async function resetDaneaExport(orderId: number) {
  const user = await getUser();
  if (!user || user.role !== "admin") throw new Error("Unauthorized");

  const db = getDb();
  await db
    .update(orders)
    .set({ daneaExported: false, updatedAt: new Date() })
    .where(eq(orders.id, orderId));
  revalidatePath("/admin/orders");
}
