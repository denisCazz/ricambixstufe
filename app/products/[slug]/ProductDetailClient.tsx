"use client";

import { useState } from "react";
import Header from "@/components/Header";
import type { AuthUser } from "@/lib/auth";

export default function ProductDetailClient({
  children,
  user,
}: {
  children: React.ReactNode;
  user?: AuthUser | null;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <Header
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
        user={user}
      />
      {children}
    </>
  );
}
