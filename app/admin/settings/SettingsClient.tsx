"use client";

import { useState, useTransition } from "react";
import { Database, Mail, UserPlus, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { testDbConnection, testEmail, createUser } from "@/app/admin/actions/settings";

type Result = { ok: boolean; message: string } | null;

function StatusBadge({ result }: { result: Result }) {
  if (!result) return null;
  return (
    <div
      className={`flex items-center gap-2 mt-3 px-3 py-2 rounded-xl text-sm font-medium ${
        result.ok
          ? "bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800"
          : "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800"
      }`}
    >
      {result.ok ? <CheckCircle className="w-4 h-4 shrink-0" /> : <XCircle className="w-4 h-4 shrink-0" />}
      {result.message}
    </div>
  );
}

function TestCard({
  icon: Icon,
  title,
  description,
  buttonLabel,
  onTest,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  buttonLabel: string;
  onTest: () => Promise<Result>;
}) {
  const [result, setResult] = useState<Result>(null);
  const [pending, startTransition] = useTransition();

  function handleTest() {
    startTransition(async () => {
      const r = await onTest();
      setResult(r);
    });
  }

  return (
    <div className="bg-surface border border-border rounded-2xl p-5">
      <div className="flex items-center gap-3 mb-1">
        <div className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-orange-950/40 flex items-center justify-center">
          <Icon className="w-4.5 h-4.5 text-accent" />
        </div>
        <h2 className="font-semibold text-foreground">{title}</h2>
      </div>
      <p className="text-sm text-muted mb-4">{description}</p>
      <button
        onClick={handleTest}
        disabled={pending}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-foreground text-background text-sm font-medium disabled:opacity-60 transition-opacity"
      >
        {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Icon className="w-4 h-4" />}
        {pending ? "In corso..." : buttonLabel}
      </button>
      <StatusBadge result={result} />
    </div>
  );
}

const roleLabels: Record<string, string> = {
  customer: "Cliente",
  dealer: "Rivenditore",
  admin: "Admin",
};

export default function SettingsClient() {
  const [createResult, setCreateResult] = useState<Result>(null);
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    role: "customer",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.set(k, v));
    startTransition(async () => {
      const r = await createUser(fd);
      setCreateResult(r);
      if (r.ok) {
        setForm({ email: "", password: "", firstName: "", lastName: "", role: "customer" });
      }
    });
  }

  const inputClass =
    "w-full px-3 py-2 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/50";

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-foreground">Impostazioni</h1>

      {/* Diagnostics */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted mb-4">Diagnostica</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <TestCard
            icon={Database}
            title="Connessione Database"
            description="Verifica che il database PostgreSQL sia raggiungibile e risponda correttamente."
            buttonLabel="Testa connessione"
            onTest={testDbConnection}
          />
          <TestCard
            icon={Mail}
            title="Invio Email"
            description={`Invia un'email di prova all'indirizzo admin configurato (ADMIN_EMAIL).`}
            buttonLabel="Invia email di prova"
            onTest={testEmail}
          />
        </div>
      </section>

      {/* Create user */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted mb-4">Crea utente</h2>
        <div className="bg-surface border border-border rounded-2xl p-5 max-w-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-orange-950/40 flex items-center justify-center">
              <UserPlus className="w-4.5 h-4.5 text-accent" />
            </div>
            <h3 className="font-semibold text-foreground">Aggiungi utente manualmente</h3>
          </div>
          <form onSubmit={handleCreate} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-muted mb-1">Nome</label>
                <input
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  placeholder="Mario"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted mb-1">Cognome</label>
                <input
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  placeholder="Rossi"
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1">Email *</label>
              <input
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="mario@esempio.it"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1">Password * (min. 8 caratteri)</label>
              <input
                name="password"
                type="password"
                required
                minLength={8}
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1">Ruolo</label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className={inputClass}
              >
                {Object.entries(roleLabels).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={pending}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white text-sm font-semibold disabled:opacity-60 transition-opacity hover:shadow-md"
            >
              {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              {pending ? "Creazione..." : "Crea utente"}
            </button>
            <StatusBadge result={createResult} />
          </form>
        </div>
      </section>
    </div>
  );
}
