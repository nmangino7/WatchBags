"use client";

import { useState } from "react";
import { TrendChart } from "@/components/TrendChart";
import { getSeedData } from "@/lib/db/seed";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function TrendsPage() {
  const { brands, models, priceHistory } = getSeedData();
  const [selectedCategory, setSelectedCategory] = useState<
    "all" | "watch" | "handbag"
  >("all");

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

      const chartData = sorted.map((p) => ({
        date: typeof p.recordedAt === "string" ? p.recordedAt : p.recordedAt.toISOString(),
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

      {/* Category Filter */}
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

      {/* Market Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {brandTrends.map((trend) => (
          <div
            key={trend!.brand.id}
            className="bg-card border border-border rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">{trend!.brand.name}</h3>
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
            <TrendChart
              data={trend!.chartData}
              title={trend!.brand.name}
            />
          </div>
        ))}
      </div>

      {brandTrends.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          No trend data available for this category yet.
        </div>
      )}
    </div>
  );
}
