import { createClient } from "@/lib/supabase/server";
import { Package, Users, Briefcase, ShoppingCart } from "lucide-react";

async function getStats() {
  const supabase = await createClient();

  const [products, profiles, pendingDealers, orders] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase
      .from("dealer_profiles")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase.from("orders").select("id", { count: "exact", head: true }),
  ]);

  return {
    totalProducts: products.count ?? 0,
    totalUsers: profiles.count ?? 0,
    pendingDealers: pendingDealers.count ?? 0,
    totalOrders: orders.count ?? 0,
  };
}

export default async function AdminDashboard() {
  const stats = await getStats();

  const cards = [
    {
      label: "Prodotti",
      value: stats.totalProducts,
      icon: Package,
      href: "/admin/products",
      color: "bg-blue-50 dark:bg-blue-950/40 text-blue-600",
    },
    {
      label: "Utenti",
      value: stats.totalUsers,
      icon: Users,
      href: "/admin/users",
      color: "bg-green-50 dark:bg-green-950/40 text-green-600",
    },
    {
      label: "Dealer in attesa",
      value: stats.pendingDealers,
      icon: Briefcase,
      href: "/admin/dealers",
      color: "bg-orange-50 dark:bg-orange-950/40 text-orange-600",
    },
    {
      label: "Ordini",
      value: stats.totalOrders,
      icon: ShoppingCart,
      href: "/admin/dealers",
      color: "bg-purple-50 text-purple-600",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((card) => (
          <a
            key={card.label}
            href={card.href}
            className="bg-surface border border-border rounded-2xl p-5 hover:border-accent/30 hover:shadow-md transition-all duration-200 group"
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.color}`}
              >
                <card.icon className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-bold text-foreground tabular-nums">
              {card.value}
            </div>
            <div className="text-sm text-muted mt-1">{card.label}</div>
          </a>
        ))}
      </div>
    </div>
  );
}
