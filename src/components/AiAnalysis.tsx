import {
  Brain,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Sparkles,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency, formatPercentage } from "@/lib/utils";
import { CONFIDENCE_BADGE_STYLES } from "@/lib/constants";
import type { AiAnalysis as AiAnalysisType } from "@/types";

interface AiAnalysisProps {
  analysis?: AiAnalysisType;
  isLoading?: boolean;
}

function SkeletonLine({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted",
        className
      )}
    />
  );
}

function AnalysisSkeleton() {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="mb-4 flex items-center gap-2">
          <SkeletonLine className="h-7 w-7 rounded-md" />
          <SkeletonLine className="h-4 w-32" />
        </div>
        <SkeletonLine className="mb-2 h-3 w-full" />
        <SkeletonLine className="mb-2 h-3 w-4/5" />
        <SkeletonLine className="h-3 w-3/5" />
      </div>
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="mb-4 flex items-center gap-2">
          <SkeletonLine className="h-7 w-7 rounded-md" />
          <SkeletonLine className="h-4 w-28" />
        </div>
        <SkeletonLine className="mb-2 h-3 w-full" />
        <SkeletonLine className="h-3 w-2/3" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <SkeletonLine className="h-20 rounded-xl" />
        <SkeletonLine className="h-20 rounded-xl" />
        <SkeletonLine className="h-20 rounded-xl" />
      </div>
    </div>
  );
}

export function AiAnalysis({ analysis, isLoading = false }: AiAnalysisProps) {
  if (isLoading || !analysis) {
    return <AnalysisSkeleton />;
  }

  const confidenceStyle =
    CONFIDENCE_BADGE_STYLES[analysis.confidence] ?? CONFIDENCE_BADGE_STYLES.medium;

  return (
    <div className="space-y-5">
      {/* Confidence Badge */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gold/10 text-gold">
            <Shield className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">AI Confidence</h3>
        </div>
        <div
          className={cn(
            "inline-flex items-center gap-2 rounded-lg px-3 py-2",
            confidenceStyle.bgColor
          )}
        >
          <span className={cn("h-2 w-2 rounded-full", confidenceStyle.dotColor)} />
          <span className={cn("text-sm font-semibold capitalize", confidenceStyle.textColor)}>
            {analysis.confidence} Confidence
          </span>
        </div>
      </div>

      {/* Reasoning */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gold/10 text-gold">
            <Brain className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">Analysis</h3>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {analysis.reasoning}
        </p>
      </div>

      {/* Market Outlook */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gold/10 text-gold">
            <TrendingUp className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">Market Outlook</h3>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {analysis.marketOutlook}
        </p>
      </div>

      {/* Red Flags */}
      {analysis.redFlags.length > 0 && (
        <div className="rounded-xl border border-loss-red/20 bg-loss-red/5 p-5">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-loss-red/10 text-loss-red">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-semibold text-loss-red">Red Flags</h3>
          </div>
          <div className="space-y-2">
            {analysis.redFlags.map((flag, i) => (
              <div
                key={i}
                className="flex items-start gap-2.5 rounded-lg border border-loss-red/10 bg-loss-red/5 px-3 py-2.5"
              >
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-loss-red" />
                <span className="text-sm text-foreground">{flag}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Profit Breakdown */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gold/10 text-gold">
            <DollarSign className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">Profit Breakdown</h3>
        </div>
        <div className="space-y-2.5">
          <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2.5">
            <span className="text-sm text-muted-foreground">Gross Profit</span>
            <span className="text-sm font-semibold text-foreground">
              {formatCurrency(analysis.profitEstimate.gross)}
            </span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2.5">
            <span className="text-sm text-muted-foreground">Estimated Fees</span>
            <span className="text-sm font-semibold text-loss-red">
              -{formatCurrency(analysis.profitEstimate.fees)}
            </span>
          </div>
          <div className="h-px bg-border" />
          <div className="flex items-center justify-between rounded-lg bg-emerald-500/5 border border-emerald-500/10 px-3 py-2.5">
            <span className="text-sm font-medium text-foreground">Net Profit</span>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-profit-green">
                {formatCurrency(analysis.profitEstimate.net)}
              </span>
              <span className="rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-xs font-medium text-emerald-400">
                {analysis.profitEstimate.roi} ROI
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Powered by Claude AI Badge */}
      <div className="flex items-center justify-center gap-2 rounded-lg border border-border bg-card/50 px-4 py-2.5">
        <Sparkles className="h-3.5 w-3.5 text-gold" />
        <span className="text-xs font-medium text-muted-foreground">
          Powered by Claude AI
        </span>
      </div>
    </div>
  );
}
