"use client";

import { useState, useCallback } from "react";
import {
  Search,
  SlidersHorizontal,
  X,
  ChevronDown,
  Watch,
  ShoppingBag,
  LayoutGrid,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SORT_OPTIONS, CONDITION_GRADES } from "@/lib/constants";
import type { Condition, Category } from "@/types";

interface FilterBarProps {
  brands: string[];
  onFilterChange: (filters: FilterState) => void;
  initialFilters?: Partial<FilterState>;
}

interface FilterState {
  category: Category | "all";
  brand: string;
  minPrice: string;
  maxPrice: string;
  minProfit: string;
  condition: Condition | "all";
  search: string;
  sort: string;
}

const defaultFilters: FilterState = {
  category: "all",
  brand: "all",
  minPrice: "",
  maxPrice: "",
  minProfit: "",
  condition: "all",
  search: "",
  sort: "highest_profit",
};

const categoryOptions = [
  { value: "all" as const, label: "All", icon: LayoutGrid },
  { value: "watch" as const, label: "Watches", icon: Watch },
  { value: "handbag" as const, label: "Handbags", icon: ShoppingBag },
];

export function FilterBar({
  brands,
  onFilterChange,
  initialFilters,
}: FilterBarProps) {
  const [filters, setFilters] = useState<FilterState>({
    ...defaultFilters,
    ...initialFilters,
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  const updateFilter = useCallback(
    (key: keyof FilterState, value: string) => {
      const updated = { ...filters, [key]: value };
      setFilters(updated);
    },
    [filters]
  );

  const handleApply = () => {
    onFilterChange(filters);
    setMobileOpen(false);
  };

  const handleClear = () => {
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
    setMobileOpen(false);
  };

  const filterContent = (
    <>
      {/* Category Toggle */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
          Category
        </label>
        <div className="flex rounded-lg border border-border bg-muted/30 p-0.5">
          {categoryOptions.map((cat) => {
            const Icon = cat.icon;
            const isActive = filters.category === cat.value;
            return (
              <button
                key={cat.value}
                onClick={() => updateFilter("category", cat.value)}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all",
                  isActive
                    ? "bg-gold text-black shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Brand Dropdown */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
          Brand
        </label>
        <div className="relative">
          <select
            value={filters.brand}
            onChange={(e) => updateFilter("brand", e.target.value)}
            className="w-full appearance-none rounded-lg border border-border bg-card px-3 py-2 pr-8 text-sm text-foreground outline-none transition-colors focus:border-gold/50 focus:ring-1 focus:ring-gold/20"
          >
            <option value="all">All Brands</option>
            {brands.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        </div>
      </div>

      {/* Price Range */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
          Price Range
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice}
            onChange={(e) => updateFilter("minPrice", e.target.value)}
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-colors focus:border-gold/50 focus:ring-1 focus:ring-gold/20"
          />
          <span className="text-xs text-muted-foreground">to</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice}
            onChange={(e) => updateFilter("maxPrice", e.target.value)}
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-colors focus:border-gold/50 focus:ring-1 focus:ring-gold/20"
          />
        </div>
      </div>

      {/* Minimum Profit */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
          Min. Profit ($)
        </label>
        <input
          type="number"
          placeholder="e.g. 500"
          value={filters.minProfit}
          onChange={(e) => updateFilter("minProfit", e.target.value)}
          className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-colors focus:border-gold/50 focus:ring-1 focus:ring-gold/20"
        />
      </div>

      {/* Condition */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
          Condition
        </label>
        <div className="relative">
          <select
            value={filters.condition}
            onChange={(e) => updateFilter("condition", e.target.value)}
            className="w-full appearance-none rounded-lg border border-border bg-card px-3 py-2 pr-8 text-sm text-foreground outline-none transition-colors focus:border-gold/50 focus:ring-1 focus:ring-gold/20"
          >
            <option value="all">All Conditions</option>
            {CONDITION_GRADES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        </div>
      </div>

      {/* Search */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
          Search
        </label>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search models..."
            value={filters.search}
            onChange={(e) => updateFilter("search", e.target.value)}
            className="w-full rounded-lg border border-border bg-card py-2 pl-8 pr-3 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-colors focus:border-gold/50 focus:ring-1 focus:ring-gold/20"
          />
        </div>
      </div>

      {/* Sort */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
          Sort By
        </label>
        <div className="relative">
          <select
            value={filters.sort}
            onChange={(e) => updateFilter("sort", e.target.value)}
            className="w-full appearance-none rounded-lg border border-border bg-card px-3 py-2 pr-8 text-sm text-foreground outline-none transition-colors focus:border-gold/50 focus:ring-1 focus:ring-gold/20"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-end gap-2 pt-1">
        <button
          onClick={handleApply}
          className="flex-1 rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-gold-light"
        >
          Apply Filters
        </button>
        <button
          onClick={handleClear}
          className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          Clear
        </button>
      </div>
    </>
  );

  return (
    <div>
      {/* Desktop Filter Bar */}
      <div className="hidden rounded-xl border border-border bg-card p-4 lg:block">
        <div className="grid grid-cols-4 gap-4 xl:grid-cols-8">
          {filterContent}
        </div>
      </div>

      {/* Mobile Filter Trigger */}
      <div className="lg:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters & Sort
        </button>
      </div>

      {/* Mobile Filter Modal */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          {/* Panel */}
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-2xl border-t border-border bg-background p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Filters</h2>
              <button
                onClick={() => setMobileOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4">{filterContent}</div>
          </div>
        </div>
      )}
    </div>
  );
}
