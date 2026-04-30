"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Package,
  Users,
  Briefcase,
  ShoppingCart,
  Flame,
  Menu,
  X,
  LogOut,
  ChevronLeft,
  Settings,
} from "lucide-react";
import { logout } from "@/app/(auth)/actions";
import type { AuthUser } from "@/lib/auth";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Ordini", icon: ShoppingCart },
  { href: "/admin/products", label: "Prodotti", icon: Package },
  { href: "/admin/stufe", label: "Stufe", icon: Flame },
  { href: "/admin/users", label: "Utenti", icon: Users },
  { href: "/admin/dealers", label: "Dealer", icon: Briefcase },
  { href: "/admin/settings", label: "Impostazioni", icon: Settings },
];

export default function AdminShell({
  user,
  children,
}: {
  user: AuthUser;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-surface border-r border-border z-50 transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-5 border-b border-border">
            <Link href="/admin" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                <Flame className="w-4 h-4 text-white" />
              </div>
              <span className="text-base font-bold tracking-tight">
                RICAMBI<span className="text-accent">X</span>STUFE
              </span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg hover:bg-surface-hover transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    active
                      ? "bg-orange-50 dark:bg-orange-950/40 text-accent"
                      : "text-muted hover:bg-surface-hover hover:text-foreground"
                  }`}
                >
                  <item.icon
                    className={`w-4.5 h-4.5 ${active ? "text-accent" : "text-muted"}`}
                  />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User info + back to shop */}
          <div className="p-4 border-t border-border space-y-2">
            <Link
              href="/"
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-muted hover:bg-surface-hover hover:text-foreground transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Torna al sito
            </Link>
            <form action={logout}>
              <button
                type="submit"
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-muted hover:bg-surface-hover hover:text-foreground transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Esci ({user.email})
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top bar */}
        <header className="h-16 bg-surface border-b border-border flex items-center px-4 lg:px-6 gap-4 sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-surface-hover transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <div className="text-sm text-muted">
            <span className="hidden sm:inline">{user.email} · </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-orange-50 dark:bg-orange-950/40 text-accent text-xs font-medium">
              Admin
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
