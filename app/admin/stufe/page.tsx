import { getStoves } from "@/app/admin/actions/stoves";
import StovesClient from "./StovesClient";
import { Flame } from "lucide-react";

export default async function StovePage() {
  const stoves = await getStoves();

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-950/40 flex items-center justify-center">
          <Flame className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Elenco stufe</h1>
          <p className="text-sm text-muted mt-0.5">Gestisci le stufe compatibili da associare ai prodotti</p>
        </div>
      </div>

      <StovesClient initialStoves={stoves} />
    </div>
  );
}
