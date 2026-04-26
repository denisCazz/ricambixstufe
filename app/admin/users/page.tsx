import {
  and,
  count,
  desc,
  eq,
  ilike,
  or,
  type SQL,
} from "drizzle-orm";
import { getDb } from "@/db";
import { profiles } from "@/db/schema";
import { Search } from "lucide-react";
import UserRoleSelect from "./UserRoleSelect";
import type { UserRole } from "@/lib/types";

const PAGE_SIZE = 30;

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; role?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1", 10));
  const search = params.q || "";
  const roleFilter = params.role || "";
  const offset = (page - 1) * PAGE_SIZE;

  const db = getDb();
  const conds: SQL[] = [];
  if (search) {
    const t = `%${search}%`;
    conds.push(
      or(
        ilike(profiles.email, t),
        ilike(profiles.firstName, t),
        ilike(profiles.lastName, t),
        ilike(profiles.company, t)
      )!
    );
  }
  if (roleFilter) {
    conds.push(eq(profiles.role, roleFilter as UserRole));
  }
  const whereClause = conds.length ? and(...conds) : undefined;

  const countQuery = db.select({ n: count() }).from(profiles);
  const [countRes] = whereClause
    ? await countQuery.where(whereClause)
    : await countQuery;

  const userRows = whereClause
    ? await db
        .select()
        .from(profiles)
        .where(whereClause)
        .orderBy(desc(profiles.createdAt))
        .limit(PAGE_SIZE)
        .offset(offset)
    : await db
        .select()
        .from(profiles)
        .orderBy(desc(profiles.createdAt))
        .limit(PAGE_SIZE)
        .offset(offset);

  const totalCount = Number(countRes.n);
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const users = userRows.map((u) => ({
    id: u.id,
    email: u.email,
    first_name: u.firstName,
    last_name: u.lastName,
    role: u.role,
    company: u.company,
    phone: u.phone,
    created_at: u.createdAt.toISOString(),
  }));

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Utenti</h1>
      <div className="bg-surface border border-border rounded-2xl p-4 mb-4">
        <form className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
            <input
              type="text"
              name="q"
              defaultValue={search}
              placeholder="Cerca per email, nome, azienda..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-background border border-border text-sm"
            />
          </div>
          <select
            name="role"
            defaultValue={roleFilter}
            className="py-2 px-3 rounded-xl bg-background border border-border text-sm"
          >
            <option value="">Tutti i ruoli</option>
            <option value="customer">Cliente</option>
            <option value="dealer">Rivenditore</option>
            <option value="admin">Admin</option>
          </select>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-foreground text-white text-sm"
          >
            Filtra
          </button>
        </form>
      </div>
      <p className="text-sm text-muted mb-3">{totalCount} utenti</p>
      <div className="bg-surface border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-stone-50/50">
                <th className="text-left py-3 px-4">Email</th>
                <th className="text-left py-3 px-4 hidden md:table-cell">Nome</th>
                <th className="text-left py-3 px-4 hidden lg:table-cell">Azienda</th>
                <th className="text-left py-3 px-4">Ruolo</th>
                <th className="text-left py-3 px-4 hidden sm:table-cell">Data</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-border last:border-0 hover:bg-stone-50/50"
                >
                  <td className="py-3 px-4 font-medium">{u.email}</td>
                  <td className="py-3 px-4 text-muted hidden md:table-cell">
                    {u.first_name} {u.last_name}
                  </td>
                  <td className="py-3 px-4 text-muted hidden lg:table-cell">
                    {u.company || "—"}
                  </td>
                  <td className="py-3 px-4">
                    <UserRoleSelect
                      userId={u.id}
                      currentRole={u.role as UserRole}
                    />
                  </td>
                  <td className="py-3 px-4 text-muted text-xs hidden sm:table-cell">
                    {u.created_at.slice(0, 10)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {users.length === 0 && (
          <p className="p-6 text-center text-muted">Nessun utente</p>
        )}
      </div>
      {totalPages > 1 && (
        <p className="text-center text-sm text-muted mt-4">
          Pagina {page} / {totalPages}
        </p>
      )}
    </div>
  );
}
