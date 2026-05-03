"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { DealCard } from "@/components/DealCard";
import { FilterBar } from "@/components/FilterBar";
import { ScanProgress } from "@/components/ScanProgress";
import { Plus, Search, Loader2 } from "lucide-react";
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

  const [allDeals, setAllDeals] = useState<DealWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/deals?limit=100")
      .then((res) => res.json())
      .then((data) => {
        setAllDeals(data.deals || []);
      })
      .catch(() => {
        setAllDeals([]);
      })
      .finally(() => setLoading(false));
  }, []);

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
      if (!isNaN(minP))
        deals = deals.filter((d) => d.valuation.netProfit >= minP);
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

    if (filters.sort === "lowest_price") {
      deals.sort((a, b) => a.listing.askingPrice - b.listing.askingPrice);
    } else if (filters.sort === "best_roi") {
      deals.sort(
        (a, b) => b.valuation.roiPercentage - a.valuation.roiPercentage
      );
    } else if (filters.sort === "newest") {
      deals.sort(
        (a, b) =>
          new Date(b.listing.foundAt).getTime() -
          new Date(a.listing.foundAt).getTime()
      );
    } else {
      deals.sort((a, b) => b.valuation.netProfit - a.valuation.netProfit);
    }

    return deals;
  }, [allDeals, filters]);

  const uniqueBrands = [...new Set(allDeals.map((d) => d.brand.name))].sort();

  const handleFilterChange = (newFilters: AppliedFilters) => {
    setFilters(newFilters);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Deal Finder</h1>
          <p className="text-muted-foreground mt-1">
            {loading
              ? "Loading deals..."
              : allDeals.length > 0
                ? `Showing ${filteredDeals.length} profitable deals — only items you can make money on`
                : "Scan marketplaces to find profitable deals"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ScanProgress variant="small" />
          <Link
            href="/add"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            <Plus className="h-4 w-4" /> Add Deal
          </Link>
        </div>
      </div>

      {allDeals.length > 0 && (
        <FilterBar
          onFilterChange={handleFilterChange}
          brands={uniqueBrands}
        />
      )}

      {loading ? (
        <div className="text-center py-16">
          <Loader2 className="mx-auto h-8 w-8 text-gold animate-spin mb-4" />
          <p className="text-muted-foreground">Loading deals...</p>
        </div>
      ) : allDeals.length === 0 ? (
        <div className="text-center py-16">
          <Search className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground text-lg mb-2">No deals yet</p>
          <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">
            Click &quot;Rescan&quot; above to scrape eBay, Chrono24, Bob&apos;s
            Watches, and Reddit for real listings, or add a deal manually.
          </p>
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
