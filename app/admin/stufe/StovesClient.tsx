"use client";

import { useState, useTransition } from "react";
import { Plus, Pencil, Trash2, Check, X, Loader2 } from "lucide-react";
import { createStove, updateStove, deleteStove } from "@/app/admin/actions/stoves";

type Stove = {
  id: number;
  nameIt: string;
  nameEn: string | null;
  nameFr: string | null;
  nameEs: string | null;
  slug: string;
  active: boolean;
  sortOrder: number;
};

function StoveRow({
  stove,
  onDeleted,
}: {
  stove: Stove;
  onDeleted: (id: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await updateStove(stove.id, fd);
      if (res.error) { setError(res.error); } else { setEditing(false); setError(null); }
    });
  }

  function handleDelete() {
    if (!confirm(`Eliminare "${stove.nameIt}"?`)) return;
    startTransition(async () => {
      const res = await deleteStove(stove.id);
      if (res.error) { setError(res.error); } else { onDeleted(stove.id); }
    });
  }

  if (editing) {
    return (
      <tr className="border-b border-border bg-orange-50/40 dark:bg-orange-950/20">
        <td colSpan={5} className="px-4 py-3">
          <form onSubmit={handleUpdate} className="grid grid-cols-2 md:grid-cols-4 gap-2 items-end">
            <div>
              <label className="block text-xs text-muted mb-1">Nome IT *</label>
              <input name="name_it" defaultValue={stove.nameIt} required
                className="w-full px-2 py-1.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-accent/50" />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">EN</label>
              <input name="name_en" defaultValue={stove.nameEn ?? ""}
                className="w-full px-2 py-1.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-accent/50" />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">FR</label>
              <input name="name_fr" defaultValue={stove.nameFr ?? ""}
                className="w-full px-2 py-1.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-accent/50" />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">ES</label>
              <input name="name_es" defaultValue={stove.nameEs ?? ""}
                className="w-full px-2 py-1.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-accent/50" />
            </div>
            <div className="flex items-center gap-2 mt-1 col-span-2 md:col-span-4">
              <button type="submit" disabled={isPending}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-accent text-white text-sm font-medium disabled:opacity-50">
                {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                Salva
              </button>
              <button type="button" onClick={() => setEditing(false)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-sm text-muted hover:text-foreground">
                <X className="w-3.5 h-3.5" /> Annulla
              </button>
              {error && <span className="text-xs text-red-600">{error}</span>}
            </div>
          </form>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b border-border hover:bg-surface-hover/50 transition-colors">
      <td className="px-4 py-3 text-sm font-medium text-foreground">{stove.nameIt}</td>
      <td className="px-4 py-3 text-sm text-muted">{stove.nameEn || "—"}</td>
      <td className="px-4 py-3 text-sm text-muted">{stove.nameFr || "—"} / {stove.nameEs || "—"}</td>
      <td className="px-4 py-3">
        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${stove.active ? "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400" : "bg-gray-100 dark:bg-gray-800 text-muted"}`}>
          {stove.active ? "Attiva" : "Inattiva"}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <button onClick={() => setEditing(true)}
            className="p-1.5 rounded-lg hover:bg-surface-hover text-muted hover:text-foreground transition-colors">
            <Pencil className="w-4 h-4" />
          </button>
          <button onClick={handleDelete} disabled={isPending}
            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 text-muted hover:text-red-600 transition-colors disabled:opacity-50">
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          </button>
        </div>
      </td>
    </tr>
  );
}

function AddRow({ onAdded }: { onAdded: (s: Stove) => void }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await createStove(fd);
      if (res.error) {
        setError(res.error);
      } else {
        (e.target as HTMLFormElement).reset();
        setOpen(false);
        setError(null);
        // Refresh is handled by revalidatePath in the server action
      }
    });
  }

  if (!open) {
    return (
      <div className="p-4">
        <button onClick={() => setOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-orange-500/25 transition-all">
          <Plus className="w-4 h-4" />
          Aggiungi stufa
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 bg-orange-50/40 dark:bg-orange-950/20 border-t border-border">
      <h3 className="text-sm font-semibold text-foreground mb-3">Nuova stufa</h3>
      <form onSubmit={handleSubmit} className="grid grid-cols-2 md:grid-cols-4 gap-3 items-end">
        <div>
          <label className="block text-xs text-muted mb-1">Nome IT *</label>
          <input name="name_it" required placeholder="es. Edilkamin Brice"
            className="w-full px-2 py-1.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-accent/50" />
        </div>
        <div>
          <label className="block text-xs text-muted mb-1">EN</label>
          <input name="name_en" placeholder="English name"
            className="w-full px-2 py-1.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-accent/50" />
        </div>
        <div>
          <label className="block text-xs text-muted mb-1">FR</label>
          <input name="name_fr" placeholder="Nom français"
            className="w-full px-2 py-1.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-accent/50" />
        </div>
        <div>
          <label className="block text-xs text-muted mb-1">ES</label>
          <input name="name_es" placeholder="Nombre español"
            className="w-full px-2 py-1.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-accent/50" />
        </div>
        <div className="flex items-center gap-2 col-span-2 md:col-span-4">
          <button type="submit" disabled={isPending}
            className="flex items-center gap-1 px-4 py-2 rounded-lg bg-accent text-white text-sm font-semibold disabled:opacity-50">
            {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            Aggiungi
          </button>
          <button type="button" onClick={() => { setOpen(false); setError(null); }}
            className="px-4 py-2 rounded-lg border border-border text-sm text-muted hover:text-foreground">
            Annulla
          </button>
          {error && <span className="text-xs text-red-600">{error}</span>}
        </div>
      </form>
    </div>
  );
}

export default function StovesClient({ initialStoves }: { initialStoves: Stove[] }) {
  const [stoveList, setStoveList] = useState<Stove[]>(initialStoves);

  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-background">
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wide">Nome (IT)</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wide">EN</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wide">FR / ES</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wide">Stato</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wide">Azioni</th>
            </tr>
          </thead>
          <tbody>
            {stoveList.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted">
                  Nessuna stufa aggiunta. Clicca &ldquo;Aggiungi stufa&rdquo; per iniziare.
                </td>
              </tr>
            ) : (
              stoveList.map((s) => (
                <StoveRow
                  key={s.id}
                  stove={s}
                  onDeleted={(id) => setStoveList((prev) => prev.filter((x) => x.id !== id))}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
      <AddRow onAdded={(s) => setStoveList((prev) => [...prev, s])} />
    </div>
  );
}
