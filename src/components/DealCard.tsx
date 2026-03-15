import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency, getConditionLabel } from "@/lib/utils";
import { ProfitBadge } from "@/components/ProfitBadge";
import { SOURCE_BADGE_STYLES, CONFIDENCE_BADGE_STYLES } from "@/lib/constants";
import type { DealWithDetails } from "@/types";

interface DealCardProps {
  deal: DealWithDetails;
}

export function DealCard({ deal }: DealCardProps) {
  const { listing, model, brand, valuation } = deal;

  const sourceBadgeClass =
    SOURCE_BADGE_STYLES[listing.source] ??
    "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";

  const confidenceStyle =
    CONFIDENCE_BADGE_STYLES[valuation.confidence] ?? CONFIDENCE_BADGE_STYLES.medium;

  return (
    <Link
      href={`/deals/${listing.id}`}
      className="group block rounded-xl border border-border bg-card transition-all duration-300 hover:border-gold/30 hover:shadow-lg hover:shadow-gold/5"
    >
      <div className="p-5">
        {/* Header: Brand + Source */}
        <div className="mb-3 flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-gold">
              {brand.name}
            </p>
            <h3 className="mt-0.5 truncate text-base font-semibold text-foreground group-hover:text-gold transition-colors">
              {model.name}
            </h3>
            {model.referenceNumber && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                Ref. {model.referenceNumber}
              </p>
            )}
          </div>
          <span
            className={cn(
              "ml-3 shrink-0 rounded-md border px-2 py-0.5 text-[11px] font-medium",
              sourceBadgeClass
            )}
          >
            {listing.source}
          </span>
        </div>

        {/* Condition Badge */}
        <div className="mb-4">
          <span className="inline-block rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {getConditionLabel(listing.condition)}
          </span>
        </div>

        {/* Price Section */}
        <div className="mb-4 space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-muted-foreground">Asking Price</span>
            <span className="text-lg font-bold text-foreground">
              {formatCurrency(listing.askingPrice)}
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-muted-foreground">Fair Market Value</span>
            <span className="text-sm font-medium text-muted-foreground">
              {formatCurrency(valuation.fairMarketValue)}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="mb-4 h-px bg-border" />

        {/* Profit Badge */}
        <div className="mb-4">
          <ProfitBadge
            profit={valuation.netProfit}
            roi={valuation.roiPercentage}
            size="sm"
          />
        </div>

        {/* Footer: Confidence + View */}
        <div className="flex items-center justify-between">
          <div className={cn("flex items-center gap-1.5", confidenceStyle.bgColor, "rounded-md px-2 py-1")}>
            <span className={cn("h-1.5 w-1.5 rounded-full", confidenceStyle.dotColor)} />
            <span className={cn("text-[11px] font-medium capitalize", confidenceStyle.textColor)}>
              {valuation.confidence}
            </span>
          </div>
          <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground group-hover:text-gold transition-colors">
            View Details
            <ExternalLink className="h-3 w-3" />
          </span>
        </div>
      </div>
    </Link>
  );
}
