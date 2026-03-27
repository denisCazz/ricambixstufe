import { createServiceClient } from "@/lib/supabase/server";
import DealerActions from "./DealerActions";

export default async function AdminDealersPage() {
  const supabase = await createServiceClient();

  const { data: dealers, error } = await supabase
    .from("dealer_profiles")
    .select("id, company_name, vat_number, status, discount_percent, rejection_reason, created_at, approved_at, profiles!dealer_profiles_id_fkey(email, first_name, last_name, phone)")
    .order("created_at", { ascending: false });

  const pending = (dealers || []).filter((d) => d.status === "pending");
  const approved = (dealers || []).filter((d) => d.status === "approved");
  const rejected = (dealers || []).filter((d) => d.status === "rejected");

  const statusColors = {
    pending: "bg-yellow-50 text-yellow-700",
    approved: "bg-green-50 text-green-700",
    rejected: "bg-red-50 text-red-700",
  };

  const statusLabels = {
    pending: "In attesa",
    approved: "Approvato",
    rejected: "Rifiutato",
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Dealer</h1>
        <p className="text-sm text-muted mt-1">
          {pending.length} in attesa · {approved.length} approvati · {rejected.length} rifiutati
        </p>
      </div>

      {/* Pending dealers highlighted */}
      {pending.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
            Richieste in attesa ({pending.length})
          </h2>
          <div className="space-y-3">
            {pending.map((dealer) => {
              const profile =
                dealer.profiles && typeof dealer.profiles === "object" && !Array.isArray(dealer.profiles)
                  ? (dealer.profiles as { email: string; first_name: string | null; last_name: string | null; phone: string | null })
                  : null;

              return (
                <div
                  key={dealer.id}
                  className="bg-white border-2 border-yellow-200 rounded-2xl p-5"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground text-base">
                        {dealer.company_name}
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 mt-2 text-sm text-muted">
                        <div>P.IVA: {dealer.vat_number}</div>
                        <div>Email: {profile?.email ?? "—"}</div>
                        <div>
                          Nome:{" "}
                          {[profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || "—"}
                        </div>
                        <div>Tel: {profile?.phone || "—"}</div>
                        <div>
                          Data:{" "}
                          {new Date(dealer.created_at).toLocaleDateString("it-IT")}
                        </div>
                      </div>
                    </div>
                    <DealerActions
                      dealer={{
                        id: dealer.id,
                        company_name: dealer.company_name,
                        vat_number: dealer.vat_number,
                        status: dealer.status,
                        discount_percent: dealer.discount_percent,
                        profiles: profile,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* All dealers table */}
      <div className="bg-white border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-stone-50/50">
                <th className="text-left py-3 px-4 font-medium text-muted">Azienda</th>
                <th className="text-left py-3 px-4 font-medium text-muted hidden md:table-cell">P.IVA</th>
                <th className="text-left py-3 px-4 font-medium text-muted hidden sm:table-cell">Email</th>
                <th className="text-left py-3 px-4 font-medium text-muted">Stato</th>
                <th className="text-left py-3 px-4 font-medium text-muted hidden lg:table-cell">Sconto</th>
                <th className="text-left py-3 px-4 font-medium text-muted hidden lg:table-cell">Data</th>
                <th className="text-left py-3 px-4 font-medium text-muted">Azioni</th>
              </tr>
            </thead>
            <tbody>
              {[...pending, ...approved, ...rejected].map((dealer) => {
                const profile =
                  dealer.profiles && typeof dealer.profiles === "object" && !Array.isArray(dealer.profiles)
                    ? (dealer.profiles as { email: string; first_name: string | null; last_name: string | null; phone: string | null })
                    : null;

                return (
                  <tr
                    key={dealer.id}
                    className="border-b border-border last:border-0 hover:bg-stone-50/50 transition-colors"
                  >
                    <td className="py-3 px-4 font-medium text-foreground">
                      {dealer.company_name}
                    </td>
                    <td className="py-3 px-4 text-muted hidden md:table-cell">
                      {dealer.vat_number}
                    </td>
                    <td className="py-3 px-4 text-muted hidden sm:table-cell">
                      {profile?.email ?? "—"}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${
                          statusColors[dealer.status as keyof typeof statusColors]
                        }`}
                      >
                        {statusLabels[dealer.status as keyof typeof statusLabels]}
                      </span>
                    </td>
                    <td className="py-3 px-4 tabular-nums hidden lg:table-cell">
                      {dealer.discount_percent}%
                    </td>
                    <td className="py-3 px-4 text-muted tabular-nums hidden lg:table-cell">
                      {new Date(dealer.created_at).toLocaleDateString("it-IT")}
                    </td>
                    <td className="py-3 px-4">
                      <DealerActions
                        dealer={{
                          id: dealer.id,
                          company_name: dealer.company_name,
                          vat_number: dealer.vat_number,
                          status: dealer.status,
                          discount_percent: dealer.discount_percent,
                          profiles: profile,
                        }}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {(dealers || []).length === 0 && (
          <div className="py-12 text-center text-muted">
            Nessun dealer registrato.
          </div>
        )}
      </div>
    </div>
  );
}
