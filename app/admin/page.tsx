import { count, eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { products, profiles, dealerProfiles, orders, orderItems } from "@/db/schema";
import DashboardClient from "./DashboardClient";
import type { DailyStat, TopProduct, DashboardStats } from "./DashboardClient";

async function getDashboardData() {
  const db = getDb();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [p, prof, deal, ords, daily, top, monthStats] = await Promise.all([
    db.select({ n: count() }).from(products).then((r) => r[0]),
    db.select({ n: count() }).from(profiles).then((r) => r[0]),
    db.select({ n: count() }).from(dealerProfiles).where(eq(dealerProfiles.status, "pending")).then((r) => r[0]),
    db.select({ n: count() }).from(orders).then((r) => r[0]),
    db.execute(sql`
      SELECT
        TO_CHAR(DATE(created_at AT TIME ZONE 'Europe/Rome'), 'DD/MM') AS day,
        COUNT(*)::int AS orders,
        COALESCE(SUM(total::numeric), 0)::float AS revenue
      FROM orders
      WHERE created_at >= ${thirtyDaysAgo} AND status != 'cancelled'
      GROUP BY DATE(created_at AT TIME ZONE 'Europe/Rome')
      ORDER BY DATE(created_at AT TIME ZONE 'Europe/Rome') ASC
    `),
    db.execute(sql`
      SELECT
        oi.product_name AS name,
        SUM(oi.quantity)::int AS qty,
        COALESCE(SUM(oi.quantity * oi.unit_price::numeric), 0)::float AS revenue
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE o.created_at >= ${thirtyDaysAgo} AND o.status != 'cancelled'
      GROUP BY oi.product_name
      ORDER BY qty DESC
      LIMIT 5
    `),
    db.execute(sql`
      SELECT
        COUNT(*)::int AS order_count,
        COALESCE(SUM(total::numeric), 0)::float AS revenue
      FROM orders
      WHERE created_at >= ${thirtyDaysAgo} AND status != 'cancelled'
    `),
  ]);

  const stats: DashboardStats = {
    totalProducts: Number(p.n),
    totalUsers: Number(prof.n),
    pendingDealers: Number(deal.n),
    totalOrders: Number(ords.n),
    revenueThisMonth: Number((monthStats.rows[0] as { revenue: number })?.revenue ?? 0),
    ordersThisMonth: Number((monthStats.rows[0] as { order_count: number })?.order_count ?? 0),
  };

  const dailyData: DailyStat[] = (daily.rows as { day: string; orders: number; revenue: number }[]).map((r) => ({
    day: r.day,
    orders: Number(r.orders),
    revenue: Number(r.revenue),
  }));

  const topProducts: TopProduct[] = (top.rows as { name: string; qty: number; revenue: number }[]).map((r) => ({
    name: r.name,
    qty: Number(r.qty),
    revenue: Number(r.revenue),
  }));

  return { stats, dailyData, topProducts };
}

export default async function AdminDashboard() {
  const { stats, dailyData, topProducts } = await getDashboardData();

  return <DashboardClient stats={stats} dailyData={dailyData} topProducts={topProducts} />;
}
