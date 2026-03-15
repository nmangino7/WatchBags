"use client";

import { useState } from "react";
import Link from "next/link";
import { StatsCard } from "@/components/StatsCard";
import { DealCard } from "@/components/DealCard";
import { getSeedData } from "@/lib/db/seed";
import { formatCurrency } from "@/lib/utils";
import {
  TrendingUp,
  Watch,
  ShoppingBag,
  DollarSign,
  ArrowRight,
  Loader2,
  RefreshCw,
  Plus,
  Search,
  AlertCircle,
} from "lucide-react";

export default function Dashboard() {
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);

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

  const [scanError, setScanError] = useState(false);

  const handleScan = async () => {
    setScanning(true);
    setScanResult(null);
    setScanError(false);
    try {
      const res = await fetch("/api/cron/refresh");
      const data = await res.json();
      if (res.ok) {
        const parts = [`Scraped ${data.scraped} listings from ${data.providers?.join(", ") || "providers"}`];
        if (data.saved > 0) parts.push(`${data.saved} new profitable deals found`);
        if (data.analyzed > 0) parts.push(`${data.analyzed} analyzed by AI`);
        if (data.errors > 0) parts.push(`${data.errors} errors`);
        parts.push("Refresh the page to see results.");
        setScanResult(parts.join(". "));
        if (data.errors > 0) setScanError(true);
      } else {
        setScanError(true);
        setScanResult(`Error ${res.status}: ${data.error || "Scan failed"}. Check your ANTHROPIC_API_KEY and CRON_SECRET in Vercel environment variables.`);
      }
    } catch (err) {
      setScanError(true);
      setScanResult(`Network error: ${err instanceof Error ? err.message : "Could not reach server"}. Make sure the app is deployed and running.`);
    } finally {
      setScanning(false);
    }
  };

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
            Scan eBay and Chrono24 to find real underpriced watches and handbags,
            or add deals manually.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleScan}
              disabled={scanning}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-gold px-6 py-3 text-sm font-semibold text-black hover:bg-gold-light transition-colors disabled:opacity-50"
            >
              {scanning ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Scanning
                  eBay &amp; Chrono24...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" /> Scan for Deals Now
                </>
              )}
            </button>
            <Link
              href="/add"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-6 py-3 text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              <Plus className="h-4 w-4" /> Add Deal Manually
            </Link>
          </div>
          {scanResult && (
            <div className={`mt-4 text-sm flex items-start gap-2 justify-center ${scanError ? "text-red-400" : "text-muted-foreground"}`}>
              {scanError && <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />}
              <p>{scanResult}</p>
            </div>
          )}
          {scanning && (
            <p className="mt-4 text-xs text-muted-foreground">
              This may take a few minutes — scraping 30+ models from eBay and
              Chrono24, then running Claude AI analysis on each...
            </p>
          )}
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
              <button
                onClick={handleScan}
                disabled={scanning}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
              >
                {scanning ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="h-3.5 w-3.5" />
                )}
                {scanning ? "Scanning..." : "Rescan"}
              </button>
              <Link
                href="/deals"
                className="flex items-center gap-1 text-gold hover:text-gold-light transition-colors font-medium"
              >
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          {scanResult && (
            <div className={`mb-3 text-sm flex items-start gap-2 ${scanError ? "text-red-400" : "text-muted-foreground"}`}>
              {scanError && <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />}
              <p>{scanResult}</p>
            </div>
          )}
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
