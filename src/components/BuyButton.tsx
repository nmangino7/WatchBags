"use client";

import { useState } from "react";
import { ShoppingCart, Loader2, Check } from "lucide-react";
import type { Condition } from "@/types";

interface BuyButtonProps {
  listingId: string;
  modelId: string;
  askingPrice: number;
  condition: Condition;
}

export function BuyButton({ listingId, modelId, askingPrice, condition }: BuyButtonProps) {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [price, setPrice] = useState(askingPrice.toString());
  const [notes, setNotes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modelId,
          purchasePrice: parseFloat(price),
          condition,
          notes: notes || `From listing ${listingId}`,
        }),
      });
      if (res.ok) {
        setDone(true);
        setShowForm(false);
        // Remove from watchlist if it was there
        await fetch(`/api/watchlist?listingId=${listingId}`, { method: "DELETE" }).catch(() => {});
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium">
        <Check className="w-4 h-4" /> Added to Inventory
      </span>
    );
  }

  if (showForm) {
    return (
      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <div>
          <label className="block text-xs text-muted-foreground mb-1">Purchase Price</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-28 rounded-lg border border-border bg-card px-3 py-2 text-sm"
            required
            min="1"
            step="0.01"
          />
        </div>
        <div>
          <label className="block text-xs text-muted-foreground mb-1">Notes</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional"
            className="w-32 rounded-lg border border-border bg-card px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-500 transition-colors"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          Confirm
        </button>
        <button
          type="button"
          onClick={() => setShowForm(false)}
          className="px-3 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Cancel
        </button>
      </form>
    );
  }

  return (
    <button
      onClick={() => setShowForm(true)}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-500 transition-colors"
    >
      <ShoppingCart className="w-4 h-4" /> I Bought This
    </button>
  );
}
