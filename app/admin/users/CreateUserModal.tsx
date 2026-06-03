"use client";

import { useState, useTransition } from "react";
import { UserPlus, X, Loader2, CheckCircle, XCircle, AlertTriangle, ShieldCheck } from "lucide-react";
import { createUser, checkVatNumber } from "@/app/admin/actions/settings";
import type { VatCheckResult } from "@/app/admin/actions/settings";

type Result = { ok: boolean; message: string } | null;

const roleLabels: Record<string, string> = {
  customer: "Cliente",
  dealer: "Rivenditore",
  admin: "Admin",
};

const inputClass =
  "w-full px-3 py-2 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/50";

function VatCheckBadge({ result }: { result: VatCheckResult | null }) {
  if (!result) return null;
  const styles = {
    valid: "bg-green-50 dark:bg-green-950/40 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400",
    invalid: "bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400",
    unverifiable: "bg-yellow-50 dark:bg-yellow-950/40 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-400",
    error: "bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400",
  };
  const icons = {
    valid: <CheckCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />,
    invalid: <XCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />,
    unverifiable: <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />,
    error: <XCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />,
  };
  return (
    <div className={`flex items-start gap-2 mt-2 px-3 py-2 rounded-xl border ${styles[result.status]}`}>
      {icons[result.status]}
      <p className="text-xs">{result.message}</p>
    </div>
  );
}

export default function CreateUserModal() {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<Result>(null);
  const [pending, startTransition] = useTransition();
  const [checkPending, startCheckTransition] = useTransition();
  const [vatCheck, setVatCheck] = useState<VatCheckResult | null>(null);
  const [form, setForm] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    role: "customer",
    companyName: "",
    vatNumber: "",
    vatCountry: "IT",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    if (name === "vatNumber" || name === "vatCountry") setVatCheck(null);
    setForm((f) => ({ ...f, [name]: value }));
  }

  function handleCheckVat() {
    startCheckTransition(async () => {
      const r = await checkVatNumber(form.vatCountry, form.vatNumber);
      setVatCheck(r);
      if (r.status === "valid" && r.companyName && !form.companyName) {
        setForm((f) => ({ ...f, companyName: r.companyName! }));
      }
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.set(k, v));
    startTransition(async () => {
      const r = await createUser(fd);
      setResult(r);
      if (r.ok) {
        setVatCheck(null);
        setForm({
          email: "",
          password: "",
          firstName: "",
          lastName: "",
          role: "customer",
          companyName: "",
          vatNumber: "",
          vatCountry: "IT",
        });
      }
    });
  }

  function handleOpen() {
    setResult(null);
    setVatCheck(null);
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
                <input name="password" type="password" required minLength={8} value={form.password} onChange={handleChange} placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢" className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted mb-1">Ruolo</label>
                <select name="role" value={form.role} onChange={handleChange} className={inputClass}>
                  {Object.entries(roleLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>

              {form.role === "dealer" && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-muted mb-1">Ragione sociale *</label>
                    <input
                      name="companyName"
                      required
                      value={form.companyName}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted mb-1">Paese (P.IVA)</label>
                    <select name="vatCountry" value={form.vatCountry} onChange={handleChange} className={inputClass}>
                      <option value="IT">IT â€“ Italia</option>
                      <option value="DE">DE â€“ Germania</option>
                      <option value="FR">FR â€“ Francia</option>
                      <option value="ES">ES â€“ Spagna</option>
                      <option value="AT">AT â€“ Austria</option>
                      <option value="BE">BE â€“ Belgio</option>
                      <option value="NL">NL â€“ Olanda</option>
                      <option value="PL">PL â€“ Polonia</option>
                      <option value="PT">PT â€“ Portogallo</option>
                      <option value="GR">GR â€“ Grecia</option>
                      <option value="HR">HR â€“ Croazia</option>
                      <option value="RO">RO â€“ Romania</option>
                      <option value="CZ">CZ â€“ Repubblica Ceca</option>
                      <option value="HU">HU â€“ Ungheria</option>
                      <option value="SE">SE â€“ Svezia</option>
                      <option value="DK">DK â€“ Danimarca</option>
                      <option value="FI">FI â€“ Finlandia</option>
                      <option value="SK">SK â€“ Slovacchia</option>
                      <option value="SI">SI â€“ Slovenia</option>
                      <option value="BG">BG â€“ Bulgaria</option>
                      <option value="LU">LU â€“ Lussemburgo</option>
                      <option value="IE">IE â€“ Irlanda</option>
                      <option value="EE">EE â€“ Estonia</option>
                      <option value="LV">LV â€“ Lettonia</option>
                      <option value="LT">LT â€“ Lituania</option>
                      <option value="MT">MT â€“ Malta</option>
                      <option value="CY">CY â€“ Cipro</option>
                      <option value="EXTRA">Extra-UE (nessuna validazione formato)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted mb-1">Partita IVA / VAT *</label>
                    <div className="flex gap-2">
                      <input
                        name="vatNumber"
                        required
                        value={form.vatNumber}
                        onChange={handleChange}
                        placeholder={form.vatCountry === "IT" ? "02450960261" : form.vatCountry === "EXTRA" ? "Numero IVA estero" : `${form.vatCountry}123456789`}
                        className={inputClass}
                      />
                      <button
                        type="button"
                        onClick={handleCheckVat}
                        disabled={checkPending || !form.vatNumber}
                        className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border text-xs font-medium text-foreground hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-50 transition-colors"
                      >
                        {checkPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                        Verifica
                      </button>
                    </div>
                    <VatCheckBadge result={vatCheck} />
                  </div>
                </>
              )}

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

