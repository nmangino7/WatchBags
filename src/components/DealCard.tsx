"use client";

import Link from "next/link";
import Image from "next/image";
import { ExternalLink, ImageOff, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency, getConditionLabel } from "@/lib/utils";
import { ProfitBadge } from "@/components/ProfitBadge";
import { SOURCE_BADGE_STYLES, CONFIDENCE_BADGE_STYLES } from "@/lib/constants";
import type { DealWithDetails } from "@/types";
import { useState } from "react";

interface DealCardProps {
  deal: DealWithDetails;
}

export function DealCard({ deal }: DealCardProps) {
  const { listing, model, brand, valuation } = deal;
  const [imgError, setImgError] = useState(false);

  const sourceBadgeClass =
    SOURCE_BADGE_STYLES[listing.source] ??
    "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";

  const confidenceStyle =
    CONFIDENCE_BADGE_STYLES[valuation.confidence] ?? CONFIDENCE_BADGE_STYLES.medium;

  const imageUrl = listing.imageUrl || model.imageUrl;
  const showImage = imageUrl && !imgError;

  return (
    <div className="group rounded-xl border border-border bg-card overflow-hidden transition-all duration-300 hover:border-gold/30 hover:shadow-lg hover:shadow-gold/5">
      {/* Product Image */}
      <div className="relative aspect-square bg-muted/30 overflow-hidden">
        {showImage ? (
          <Image
            src={imageUrl}
            alt={`${brand.name} ${model.name}`}
            fill
            className="object-contain p-2 transition-transform duration-500 group-hover:scale-105"
            onError={() => setImgError(true)}
            unoptimized
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-muted-foreground/40">
              <ImageOff className="h-10 w-10 mx-auto mb-1" />
              <p className="text-xs">{brand.name}</p>
              <p className="text-[10px]">{model.name}</p>
            </div>
          </div>
        )}

        {/* Source badge overlay */}
        <div className="absolute top-2 left-2">
          <span
            className={cn(
              "rounded-md border px-2 py-0.5 text-[11px] font-medium backdrop-blur-sm",
              sourceBadgeClass
            )}
          >
            {listing.source}
          </span>
        </div>

        {/* Profit badge overlay */}
        <div className="absolute top-2 right-2">
          <div className={cn(
            "rounded-md px-2 py-0.5 text-[11px] font-bold backdrop-blur-sm",
            valuation.netProfit > 0
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              : "bg-red-500/20 text-red-400 border border-red-500/30"
          )}>
            {valuation.netProfit > 0 ? "+" : ""}{formatCurrency(valuation.netProfit)}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Brand + Model */}
        <p className="text-[11px] font-semibold uppercase tracking-wider text-gold">
          {brand.name}
        </p>
        <h3 className="mt-0.5 text-sm font-semibold text-foreground leading-tight">
          {model.name}
        </h3>
        {model.referenceNumber && (
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Ref. {model.referenceNumber}
          </p>
        )}

        {/* Price + FMV */}
        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-lg font-bold text-foreground">
            {formatCurrency(listing.askingPrice)}
          </span>
          <span className="text-xs text-muted-foreground">
            FMV {formatCurrency(valuation.fairMarketValue)}
          </span>
        </div>

        {/* Tags row */}
        <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
          <span className="inline-block rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            {getConditionLabel(listing.condition)}
          </span>
          <div className={cn("flex items-center gap-1 rounded-md px-1.5 py-0.5", confidenceStyle.bgColor)}>
            <span className={cn("h-1.5 w-1.5 rounded-full", confidenceStyle.dotColor)} />
            <span className={cn("text-[10px] font-medium capitalize", confidenceStyle.textColor)}>
              {valuation.confidence}
            </span>
          </div>
          {model.msrp === 0 && (
            <div className="flex items-center gap-0.5 rounded-md bg-amber-500/10 px-1.5 py-0.5">
              <AlertTriangle className="h-2.5 w-2.5 text-amber-400" />
              <span className="text-[10px] font-medium text-amber-400">Needs Review</span>
            </div>
          )}
          <span className="text-[10px] text-muted-foreground/60">
            {valuation.roiPercentage > 0 ? `+${valuation.roiPercentage.toFixed(0)}% ROI` : ""}
          </span>
        </div>

        {/* Action buttons */}
        <div className="mt-3 flex gap-2">
          <a
            href={listing.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-gold px-3 py-2 text-xs font-semibold text-black hover:bg-gold-light transition-colors"
          >
            <ExternalLink className="h-3 w-3" />
            View on {listing.source}
          </a>
          <Link
            href={`/deals/${listing.id}`}
            className="inline-flex items-center justify-center rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            Details
          </Link>
        </div>
      </div>
    </div>
  );
}
