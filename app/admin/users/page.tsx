import { createClient } from "@/lib/supabase/server";
import { Search } from "lucide-react";
import UserRoleSelect from "./UserRoleSelect";
import type { UserRole } from "@/lib/supabase/types";

const PAGE_SIZE = 30;

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; role?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1"));
  const search = params.q || "";
  const roleFilter = params.role || "";
  const offset = (page - 1) * PAGE_SIZE;

  const supabase = await createClient();

  let query = supabase
    .from("profiles")
    .select("id, email, first_name, last_name, role, company, phone, created_at", {
      count: "exact",
    })
    .order("created_at", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  if (search) {
    query = query.or(`email.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%,company.ilike.%${search}%`);
  }
  if (roleFilter) {
    query = query.eq("role", roleFilter as UserRole);
  }

  const { data: users, count } = await query;
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Utenti</h1>
        <p className="text-sm text-muted mt-1">{count ?? 0} utenti registrati</p>
      </div>

      {/* Filters */}
      <div className="bg-white border border-border rounded-2xl p-4 mb-4">
        <form className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
            <input
              type="text"
              name="q"
              defaultValue={search}
              placeholder="Cerca per email, nome, azienda..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-background border border-border text-sm placeholder:text-muted focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all"
            />
          </div>
          <select
            name="role"
            defaultValue={roleFilter}
            className="py-2 px-3 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all"
          >
            <option value="">Tutti i ruoli</option>
            <option value="customer">Customer</option>
            <option value="dealer">Dealer</option>
            <option value="admin">Admin</option>
          </select>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-foreground text-white text-sm font-medium hover:bg-foreground/90 transition-colors shrink-0"
          >
            Filtra
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-stone-50/50">
                <th className="text-left py-3 px-4 font-medium text-muted">Email</th>
                <th className="text-left py-3 px-4 font-medium text-muted hidden sm:table-cell">Nome</th>
                <th className="text-left py-3 px-4 font-medium text-muted hidden md:table-cell">Azienda</th>
                <th className="text-left py-3 px-4 font-medium text-muted">Ruolo</th>
                <th className="text-left py-3 px-4 font-medium text-muted hidden lg:table-cell">Registrato</th>
              </tr>
            </thead>
            <tbody>
              {(users || []).map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-border last:border-0 hover:bg-stone-50/50 transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="font-medium text-foreground">{user.email}</div>
                    <div className="text-xs text-muted sm:hidden mt-0.5">
                      {[user.first_name, user.last_name].filter(Boolean).join(" ") || "—"}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-muted hidden sm:table-cell">
                    {[user.first_name, user.last_name].filter(Boolean).join(" ") || "—"}
                  </td>
                  <td className="py-3 px-4 text-muted hidden md:table-cell">
                    {user.company || "—"}
                  </td>
                  <td className="py-3 px-4">
                    <UserRoleSelect userId={user.id} currentRole={user.role} />
                  </td>
                  <td className="py-3 px-4 text-muted hidden lg:table-cell tabular-nums">
                    {new Date(user.created_at).toLocaleDateString("it-IT")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {(users || []).length === 0 && (
          <div className="py-12 text-center text-muted">
            Nessun utente trovato.
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          {page > 1 && (
            <a
              href={`/admin/users?page=${page - 1}${search ? `&q=${search}` : ""}${roleFilter ? `&role=${roleFilter}` : ""}`}
              className="px-3 py-1.5 rounded-lg border border-border text-sm hover:bg-surface-hover transition-colors"
            >
              ← Precedente
            </a>
          )}
          <span className="text-sm text-muted px-3">
            Pagina {page} di {totalPages}
          </span>
          {page < totalPages && (
            <a
              href={`/admin/users?page=${page + 1}${search ? `&q=${search}` : ""}${roleFilter ? `&role=${roleFilter}` : ""}`}
              className="px-3 py-1.5 rounded-lg border border-border text-sm hover:bg-surface-hover transition-colors"
            >
              Successiva →
            </a>
          )}
        </div>
      )}
    </div>
  );
}
