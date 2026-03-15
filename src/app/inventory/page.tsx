"use client";

import { InventoryTable } from "@/components/InventoryTable";
import { StatsCard } from "@/components/StatsCard";
import { getSeedData } from "@/lib/db/seed";
import { formatCurrency } from "@/lib/utils";
import { Package, DollarSign, TrendingUp, ShoppingCart } from "lucide-react";

export default function InventoryPage() {
  const { inventoryItems: items } = getSeedData();

  const inHand = items.filter((i) => i.status === "in_hand");
  const listed = items.filter((i) => i.status === "listed");
  const sold = items.filter((i) => i.status === "sold");

  const totalInvested = inHand
    .concat(listed)
    .reduce((sum, i) => sum + i.purchasePrice, 0);
  const totalRevenue = sold.reduce((sum, i) => sum + (i.salePrice || 0), 0);
  const totalCostOfSold = sold.reduce((sum, i) => sum + i.purchasePrice, 0);
  const totalProfit = totalRevenue - totalCostOfSold;

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

      <InventoryTable items={items} />
    </div>
  );
}
