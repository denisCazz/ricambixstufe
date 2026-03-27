"use client";

import { useState, useTransition } from "react";
import { Check, X } from "lucide-react";
import { approveDealer, rejectDealer } from "../actions/dealers";

export default function DealerActions({
  dealerId,
  status,
}: {
  dealerId: string;
  status: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [discount, setDiscount] = useState(10);
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState("");

  if (status !== "pending") return null;

  const handleApprove = () => {
    startTransition(async () => {
      const result = await approveDealer(dealerId, discount);
      if (result?.error) alert(result.error);
    });
  };

  const handleReject = () => {
    startTransition(async () => {
      const result = await rejectDealer(dealerId, reason);
      if (result?.error) alert(result.error);
    });
  };

  return (
    <div className={`shrink-0 space-y-3 ${isPending ? "opacity-50 pointer-events-none" : ""}`}>
      {!showReject ? (
        <div className="flex items-center gap-2">
          <label className="text-xs text-muted whitespace-nowrap">Sconto %</label>
          <input
            type="number"
            min={0}
            max={50}
            value={discount}
            onChange={(e) => setDiscount(parseInt(e.target.value) || 0)}
            className="w-16 px-2 py-1.5 rounded-lg border border-border text-sm text-center focus:outline-none focus:border-accent/50"
          />
          <button
            onClick={handleApprove}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-medium hover:bg-green-700 transition-colors"
          >
            <Check className="w-3.5 h-3.5" />
            Approva
          </button>
          <button
            onClick={() => setShowReject(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-medium hover:bg-red-700 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Rifiuta
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Motivo del rifiuto (opzionale)"
            className="flex-1 px-3 py-1.5 rounded-lg border border-border text-sm placeholder:text-muted focus:outline-none focus:border-accent/50 min-w-[200px]"
          />
          <button
            onClick={handleReject}
            className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-medium hover:bg-red-700 transition-colors whitespace-nowrap"
          >
            Conferma
          </button>
          <button
            onClick={() => setShowReject(false)}
            className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-surface-hover transition-colors whitespace-nowrap"
          >
            Annulla
          </button>
        </div>
      )}
    </div>
  );
}
