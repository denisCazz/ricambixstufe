import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import OrdersListClient from "./OrdersListClient";

export const metadata = {
  title: "I miei ordini | Ricambi X Stufe",
};

export default async function MyOrdersPage() {
  const user = await getUser();
  if (!user) redirect("/login");

  const supabase = await createClient();

  const { data: orders } = await supabase
    .from("orders")
    .select(
      `
      id,
      created_at,
      status,
      payment_method,
      payment_status,
      subtotal,
      shipping_cost,
      total,
      shipping_address,
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
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return <OrdersListClient orders={(orders || []) as Parameters<typeof OrdersListClient>[0]["orders"]} />;
}
