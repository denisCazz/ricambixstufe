"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Package, Users, Briefcase, ShoppingCart, X, Sparkles, TrendingUp } from "lucide-react";

export interface DailyStat {
  day: string;
  orders: number;
  revenue: number;
}

export interface TopProduct {
  name: string;
  qty: number;
  revenue: number;
}

export interface DashboardStats {
  totalProducts: number;
  totalUsers: number;
  pendingDealers: number;
  totalOrders: number;
  revenueThisMonth: number;
  ordersThisMonth: number;
}

function formatEur(n: number) {
  return new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface border border-border rounded-xl px-3 py-2 shadow-lg text-sm">
      <p className="text-muted text-xs mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="font-semibold text-foreground">
          {p.name === "revenue" ? formatEur(p.value) : `${p.value} ordini`}
        </p>
      ))}
    </div>
  );
}

export default function DashboardClient({
  stats,
  dailyData,
  topProducts,
}: {
  stats: DashboardStats;
  dailyData: DailyStat[];
  topProducts: TopProduct[];
}) {
  const [aiDismissed, setAiDismissed] = useState(true);
  const [chartMode, setChartMode] = useState<"revenue" | "orders">("revenue");

  useEffect(() => {
    setAiDismissed(localStorage.getItem("ai_popup_dismissed") === "1");
  }, []);

  function dismissAi() {
    localStorage.setItem("ai_popup_dismissed", "1");
    setAiDismissed(true);
  }

  const cards = [
    { label: "Prodotti", value: stats.totalProducts, icon: Package, href: "/admin/products", color: "bg-blue-50 dark:bg-blue-950/40 text-blue-600" },
    { label: "Utenti", value: stats.totalUsers, icon: Users, href: "/admin/users", color: "bg-green-50 dark:bg-green-950/40 text-green-600" },
    { label: "Dealer in attesa", value: stats.pendingDealers, icon: Briefcase, href: "/admin/dealers", color: "bg-orange-50 dark:bg-orange-950/40 text-orange-600" },
    { label: "Ordini totali", value: stats.totalOrders, icon: ShoppingCart, href: "/admin/orders", color: "bg-purple-50 dark:bg-purple-950/40 text-purple-600" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>

      {/* AI popup banner */}
      {!aiDismissed && (
        <div className="relative overflow-hidden rounded-2xl border border-orange-200 dark:border-orange-800 bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 dark:from-orange-950/30 dark:via-amber-950/20 dark:to-orange-950/30 p-5">
          <button
            onClick={dismissAi}
            className="absolute top-3 right-3 text-muted hover:text-foreground transition-colors"
            aria-label="Chiudi"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-start gap-4 pr-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shrink-0 shadow-md">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm mb-1">Potenzia il tuo negozio con l'intelligenza artificiale</p>
              <p className="text-sm text-muted leading-relaxed">
                Integra l'IA per ricevere consigli personalizzati su prezzi, promozioni e scorte — e non andare mai <em>out of stock</em> anticipando le tendenze dei tuoi clienti. Analisi automatica degli ordini, previsioni stagionali e suggerimenti in tempo reale.
              </p>
              <p className="text-xs text-accent font-medium mt-2 cursor-pointer hover:underline" onClick={dismissAi}>
                Capito, grazie →
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="bg-surface border border-border rounded-2xl p-5 hover:border-accent/30 hover:shadow-md transition-all duration-200 group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.color}`}>
                <card.icon className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-bold text-foreground tabular-nums">{card.value}</div>
            <div className="text-sm text-muted mt-1">{card.label}</div>
          </Link>
        ))}
      </div>

      {/* Revenue summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-surface border border-border rounded-2xl p-5">
          <p className="text-xs text-muted uppercase tracking-wide mb-1">Fatturato ultimi 30 giorni</p>
          <p className="text-3xl font-bold text-accent tabular-nums">{formatEur(stats.revenueThisMonth)}</p>
        </div>
        <div className="bg-surface border border-border rounded-2xl p-5">
          <p className="text-xs text-muted uppercase tracking-wide mb-1">Ordini ultimi 30 giorni</p>
          <p className="text-3xl font-bold text-foreground tabular-nums">{stats.ordersThisMonth}</p>
        </div>
      </div>

      {/* Sales chart */}
      <div className="bg-surface border border-border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-accent" />
            <h2 className="font-semibold text-foreground text-sm">Andamento ultimi 30 giorni</h2>
          </div>
          <div className="flex rounded-xl bg-background border border-border overflow-hidden text-xs">
            <button
              onClick={() => setChartMode("revenue")}
              className={`px-3 py-1.5 transition-colors ${chartMode === "revenue" ? "bg-accent text-white font-medium" : "text-muted hover:text-foreground"}`}
            >
              Fatturato
            </button>
            <button
              onClick={() => setChartMode("orders")}
              className={`px-3 py-1.5 transition-colors ${chartMode === "orders" ? "bg-accent text-white font-medium" : "text-muted hover:text-foreground"}`}
            >
              Ordini
            </button>
          </div>
        </div>
        {dailyData.length === 0 ? (
          <p className="text-center text-muted text-sm py-12">Nessun dato disponibile</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={dailyData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border, #e5e7eb)" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} />
              <YAxis
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={chartMode === "revenue" ? (v) => `€${v}` : undefined}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey={chartMode}
                stroke="#f97316"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: "#f97316" }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Top products */}
      {topProducts.length > 0 && (
        <div className="bg-surface border border-border rounded-2xl p-5">
          <h2 className="font-semibold text-foreground text-sm mb-5">Top prodotti (ultimi 30 giorni)</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={topProducts} layout="vertical" margin={{ top: 0, right: 32, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border, #e5e7eb)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} />
              <YAxis
                type="category"
                dataKey="name"
                width={140}
                tick={{ fontSize: 11, fill: "#6b7280" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: string) => v.length > 22 ? v.slice(0, 22) + "…" : v}
              />
              <Tooltip
                formatter={(value: number) => [`${value} pz`, "Qtà"]}
                contentStyle={{ borderRadius: "12px", fontSize: 12, border: "1px solid #e5e7eb" }}
              />
              <Bar dataKey="qty" fill="#f97316" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
