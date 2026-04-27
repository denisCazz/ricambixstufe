"use client";

import { useState, useTransition } from "react";
import { UserPlus, X, Loader2, CheckCircle, XCircle } from "lucide-react";
import { createUser } from "@/app/admin/actions/settings";

type Result = { ok: boolean; message: string } | null;

const roleLabels: Record<string, string> = {
  customer: "Cliente",
  dealer: "Rivenditore",
  admin: "Admin",
};

const inputClass =
  "w-full px-3 py-2 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/50";

export default function CreateUserModal() {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<Result>(null);
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({ email: "", password: "", firstName: "", lastName: "", role: "customer" });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.set(k, v));
    startTransition(async () => {
      const r = await createUser(fd);
      setResult(r);
      if (r.ok) setForm({ email: "", password: "", firstName: "", lastName: "", role: "customer" });
    });
  }

  function handleOpen() {
    setResult(null);
    setOpen(true);
  }

  return (
    <>
      <button
        onClick={handleOpen}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white text-sm font-semibold hover:shadow-md transition-shadow shrink-0"
      >
        <UserPlus className="w-4 h-4" />
        Nuovo utente
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />

          <div className="relative z-10 w-full max-w-md bg-surface border border-border rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-accent" />
                <h2 className="font-semibold text-foreground">Crea utente</h2>
              </div>
              <button onClick={() => setOpen(false)} className="text-muted hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted mb-1">Nome</label>
                  <input name="firstName" value={form.firstName} onChange={handleChange} placeholder="Mario" className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted mb-1">Cognome</label>
                  <input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Rossi" className={inputClass} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted mb-1">Email *</label>
                <input name="email" type="email" required value={form.email} onChange={handleChange} placeholder="mario@esempio.it" className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted mb-1">Password * <span className="text-muted font-normal">(min. 8 caratteri)</span></label>
                <input name="password" type="password" required minLength={8} value={form.password} onChange={handleChange} placeholder="••••••••" className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted mb-1">Ruolo</label>
                <select name="role" value={form.role} onChange={handleChange} className={inputClass}>
                  {Object.entries(roleLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>

              {result && (
                <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium ${result.ok ? "bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400 border border-green-200" : "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200"}`}>
                  {result.ok ? <CheckCircle className="w-4 h-4 shrink-0" /> : <XCircle className="w-4 h-4 shrink-0" />}
                  {result.message}
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setOpen(false)} className="flex-1 px-4 py-2 rounded-xl border border-border text-sm text-muted hover:text-foreground transition-colors">
                  Annulla
                </button>
                <button type="submit" disabled={pending} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white text-sm font-semibold disabled:opacity-60">
                  {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                  {pending ? "Creazione..." : "Crea utente"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
