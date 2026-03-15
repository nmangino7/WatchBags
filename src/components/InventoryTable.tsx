"use client";

import { useState, useMemo } from "react";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Plus,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import type { InventoryItem, InventoryStatus } from "@/types";

interface InventoryTableProps {
  items: InventoryItem[];
  onAddItem?: () => void;
  onViewItem?: (id: string) => void;
  onEditItem?: (id: string) => void;
  onDeleteItem?: (id: string) => void;
}

type SortField =
  | "brand"
  | "purchasePrice"
  | "currentValue"
  | "status"
  | "profit";
type SortDirection = "asc" | "desc";

const STATUS_CONFIG: Record<
  InventoryStatus,
  { label: string; className: string }
> = {
  in_hand: {
    label: "In Hand",
    className: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  },
  listed: {
    label: "Listed",
    className: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
  sold: {
    label: "Sold",
    className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
};

export function InventoryTable({
  items,
  onAddItem,
  onViewItem,
  onEditItem,
  onDeleteItem,
}: InventoryTableProps) {
  const [sortField, setSortField] = useState<SortField>("brand");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const dir = sortDirection === "asc" ? 1 : -1;
      switch (sortField) {
        case "brand":
          return dir * a.condition.localeCompare(b.condition);
        case "purchasePrice":
          return dir * (a.purchasePrice - b.purchasePrice);
        case "currentValue": {
          const aVal = a.salePrice ?? a.purchasePrice;
          const bVal = b.salePrice ?? b.purchasePrice;
          return dir * (aVal - bVal);
        }
        case "status":
          return dir * a.status.localeCompare(b.status);
        case "profit": {
          const aProfit = (a.salePrice ?? a.purchasePrice) - a.purchasePrice;
          const bProfit = (b.salePrice ?? b.purchasePrice) - b.purchasePrice;
          return dir * (aProfit - bProfit);
        }
        default:
          return 0;
      }
    });
  }, [items, sortField, sortDirection]);

  function SortHeader({
    field,
    children,
    className,
  }: {
    field: SortField;
    children: React.ReactNode;
    className?: string;
  }) {
    const isActive = sortField === field;
    return (
      <th className={cn("px-4 py-3 text-left", className)}>
        <button
          onClick={() => handleSort(field)}
          className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
        >
          {children}
          {isActive ? (
            sortDirection === "asc" ? (
              <ArrowUp className="h-3 w-3 text-gold" />
            ) : (
              <ArrowDown className="h-3 w-3 text-gold" />
            )
          ) : (
            <ArrowUpDown className="h-3 w-3 opacity-40" />
          )}
        </button>
      </th>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">Inventory</h2>
          <p className="text-xs text-muted-foreground">
            {items.length} item{items.length !== 1 ? "s" : ""} tracked
          </p>
        </div>
        {onAddItem && (
          <button
            onClick={onAddItem}
            className="flex items-center gap-1.5 rounded-lg bg-gold px-3.5 py-2 text-sm font-semibold text-black transition-colors hover:bg-gold-light"
          >
            <Plus className="h-4 w-4" />
            Add Item
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-border">
              <SortHeader field="brand" className="min-w-[200px]">
                Item
              </SortHeader>
              <SortHeader field="purchasePrice">Purchase Price</SortHeader>
              <SortHeader field="currentValue">Current Value</SortHeader>
              <SortHeader field="status">Status</SortHeader>
              <SortHeader field="profit">Profit / Loss</SortHeader>
              <th className="px-4 py-3 text-right">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Actions
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedItems.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center">
                  <p className="text-sm text-muted-foreground">
                    No inventory items yet
                  </p>
                  {onAddItem && (
                    <button
                      onClick={onAddItem}
                      className="mt-2 text-sm font-medium text-gold hover:text-gold-light"
                    >
                      Add your first item
                    </button>
                  )}
                </td>
              </tr>
            ) : (
              sortedItems.map((item) => {
                const currentValue = item.salePrice ?? item.purchasePrice;
                const profitLoss = currentValue - item.purchasePrice;
                const profitPct =
                  item.purchasePrice > 0
                    ? (profitLoss / item.purchasePrice) * 100
                    : 0;
                const isProfit = profitLoss >= 0;
                const statusConfig = STATUS_CONFIG[item.status];

                return (
                  <tr
                    key={item.id}
                    className="border-b border-border/50 transition-colors hover:bg-muted/30"
                  >
                    {/* Item */}
                    <td className="px-4 py-3.5">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-gold">
                          {item.modelId}
                        </p>
                        <p className="text-sm font-medium text-foreground">
                          {item.condition}
                        </p>
                        {item.notes && (
                          <p className="mt-0.5 text-xs text-muted-foreground truncate max-w-[200px]">
                            {item.notes}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Purchase Price */}
                    <td className="px-4 py-3.5">
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {formatCurrency(item.purchasePrice)}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {formatDate(item.purchaseDate)}
                        </p>
                      </div>
                    </td>

                    {/* Current Value */}
                    <td className="px-4 py-3.5">
                      <p className="text-sm font-semibold text-foreground">
                        {formatCurrency(currentValue)}
                      </p>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5">
                      <span
                        className={cn(
                          "inline-block rounded-md border px-2 py-0.5 text-xs font-medium",
                          statusConfig.className
                        )}
                      >
                        {statusConfig.label}
                      </span>
                    </td>

                    {/* Profit / Loss */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        {isProfit ? (
                          <ArrowUp className="h-3.5 w-3.5 text-profit-green" />
                        ) : (
                          <ArrowDown className="h-3.5 w-3.5 text-loss-red" />
                        )}
                        <span
                          className={cn(
                            "text-sm font-semibold",
                            isProfit ? "text-profit-green" : "text-loss-red"
                          )}
                        >
                          {isProfit ? "+" : ""}
                          {formatCurrency(profitLoss)}
                        </span>
                        <span
                          className={cn(
                            "rounded-md px-1.5 py-0.5 text-[10px] font-medium",
                            isProfit
                              ? "bg-emerald-500/10 text-emerald-400"
                              : "bg-red-500/10 text-red-400"
                          )}
                        >
                          {isProfit ? "+" : ""}
                          {profitPct.toFixed(1)}%
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 text-right">
                      <div className="relative inline-block">
                        <button
                          onClick={() =>
                            setOpenMenuId(
                              openMenuId === item.id ? null : item.id
                            )
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                        {openMenuId === item.id && (
                          <div className="absolute right-0 top-full z-20 mt-1 w-36 overflow-hidden rounded-lg border border-border bg-card shadow-xl">
                            {onViewItem && (
                              <button
                                onClick={() => {
                                  onViewItem(item.id);
                                  setOpenMenuId(null);
                                }}
                                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
                              >
                                <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                                View
                              </button>
                            )}
                            {onEditItem && (
                              <button
                                onClick={() => {
                                  onEditItem(item.id);
                                  setOpenMenuId(null);
                                }}
                                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
                              >
                                <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                                Edit
                              </button>
                            )}
                            {onDeleteItem && (
                              <button
                                onClick={() => {
                                  onDeleteItem(item.id);
                                  setOpenMenuId(null);
                                }}
                                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-loss-red transition-colors hover:bg-red-500/10"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                Delete
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
