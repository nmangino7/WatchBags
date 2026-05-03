"use client";

import { useState, useEffect } from "react";
import { StatsCard } from "@/components/StatsCard";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Package,
  DollarSign,
  TrendingUp,
  ShoppingCart,
  Loader2,
  Tag,
  Check,
  ArrowRight,
} from "lucide-react";

interface InventoryEntry {
  id: string;
  modelId: string;
  purchasePrice: number;
  purchaseDate: string;
  condition: string;
  status: "in_hand" | "listed" | "sold";
  salePrice?: number;
  saleDate?: string;
  platform?: string;
  notes?: string;
  model?: { id: string; name: string; referenceNumber?: string } | null;
  brand?: { id: string; name: string } | null;
}

const STATUS_CONFIG = {
  in_hand: { label: "In Hand", className: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  listed: { label: "Listed", className: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  sold: { label: "Sold", className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
};

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [salePrice, setSalePrice] = useState("");
  const [platform, setPlatform] = useState("");

  useEffect(() => {
    fetch("/api/inventory")
      .then((res) => res.json())
      .then((data) => setItems(data.inventory || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const inHand = items.filter((i) => i.status === "in_hand");
  const listed = items.filter((i) => i.status === "listed");
  const sold = items.filter((i) => i.status === "sold");

  const totalInvested = inHand.concat(listed).reduce((sum, i) => sum + i.purchasePrice, 0);
  const totalRevenue = sold.reduce((sum, i) => sum + (i.salePrice || 0), 0);
  const totalCostOfSold = sold.reduce((sum, i) => sum + i.purchasePrice, 0);
  const totalProfit = totalRevenue - totalCostOfSold;

  const updateStatus = async (id: string, status: string, extra?: Record<string, unknown>) => {
    const res = await fetch("/api/inventory", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status, ...extra }),
    });
    if (res.ok) {
      const data = await res.json();
      setItems(items.map((i) => (i.id === id ? { ...i, ...data.item } : i)));
      setActionId(null);
      setSalePrice("");
      setPlatform("");
    }
  };

  const handleMarkListed = async (id: string) => {
    await updateStatus(id, "listed", { platform: platform || undefined });
  };

  const handleMarkSold = async (id: string) => {
    const price = parseFloat(salePrice);
    if (isNaN(price) || price <= 0) return;
    await updateStatus(id, "sold", {
      salePrice: price,
      saleDate: new Date().toISOString(),
      platform: platform || undefined,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Inventory Manager</h1>
        <p className="text-muted-foreground mt-1">
          Track your purchases, listings, and sales
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title="In Hand"
          value={inHand.length.toString()}
          change={0}
          icon={<Package className="w-5 h-5" />}
          subtitle={`${formatCurrency(totalInvested)} invested`}
        />
        <StatsCard
          title="Listed"
          value={listed.length.toString()}
          change={0}
          icon={<ShoppingCart className="w-5 h-5" />}
          subtitle="Active listings"
        />
        <StatsCard
          title="Sold"
          value={sold.length.toString()}
          change={0}
          icon={<DollarSign className="w-5 h-5" />}
          subtitle={`${formatCurrency(totalRevenue)} revenue`}
        />
        <StatsCard
          title="Total Profit"
          value={formatCurrency(totalProfit)}
          change={totalProfit > 0 ? 100 : -100}
          icon={<TrendingUp className="w-5 h-5" />}
          subtitle="From sold items"
        />
      </div>

      {/* Inventory Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold">
            Inventory ({items.length} items)
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="px-6 py-3">Item</th>
                <th className="px-6 py-3">Purchase</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Profit/Loss</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Loader2 className="mx-auto h-6 w-6 text-gold animate-spin" />
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    No inventory items yet. Buy deals to start tracking.
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  const statusConfig = STATUS_CONFIG[item.status];
                  const profit = item.status === "sold" && item.salePrice
                    ? item.salePrice - item.purchasePrice
                    : 0;

                  return (
                    <tr
                      key={item.id}
                      className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <p className="text-xs font-semibold uppercase tracking-wider text-gold">
                          {item.brand?.name ?? "Unknown"}
                        </p>
                        <p className="text-sm font-medium">
                          {item.model?.name ?? item.modelId}
                        </p>
                        {item.notes && (
                          <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-[200px]">
                            {item.notes}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold">
                          {formatCurrency(item.purchasePrice)}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {formatDate(item.purchaseDate)}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block rounded-md border px-2 py-0.5 text-xs font-medium ${statusConfig.className}`}
                        >
                          {statusConfig.label}
                        </span>
                        {item.platform && (
                          <p className="text-[10px] text-muted-foreground mt-1">
                            {item.platform}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {item.status === "sold" && item.salePrice ? (
                          <div>
                            <p className={`text-sm font-semibold ${profit >= 0 ? "text-profit-green" : "text-loss-red"}`}>
                              {profit >= 0 ? "+" : ""}{formatCurrency(profit)}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              Sold for {formatCurrency(item.salePrice)}
                            </p>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {actionId === item.id ? (
                          <div className="flex flex-col gap-1.5">
                            {item.status === "in_hand" && (
                              <>
                                <input
                                  type="text"
                                  value={platform}
                                  onChange={(e) => setPlatform(e.target.value)}
                                  placeholder="Platform (eBay, etc)"
                                  className="w-36 rounded border border-border bg-card px-2 py-1 text-xs"
                                />
                                <button
                                  onClick={() => handleMarkListed(item.id)}
                                  className="inline-flex items-center gap-1 rounded bg-amber-600 px-2 py-1 text-xs font-medium text-white"
                                >
                                  <Tag className="w-3 h-3" /> List for Sale
                                </button>
                              </>
                            )}
                            {item.status === "listed" && (
                              <>
                                <input
                                  type="number"
                                  value={salePrice}
                                  onChange={(e) => setSalePrice(e.target.value)}
                                  placeholder="Sale price"
                                  className="w-28 rounded border border-border bg-card px-2 py-1 text-xs"
                                  required
                                />
                                <button
                                  onClick={() => handleMarkSold(item.id)}
                                  className="inline-flex items-center gap-1 rounded bg-emerald-600 px-2 py-1 text-xs font-medium text-white"
                                >
                                  <Check className="w-3 h-3" /> Mark Sold
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => setActionId(null)}
                              className="text-xs text-muted-foreground hover:text-foreground"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-1.5">
                            {item.status === "in_hand" && (
                              <button
                                onClick={() => {
                                  setActionId(item.id);
                                  setPlatform("");
                                }}
                                className="inline-flex items-center gap-1 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1.5 text-xs font-medium text-amber-400 hover:bg-amber-500/20 transition-colors"
                              >
                                <Tag className="w-3 h-3" /> List
                              </button>
                            )}
                            {item.status === "listed" && (
                              <button
                                onClick={() => {
                                  setActionId(item.id);
                                  setSalePrice("");
                                }}
                                className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1.5 text-xs font-medium text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                              >
                                <ArrowRight className="w-3 h-3" /> Sold
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
