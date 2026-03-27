"use client";

import { useTransition } from "react";
import { updateUserRole } from "../actions/users";
import type { UserRole } from "@/lib/supabase/types";

const roleColors: Record<UserRole, string> = {
  customer: "bg-stone-100 text-muted border-border",
  dealer: "bg-blue-50 text-blue-700 border-blue-200",
  admin: "bg-orange-50 text-accent border-orange-200",
};

export default function UserRoleSelect({
  userId,
  currentRole,
}: {
  userId: string;
  currentRole: UserRole;
}) {
  const [isPending, startTransition] = useTransition();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value as UserRole;
    if (newRole === currentRole) return;
    if (!confirm(`Cambiare il ruolo di questo utente a "${newRole}"?`)) {
      e.target.value = currentRole;
      return;
    }
    startTransition(async () => {
      const result = await updateUserRole(userId, newRole);
      if (result?.error) {
        alert(result.error);
        e.target.value = currentRole;
      }
    });
  };

  return (
    <select
      defaultValue={currentRole}
      onChange={handleChange}
      disabled={isPending}
      className={`text-xs font-medium px-2 py-1 rounded-lg border transition-all cursor-pointer disabled:opacity-50 ${roleColors[currentRole]}`}
    >
      <option value="customer">Customer</option>
      <option value="dealer">Dealer</option>
      <option value="admin">Admin</option>
    </select>
  );
}
