"use client";

import { getSeedData } from "@/lib/db/seed";
import { formatCurrency, formatDate } from "@/lib/utils";
import { StatsCard } from "@/components/StatsCard";
import {
  DollarSign,
  TrendingUp,
  BarChart3,
  Calendar,
} from "lucide-react";

export default function SalesPage() {
  const { inventoryItems, models, brands } = getSeedData();

  const soldItems = inventoryItems
    .filter((i) => i.status === "sold" && i.salePrice)
    .map((item) => {
      const model = models.find((m) => m.id === item.modelId);
      const brand = model ? brands.find((b) => b.id === model.brandId) : null;
      const profit = (item.salePrice || 0) - item.purchasePrice;
      const roi = (profit / item.purchasePrice) * 100;
      return { ...item, model, brand, profit, roi };
    })
    .sort(
      (a, b) =>
        new Date(b.saleDate || 0).getTime() -
        new Date(a.saleDate || 0).getTime()
    );

  const totalRevenue = soldItems.reduce(
    (sum, i) => sum + (i.salePrice || 0),
    0
  );
  const totalCost = soldItems.reduce((sum, i) => sum + i.purchasePrice, 0);
  const totalProfit = totalRevenue - totalCost;
  const avgRoi =
    soldItems.length > 0
      ? soldItems.reduce((sum, i) => sum + i.roi, 0) / soldItems.length
      : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Sales Tracker</h1>
        <p className="text-muted-foreground mt-1">
          Track your P&amp;L and sales performance
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          change={0}
          icon={<DollarSign className="w-5 h-5" />}
          subtitle={`${soldItems.length} items sold`}
        />
        <StatsCard
          title="Total Profit"
          value={formatCurrency(totalProfit)}
          change={totalProfit > 0 ? 100 : -100}
          icon={<TrendingUp className="w-5 h-5" />}
          subtitle="After costs"
        />
        <StatsCard
          title="Avg ROI"
          value={`${avgRoi.toFixed(1)}%`}
          change={avgRoi}
          icon={<BarChart3 className="w-5 h-5" />}
          subtitle="Return on investment"
        />
        <StatsCard
          title="Total Items Sold"
          value={soldItems.length.toString()}
          change={0}
          icon={<Calendar className="w-5 h-5" />}
          subtitle="All time"
        />
      </div>

      {/* Sales Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold">Sales History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left text-sm text-muted-foreground">
                <th className="px-6 py-3 font-medium">Item</th>
                <th className="px-6 py-3 font-medium">Purchase Price</th>
                <th className="px-6 py-3 font-medium">Sale Price</th>
                <th className="px-6 py-3 font-medium">Profit</th>
                <th className="px-6 py-3 font-medium">ROI</th>
                <th className="px-6 py-3 font-medium">Platform</th>
                <th className="px-6 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {soldItems.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium">
                        {item.brand?.name ?? "Unknown"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {item.model?.name ?? "Unknown"}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {formatCurrency(item.purchasePrice)}
                  </td>
                  <td className="px-6 py-4 font-medium">
                    {formatCurrency(item.salePrice || 0)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={
                        item.profit >= 0
                          ? "text-profit-green font-medium"
                          : "text-loss-red font-medium"
                      }
                    >
                      {item.profit >= 0 ? "+" : ""}
                      {formatCurrency(item.profit)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-sm font-medium ${
                        item.roi >= 0 ? "text-profit-green" : "text-loss-red"
                      }`}
                    >
                      {item.roi >= 0 ? "+" : ""}
                      {item.roi.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {item.platform || "N/A"}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {item.saleDate ? formatDate(item.saleDate) : "N/A"}
                  </td>
                </tr>
              ))}
              {soldItems.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-muted-foreground"
                  >
                    No sales recorded yet. Mark items as sold in your inventory.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
