"use client";

import { useState, useMemo } from "react";
import { DealCard } from "@/components/DealCard";
import { FilterBar } from "@/components/FilterBar";
import { getSeedData } from "@/lib/db/seed";
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Deal Finder</h1>
        <p className="text-muted-foreground mt-1">
          Showing {filteredDeals.length} profitable deals &mdash; only items you
          can make money on
        </p>
      </div>

      <FilterBar
        onFilterChange={handleFilterChange}
        brands={uniqueBrands}
      />

      {filteredDeals.length === 0 ? (
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
