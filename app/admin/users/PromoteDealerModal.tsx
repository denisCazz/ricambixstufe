"use client";

import { useState, useTransition } from "react";
import { X, Loader2, Store } from "lucide-react";
import { promoteToDealer } from "../actions/users";

const inputClass =
  "w-full px-3 py-2 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/50";

interface PromoteDealerModalProps {
  userId: string;
  email: string;
  initialCompany?: string;
  initialVat?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function PromoteDealerModal({
  userId,
  email,
  initialCompany = "",
  initialVat = "",
  onClose,
  onSuccess,
}: PromoteDealerModalProps) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    companyName: initialCompany,
    vatNumber: initialVat,
    approveImmediately: true,
    discountPercent: 50,
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await promoteToDealer(userId, form);
      if (result?.error) {
        setError(result.error);
        return;
      }
      onSuccess?.();
      onClose();
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md bg-surface border border-border rounded-2xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-accent" />
            <h2 className="font-semibold text-foreground">Configura rivenditore</h2>
          </div>
          <button onClick={onClose} className="text-muted hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-muted mb-4">
          Utente: <span className="font-medium text-foreground">{email}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-muted mb-1">Ragione sociale *</label>
            <input
              required
              value={form.companyName}
              onChange={(e) => setForm((f) => ({ ...f, companyName: e.target.value }))}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted mb-1">Partita IVA *</label>
            <input
              required
              value={form.vatNumber}
              onChange={(e) => setForm((f) => ({ ...f, vatNumber: e.target.value }))}
              placeholder="02450960261"
              className={inputClass}
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.approveImmediately}
              onChange={(e) =>
                setForm((f) => ({ ...f, approveImmediately: e.target.checked }))
              }
              className="rounded border-border"
            />
            Approva subito e attiva lo sconto
          </label>
          {form.approveImmediately && (
            <div>
              <label className="block text-xs font-medium text-muted mb-1">Sconto %</label>
              <input
                type="number"
                min={0}
                max={70}
                value={form.discountPercent}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    discountPercent: parseInt(e.target.value) || 0,
                  }))
                }
                className={inputClass}
              />
            </div>
          )}

          {error && (
            <p className="text-sm text-red-600 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-xl border border-border text-sm text-muted hover:text-foreground transition-colors"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={pending}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white text-sm font-semibold disabled:opacity-60"
            >
              {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {pending ? "Salvataggio..." : "Salva"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
