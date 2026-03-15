import { AlertTriangle, BarChart3, Scale, Brain, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency, getConditionLabel } from "@/lib/utils";
import type { Valuation, Model, Listing, PriceHistoryPoint } from "@/types";

interface ValuationProofProps {
  valuation: Valuation;
  model: Model;
  listing: Listing;
  comparablePrices?: Array<{
    source: string;
    price: number;
    condition: string;
    date?: string;
  }>;
  priceHistory?: PriceHistoryPoint[];
}

function SectionHeader({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gold/10 text-gold">
        <Icon className="h-4 w-4" />
      </div>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
    </div>
  );
}

export function ValuationProof({
  valuation,
  model,
  listing,
  comparablePrices = [],
  priceHistory = [],
}: ValuationProofProps) {
  const askingPrice = listing.askingPrice;
  const fmv = valuation.fairMarketValue;
  const maxBarValue = Math.max(askingPrice, fmv, model.msrp) * 1.1;

  const askingPct = (askingPrice / maxBarValue) * 100;
  const fmvPct = (fmv / maxBarValue) * 100;

  const marketPositionLabel =
    askingPrice < fmv * 0.9
      ? "Below Market"
      : askingPrice > fmv * 1.1
        ? "Above Market"
        : "At Market";

  const marketPositionColor =
    askingPrice < fmv * 0.9
      ? "text-profit-green"
      : askingPrice > fmv * 1.1
        ? "text-loss-red"
        : "text-amber-400";

  return (
    <div className="space-y-6">
      {/* Price Comparison */}
      <div className="rounded-xl border border-border bg-card p-5">
        <SectionHeader icon={BarChart3} title="Price Comparison" />
        <div className="space-y-4">
          {/* Asking Price Bar */}
          <div>
            <div className="mb-1.5 flex items-baseline justify-between">
              <span className="text-xs text-muted-foreground">Asking Price</span>
              <span className="text-sm font-bold text-foreground">
                {formatCurrency(askingPrice)}
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-blue-500 transition-all duration-700"
                style={{ width: `${askingPct}%` }}
              />
            </div>
          </div>
          {/* Fair Market Value Bar */}
          <div>
            <div className="mb-1.5 flex items-baseline justify-between">
              <span className="text-xs text-muted-foreground">Fair Market Value</span>
              <span className="text-sm font-bold text-profit-green">
                {formatCurrency(fmv)}
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-700"
                style={{ width: `${fmvPct}%` }}
              />
            </div>
          </div>
          {/* Difference */}
          <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/10 px-3 py-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Potential Savings</span>
              <span className="text-sm font-bold text-profit-green">
                {formatCurrency(fmv - askingPrice)} ({((fmv - askingPrice) / fmv * 100).toFixed(1)}%)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Comparable Prices */}
      {comparablePrices.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-5">
          <SectionHeader icon={Scale} title="Comparable Prices" />
          <div className="space-y-2">
            {comparablePrices.map((comp, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2.5"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-foreground">
                    {comp.source}
                  </span>
                  <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                    {comp.condition}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">
                    {formatCurrency(comp.price)}
                  </span>
                  {comp.price > askingPrice ? (
                    <span className="text-[10px] font-medium text-profit-green">
                      +{formatCurrency(comp.price - askingPrice)}
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium text-loss-red">
                      {formatCurrency(comp.price - askingPrice)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Market Data */}
      <div className="rounded-xl border border-border bg-card p-5">
        <SectionHeader icon={TrendingUp} title="Market Data" />
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">MSRP</p>
            <p className="mt-1 text-sm font-bold text-foreground">{formatCurrency(model.msrp)}</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Market Position
            </p>
            <p className={cn("mt-1 text-sm font-bold", marketPositionColor)}>
              {marketPositionLabel}
            </p>
          </div>
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Resale Low
            </p>
            <p className="mt-1 text-sm font-bold text-foreground">
              {formatCurrency(model.typicalResaleLow)}
            </p>
          </div>
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Resale High
            </p>
            <p className="mt-1 text-sm font-bold text-foreground">
              {formatCurrency(model.typicalResaleHigh)}
            </p>
          </div>
        </div>
      </div>

      {/* AI Reasoning */}
      {valuation.reasoning && (
        <div className="rounded-xl border border-border bg-card p-5">
          <SectionHeader icon={Brain} title="AI Reasoning" />
          <p className="text-sm leading-relaxed text-muted-foreground">
            {valuation.reasoning}
          </p>
        </div>
      )}

      {/* Red Flags */}
      {valuation.redFlags.length > 0 && (
        <div className="rounded-xl border border-loss-red/20 bg-loss-red/5 p-5">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-loss-red/10 text-loss-red">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-semibold text-loss-red">Red Flags</h3>
          </div>
          <ul className="space-y-2">
            {valuation.redFlags.map((flag, i) => (
              <li
                key={i}
                className="flex items-start gap-2 rounded-lg bg-loss-red/5 border border-loss-red/10 px-3 py-2"
              >
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-loss-red" />
                <span className="text-sm text-foreground">{flag}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
