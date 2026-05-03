"use client";

import { useState, useEffect } from "react";
import { TrendChart } from "@/components/TrendChart";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import type { Brand, Model, PriceHistoryPoint, TrendDataPoint } from "@/types";

export default function TrendsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [priceHistory, setPriceHistory] = useState<PriceHistoryPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<
    "all" | "watch" | "handbag"
  >("all");

  useEffect(() => {
    fetch("/api/trends")
      .then((res) => res.json())
      .then((data) => {
        setBrands(data.brands || []);
        setModels(data.models || []);
        setPriceHistory(data.priceHistory || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filteredBrands =
    selectedCategory === "all"
      ? brands
      : brands.filter((b) => b.category === selectedCategory);

  const brandTrends = filteredBrands
    .map((brand) => {
      const brandModels = models.filter((m) => m.brandId === brand.id);
      const brandHistory = priceHistory.filter((p) =>
        brandModels.some((m) => m.id === p.modelId)
      );

      if (brandHistory.length < 2) return null;

      const sorted = [...brandHistory].sort(
        (a, b) =>
          new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
      );

      const recentPrices = sorted.slice(-10);
      const olderPrices = sorted.slice(0, Math.max(1, sorted.length - 10));

      const avgRecent =
        recentPrices.reduce((s, p) => s + p.price, 0) / recentPrices.length;
      const avgOlder =
        olderPrices.reduce((s, p) => s + p.price, 0) / olderPrices.length;
      const change = ((avgRecent - avgOlder) / avgOlder) * 100;

      const chartData: TrendDataPoint[] = sorted.map((p) => ({
        date:
          typeof p.recordedAt === "string"
            ? p.recordedAt
            : new Date(p.recordedAt).toISOString(),
        value: p.price,
        label: brand.name,
      }));

      return {
        brand,
        avgPrice: avgRecent,
        change,
        chartData,
        modelCount: brandModels.length,
      };
    })
    .filter(Boolean)
    .sort((a, b) => Math.abs(b!.change) - Math.abs(a!.change));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Market Trends</h1>
        <p className="text-muted-foreground mt-1">
          Track price movements across luxury brands
        </p>
      </div>

      <div className="flex gap-2 mb-6">
        {(["all", "watch", "handbag"] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              selectedCategory === cat
                ? "bg-gold text-black"
                : "bg-card border border-border text-foreground hover:border-gold/50"
            }`}
          >
            {cat === "all" ? "All" : cat === "watch" ? "Watches" : "Handbags"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16">
          <Loader2 className="mx-auto h-8 w-8 text-gold animate-spin mb-4" />
          <p className="text-muted-foreground">Loading trends...</p>
        </div>
      ) : brandTrends.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg mb-2">No trend data available yet</p>
          <p className="text-sm">
            Price history builds up as you scan for deals. Run a few scans to
            start seeing trends.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {brandTrends.map((trend) => (
            <div
              key={trend!.brand.id}
              className="bg-card border border-border rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">
                    {trend!.brand.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {trend!.modelCount} models tracked &middot; Avg{" "}
                    {formatCurrency(trend!.avgPrice)}
                  </p>
                </div>
                <div
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-medium ${
                    trend!.change >= 0
                      ? "bg-profit-green/10 text-profit-green"
                      : "bg-loss-red/10 text-loss-red"
                  }`}
                >
                  {trend!.change >= 0 ? (
                    <TrendingUp className="w-3.5 h-3.5" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5" />
                  )}
                  {Math.abs(trend!.change).toFixed(1)}%
                </div>
              </div>
              <TrendChart data={trend!.chartData} title={trend!.brand.name} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
