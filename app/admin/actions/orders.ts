"use server";

import { createServiceClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getOrders(filters?: {
  status?: string;
  daneaExported?: boolean;
}) {
  const user = await getUser();
  if (!user || user.role !== "admin") throw new Error("Unauthorized");

  const supabase = await createServiceClient();
  let query = supabase
    .from("orders")
    .select(
      `
      id,
      created_at,
      status,
      payment_status,
      subtotal,
      shipping_cost,
      total,
      shipping_address,
      billing_address,
      guest_email,
      user_id,
      notes,
      danea_exported,
      tracking_number,
      order_items (
        id,
        product_name,
        product_sku,
        quantity,
        unit_price,
        discount_percent,
        line_total
      )
    `
    )
    .order("id", { ascending: false });

  if (filters?.status && filters.status !== "all") {
    query = query.eq(
      "status",
      filters.status as "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled"
    );
  }
  if (filters?.daneaExported !== undefined) {
    query = query.eq("danea_exported", filters.daneaExported);
  }

  const { data, error } = await query;
  if (error) throw error;

  // Fetch profile info for registered users
  const userIds = (data || [])
    .map((o) => o.user_id)
    .filter((id): id is string => !!id);

  let profileMap: Record<
    string,
    { email: string; first_name: string | null; last_name: string | null }
  > = {};

  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, email, first_name, last_name")
      .in("id", userIds);
    if (profiles) {
      profileMap = Object.fromEntries(profiles.map((p) => [p.id, p]));
    }
  }

  return { orders: data || [], profileMap };
}

export async function updateOrderStatus(orderId: number, status: string) {
  const user = await getUser();
  if (!user || user.role !== "admin") throw new Error("Unauthorized");

  const supabase = await createServiceClient();
  const { error } = await supabase
    .from("orders")
    .update({
      status: status as "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled",
    })
    .eq("id", orderId);

  if (error) throw error;
  revalidatePath("/admin/orders");
}

export async function updateTrackingNumber(
  orderId: number,
  trackingNumber: string
) {
  const user = await getUser();
  if (!user || user.role !== "admin") throw new Error("Unauthorized");

  const supabase = await createServiceClient();
  const { error } = await supabase
    .from("orders")
    .update({ tracking_number: trackingNumber })
    .eq("id", orderId);

  if (error) throw error;
  revalidatePath("/admin/orders");
}

export async function resetDaneaExport(orderId: number) {
  const user = await getUser();
  if (!user || user.role !== "admin") throw new Error("Unauthorized");

  const supabase = await createServiceClient();
  const { error } = await supabase
    .from("orders")
    .update({ danea_exported: false })
    .eq("id", orderId);

  if (error) throw error;
  revalidatePath("/admin/orders");
}
