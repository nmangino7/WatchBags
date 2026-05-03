"use client";

import { useState, useEffect } from "react";
import { DealCard } from "@/components/DealCard";
import { formatCurrency } from "@/lib/utils";
import {
  Bookmark,
  Bell,
  BellOff,
  Trash2,
  ShoppingCart,
  Loader2,
  Check,
} from "lucide-react";
import type { DealWithDetails } from "@/types";

interface WatchlistEntry {
  id: string;
  listingId: string;
  targetPrice?: number;
  alertEnabled: boolean;
  addedAt: string;
  listing: {
    id: string;
    source: string;
    sourceUrl: string;
    askingPrice: number;
    condition: string;
    stillActive: boolean;
    imageUrl?: string;
  } | null;
  model: {
    id: string;
    name: string;
    referenceNumber?: string;
    imageUrl?: string;
  } | null;
  brand: { id: string; name: string } | null;
  valuation: {
    fairMarketValue: number;
    confidence: string;
    netProfit: number;
    roiPercentage: number;
  } | null;
}

export default function WatchlistPage() {
  const [items, setItems] = useState<WatchlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [buyPrice, setBuyPrice] = useState("");

  useEffect(() => {
    fetch("/api/watchlist")
      .then((res) => res.json())
      .then((data) => setItems(data.watchlist || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const handleRemove = async (id: string) => {
    const res = await fetch(`/api/watchlist?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setItems(items.filter((i) => i.id !== id));
    }
  };

  const handleToggleAlert = (id: string) => {
    setItems(
      items.map((i) =>
        i.id === id ? { ...i, alertEnabled: !i.alertEnabled } : i
      )
    );
  };

  const handleBuy = async (item: WatchlistEntry) => {
    if (!item.model) return;
    const price = parseFloat(buyPrice) || item.listing?.askingPrice || 0;
    const res = await fetch("/api/inventory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        modelId: item.model.id,
        purchasePrice: price,
        condition: item.listing?.condition || "good",
        notes: `From watchlist — ${item.brand?.name} ${item.model?.name}`,
      }),
    });
    if (res.ok) {
      await handleRemove(item.id);
      setBuyingId(null);
      setBuyPrice("");
    }
  };

  const toDealDetails = (item: WatchlistEntry): DealWithDetails | null => {
    if (!item.listing || !item.model || !item.brand) return null;
    return {
      listing: {
        id: item.listing.id,
        modelId: item.model.id,
        source: item.listing.source,
        sourceUrl: item.listing.sourceUrl,
        askingPrice: item.listing.askingPrice,
        condition: item.listing.condition as DealWithDetails["listing"]["condition"],
        imageUrl: item.listing.imageUrl,
        foundAt: new Date(),
        stillActive: item.listing.stillActive,
      },
      model: {
        id: item.model.id,
        brandId: item.brand.id,
        name: item.model.name,
        referenceNumber: item.model.referenceNumber,
        msrp: 0,
        typicalResaleLow: 0,
        typicalResaleHigh: 0,
        imageUrl: item.model.imageUrl,
      },
      brand: {
        id: item.brand.id,
        name: item.brand.name,
        category: "watch",
      },
      valuation: item.valuation
        ? {
            id: "",
            listingId: item.listingId,
            fairMarketValue: item.valuation.fairMarketValue,
            confidence: item.valuation.confidence as DealWithDetails["valuation"]["confidence"],
            reasoning: "",
            redFlags: [],
            marketOutlook: "stable",
            estimatedProfit: 0,
            estimatedFees: 0,
            netProfit: item.valuation.netProfit,
            roiPercentage: item.valuation.roiPercentage,
            createdAt: new Date(),
          }
        : {
            id: "",
            listingId: item.listingId,
            fairMarketValue: 0,
            confidence: "low" as const,
            reasoning: "",
            redFlags: [],
            marketOutlook: "stable",
            estimatedProfit: 0,
            estimatedFees: 0,
            netProfit: 0,
            roiPercentage: 0,
            createdAt: new Date(),
          },
    };
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Bookmark className="w-8 h-8 text-gold" /> Watchlist
        </h1>
        <p className="text-muted-foreground mt-1">
          {loading ? "Loading..." : `${items.length} items saved`} &middot;
          Track prices and get alerts
        </p>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <Loader2 className="mx-auto h-8 w-8 text-gold animate-spin mb-4" />
          <p className="text-muted-foreground">Loading watchlist...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16">
          <Bookmark className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No saved items yet</h2>
          <p className="text-muted-foreground">
            Browse deals and save items you&apos;re interested in.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => {
            const deal = toDealDetails(item);
            return (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row gap-4 items-start"
              >
                <div className="flex-1 w-full">
                  {deal ? (
                    <DealCard deal={deal} />
                  ) : (
                    <div className="p-4 border border-border rounded-xl bg-card text-muted-foreground">
                      Listing data unavailable
                    </div>
                  )}
                </div>
                <div className="flex sm:flex-col gap-2 sm:pt-2">
                  {item.targetPrice && (
                    <div className="text-xs text-muted-foreground bg-card border border-border rounded-lg px-3 py-2">
                      Target: {formatCurrency(item.targetPrice)}
                    </div>
                  )}
                  {buyingId === item.id ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={buyPrice}
                        onChange={(e) => setBuyPrice(e.target.value)}
                        placeholder={item.listing?.askingPrice?.toString()}
                        className="w-24 rounded-lg border border-border bg-card px-2 py-1.5 text-xs"
                      />
                      <button
                        onClick={() => handleBuy(item)}
                        className="p-1.5 rounded-lg bg-emerald-600 text-white"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setBuyingId(item.id);
                        setBuyPrice(item.listing?.askingPrice?.toString() || "");
                      }}
                      className="p-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                      title="I Bought This"
                    >
                      <ShoppingCart className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleToggleAlert(item.id)}
                    className={`p-2 rounded-lg border transition-colors ${
                      item.alertEnabled
                        ? "border-gold bg-gold/10 text-gold"
                        : "border-border text-muted-foreground hover:border-gold/50"
                    }`}
                    title={item.alertEnabled ? "Alerts on" : "Alerts off"}
                  >
                    {item.alertEnabled ? (
                      <Bell className="w-4 h-4" />
                    ) : (
                      <BellOff className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="p-2 rounded-lg border border-border text-muted-foreground hover:border-loss-red hover:text-loss-red transition-colors"
                    title="Remove from watchlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
