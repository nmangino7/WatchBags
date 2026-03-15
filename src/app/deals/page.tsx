"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { DealCard } from "@/components/DealCard";
import { FilterBar } from "@/components/FilterBar";
import { getSeedData } from "@/lib/db/seed";
import { Loader2, RefreshCw, Plus, Search, AlertCircle } from "lucide-react";
import type { DealWithDetails, Category, Condition } from "@/types";

interface AppliedFilters {
  category: Category | "all";
  brand: string;
  minPrice: string;
  maxPrice: string;
  minProfit: string;
  condition: Condition | "all";
  search: string;
  sort: string;
}

export default function DealsPage() {
  const [filters, setFilters] = useState<AppliedFilters>({
    category: "all",
    brand: "all",
    minPrice: "",
    maxPrice: "",
    minProfit: "",
    condition: "all",
    search: "",
    sort: "highest_profit",
  });

  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);

  const { brands, models, listings, valuations } = getSeedData();

  const allDeals: DealWithDetails[] = useMemo(() => {
    return listings
      .filter((l) => l.stillActive)
      .map((listing) => {
        const model = models.find((m) => m.id === listing.modelId);
        const brand = model ? brands.find((b) => b.id === model.brandId) : null;
        const valuation = valuations.find((v) => v.listingId === listing.id);
        if (!model || !brand || !valuation || valuation.netProfit <= 0)
          return null;
        return { listing, model, brand, valuation };
      })
      .filter((d): d is DealWithDetails => d !== null);
  }, [brands, models, listings, valuations]);

  const filteredDeals = useMemo(() => {
    let deals = [...allDeals];

    if (filters.category !== "all") {
      deals = deals.filter((d) => d.brand.category === filters.category);
    }
    if (filters.brand !== "all") {
      deals = deals.filter(
        (d) => d.brand.name.toLowerCase() === filters.brand.toLowerCase()
      );
    }
    if (filters.minPrice) {
      const min = parseFloat(filters.minPrice);
      if (!isNaN(min)) deals = deals.filter((d) => d.listing.askingPrice >= min);
    }
    if (filters.maxPrice) {
      const max = parseFloat(filters.maxPrice);
      if (!isNaN(max)) deals = deals.filter((d) => d.listing.askingPrice <= max);
    }
    if (filters.minProfit) {
      const minP = parseFloat(filters.minProfit);
      if (!isNaN(minP)) deals = deals.filter((d) => d.valuation.netProfit >= minP);
    }
    if (filters.condition !== "all") {
      deals = deals.filter((d) => d.listing.condition === filters.condition);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      deals = deals.filter(
        (d) =>
          d.brand.name.toLowerCase().includes(q) ||
          d.model.name.toLowerCase().includes(q) ||
          (d.model.referenceNumber &&
            d.model.referenceNumber.toLowerCase().includes(q))
      );
    }

    // Sort
    if (filters.sort === "lowest_price") {
      deals.sort((a, b) => a.listing.askingPrice - b.listing.askingPrice);
    } else if (filters.sort === "best_roi") {
      deals.sort((a, b) => b.valuation.roiPercentage - a.valuation.roiPercentage);
    } else if (filters.sort === "newest") {
      deals.sort(
        (a, b) =>
          new Date(b.listing.foundAt).getTime() -
          new Date(a.listing.foundAt).getTime()
      );
    } else {
      // highest_profit default
      deals.sort((a, b) => b.valuation.netProfit - a.valuation.netProfit);
    }

    return deals;
  }, [allDeals, filters]);

  const uniqueBrands = [...new Set(allDeals.map((d) => d.brand.name))].sort();

  const handleFilterChange = (newFilters: AppliedFilters) => {
    setFilters(newFilters);
  };

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Deal Finder</h1>
          <p className="text-muted-foreground mt-1">
            {allDeals.length > 0
              ? `Showing ${filteredDeals.length} profitable deals — only items you can make money on`
              : "Scan marketplaces to find profitable deals"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleScan}
            disabled={scanning}
            className="inline-flex items-center gap-2 rounded-lg bg-gold px-4 py-2.5 text-sm font-medium text-black hover:bg-gold-light transition-colors disabled:opacity-50"
          >
            {scanning ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Scanning...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" /> Scan Now
              </>
            )}
          </button>
          <Link
            href="/add"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            <Plus className="h-4 w-4" /> Add Deal
          </Link>
        </div>
      </div>

      {scanResult && (
        <div className={`mb-4 rounded-lg border px-4 py-3 text-sm flex items-start gap-2 ${scanError ? "border-red-500/20 bg-red-500/5 text-red-400" : "border-gold/20 bg-gold/5 text-muted-foreground"}`}>
          {scanError && <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />}
          <p>{scanResult}</p>
        </div>
      )}

      {allDeals.length > 0 && (
        <FilterBar
          onFilterChange={handleFilterChange}
          brands={uniqueBrands}
        />
      )}

      {allDeals.length === 0 ? (
        <div className="text-center py-16">
          <Search className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground text-lg mb-2">
            No deals yet
          </p>
          <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">
            Click &quot;Scan Now&quot; to scrape eBay and Chrono24 for real listings,
            or add a deal manually using the + Add Deal button.
          </p>
          {scanning && (
            <p className="text-xs text-muted-foreground">
              Scraping 30+ models from eBay and Chrono24, then analyzing each
              with Claude AI. This may take a few minutes...
            </p>
          )}
        </div>
      ) : filteredDeals.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-lg">
            No deals match your filters. Try adjusting your criteria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {filteredDeals.map((deal) => (
            <DealCard key={deal.listing.id} deal={deal} />
          ))}
        </div>
      )}
    </div>
  );
}
