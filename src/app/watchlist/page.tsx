"use client";

import { useState } from "react";
import { DealCard } from "@/components/DealCard";
import { getSeedData } from "@/lib/db/seed";
import { formatCurrency } from "@/lib/utils";
import { Bookmark, Bell, BellOff, Trash2 } from "lucide-react";
import type { WatchlistItem, DealWithDetails } from "@/types";

export default function WatchlistPage() {
  const { brands, models, listings, valuations, watchlistItems } = getSeedData();
  const [items, setItems] = useState<WatchlistItem[]>(watchlistItems);

  const watchlistDeals: (DealWithDetails & { watchlistItem: WatchlistItem })[] =
    items
      .map((wi) => {
        const listing = listings.find((l) => l.id === wi.listingId);
        if (!listing) return null;
        const model = models.find((m) => m.id === listing.modelId);
        const brand = model
          ? brands.find((b) => b.id === model.brandId)
          : null;
        const valuation = valuations.find((v) => v.listingId === listing.id);
        if (!model || !brand || !valuation) return null;
        return { listing, model, brand, valuation, watchlistItem: wi };
      })
      .filter(Boolean) as (DealWithDetails & {
      watchlistItem: WatchlistItem;
    })[];

  const handleRemove = (id: string) => {
    setItems(items.filter((i) => i.id !== id));
  };

  const handleToggleAlert = (id: string) => {
    setItems(
      items.map((i) =>
        i.id === id ? { ...i, alertEnabled: !i.alertEnabled } : i
      )
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Bookmark className="w-8 h-8 text-gold" /> Watchlist
        </h1>
        <p className="text-muted-foreground mt-1">
          {items.length} items saved &middot; Track prices and get alerts
        </p>
      </div>

      {watchlistDeals.length === 0 ? (
        <div className="text-center py-16">
          <Bookmark className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No saved items yet</h2>
          <p className="text-muted-foreground">
            Browse deals and save items you&apos;re interested in.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {watchlistDeals.map((deal) => (
            <div
              key={deal.watchlistItem.id}
              className="flex flex-col sm:flex-row gap-4 items-start"
            >
              <div className="flex-1 w-full">
                <DealCard deal={deal} />
              </div>
              <div className="flex sm:flex-col gap-2 sm:pt-2">
                {deal.watchlistItem.targetPrice && (
                  <div className="text-xs text-muted-foreground bg-card border border-border rounded-lg px-3 py-2">
                    Target: {formatCurrency(deal.watchlistItem.targetPrice)}
                  </div>
                )}
                <button
                  onClick={() => handleToggleAlert(deal.watchlistItem.id)}
                  className={`p-2 rounded-lg border transition-colors ${
                    deal.watchlistItem.alertEnabled
                      ? "border-gold bg-gold/10 text-gold"
                      : "border-border text-muted-foreground hover:border-gold/50"
                  }`}
                  title={
                    deal.watchlistItem.alertEnabled
                      ? "Alerts on"
                      : "Alerts off"
                  }
                >
                  {deal.watchlistItem.alertEnabled ? (
                    <Bell className="w-4 h-4" />
                  ) : (
                    <BellOff className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => handleRemove(deal.watchlistItem.id)}
                  className="p-2 rounded-lg border border-border text-muted-foreground hover:border-loss-red hover:text-loss-red transition-colors"
                  title="Remove from watchlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
