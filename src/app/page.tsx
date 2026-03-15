"use client";

import Link from "next/link";
import { StatsCard } from "@/components/StatsCard";
import { DealCard } from "@/components/DealCard";
import { ScanProgress } from "@/components/ScanProgress";
import { getSeedData } from "@/lib/db/seed";
import { formatCurrency } from "@/lib/utils";
import {
  TrendingUp,
  Watch,
  ShoppingBag,
  DollarSign,
  ArrowRight,
  Plus,
  Search,
} from "lucide-react";

export default function Dashboard() {
  const { brands, models, listings, valuations } = getSeedData();

  const dealsWithDetails = listings
    .filter((l) => l.stillActive)
    .map((listing) => {
      const model = models.find((m) => m.id === listing.modelId);
      const brand = model ? brands.find((b) => b.id === model.brandId) : null;
      const valuation = valuations.find((v) => v.listingId === listing.id);
      if (!model || !brand || !valuation || valuation.netProfit <= 0)
        return null;
      return { listing, model, brand, valuation };
    })
    .filter(Boolean)
    .sort((a, b) => b!.valuation.netProfit - a!.valuation.netProfit);

  const totalDeals = dealsWithDetails.length;
  const totalPotentialProfit = dealsWithDetails.reduce(
    (sum, d) => sum + d!.valuation.netProfit,
    0
  );
  const watchDeals = dealsWithDetails.filter(
    (d) => d!.brand.category === "watch"
  ).length;
  const bagDeals = dealsWithDetails.filter(
    (d) => d!.brand.category === "handbag"
  ).length;

  const isEmpty = totalDeals === 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold">
          Welcome to{" "}
          <span className="text-gold">WatchBags</span>
        </h1>
        <p className="mt-2 text-muted-foreground text-lg">
          Your AI-powered luxury resale intelligence platform
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title="Active Deals"
          value={totalDeals.toString()}
          change={0}
          icon={<TrendingUp className="w-5 h-5" />}
          subtitle="Profitable items found"
        />
        <StatsCard
          title="Potential Profit"
          value={formatCurrency(totalPotentialProfit)}
          change={0}
          icon={<DollarSign className="w-5 h-5" />}
          subtitle="If all deals are flipped"
        />
        <StatsCard
          title="Watch Deals"
          value={watchDeals.toString()}
          change={0}
          icon={<Watch className="w-5 h-5" />}
          subtitle="Underpriced watches"
        />
        <StatsCard
          title="Bag Deals"
          value={bagDeals.toString()}
          change={0}
          icon={<ShoppingBag className="w-5 h-5" />}
          subtitle="Underpriced handbags"
        />
      </div>

      {/* Empty State / Scan Section */}
      {isEmpty ? (
        <div className="mb-8 rounded-2xl border border-border bg-card p-8 text-center">
          <Search className="mx-auto h-12 w-12 text-gold/50 mb-4" />
          <h2 className="text-2xl font-semibold mb-2">No Deals Yet</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Scan eBay, Chrono24, Bob&apos;s Watches, and Reddit to find real
            underpriced watches and handbags, or add deals manually.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
            <Link
              href="/add"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-6 py-3 text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              <Plus className="h-4 w-4" /> Add Deal Manually
            </Link>
          </div>

          <ScanProgress variant="large" />
        </div>
      ) : (
        /* Top Deals Section */
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-semibold">Top Deals</h2>
              <p className="text-muted-foreground">
                Highest profit opportunities right now
              </p>
            </div>
            <div className="flex items-center gap-3">
              <ScanProgress variant="small" />
              <Link
                href="/deals"
                className="flex items-center gap-1 text-gold hover:text-gold-light transition-colors font-medium"
              >
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dealsWithDetails.slice(0, 6).map((deal) => (
              <DealCard
                key={deal!.listing.id}
                deal={{
                  listing: deal!.listing,
                  model: deal!.model,
                  brand: deal!.brand,
                  valuation: deal!.valuation,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/deals"
          className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border hover:border-gold/50 transition-all group"
        >
          <div className="p-2 rounded-lg bg-gold/10 text-gold group-hover:bg-gold/20 transition-colors">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold">Browse Deals</h3>
            <p className="text-sm text-muted-foreground">
              Find underpriced items
            </p>
          </div>
        </Link>
        <Link
          href="/add"
          className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border hover:border-gold/50 transition-all group"
        >
          <div className="p-2 rounded-lg bg-gold/10 text-gold group-hover:bg-gold/20 transition-colors">
            <Plus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold">Add a Deal</h3>
            <p className="text-sm text-muted-foreground">
              Paste URL or enter manually
            </p>
          </div>
        </Link>
        <Link
          href="/inventory"
          className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border hover:border-gold/50 transition-all group"
        >
          <div className="p-2 rounded-lg bg-gold/10 text-gold group-hover:bg-gold/20 transition-colors">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold">Inventory</h3>
            <p className="text-sm text-muted-foreground">
              Manage your stock
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
