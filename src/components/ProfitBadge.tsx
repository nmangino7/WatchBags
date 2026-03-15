import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency, formatPercentage } from "@/lib/utils";

interface ProfitBadgeProps {
  profit: number;
  roi: number;
  size?: "sm" | "md" | "lg";
}

export function ProfitBadge({ profit, roi, size = "md" }: ProfitBadgeProps) {
  const isHighProfit = profit > 5000;

  const sizeClasses = {
    sm: {
      container: "gap-1.5 px-2 py-1",
      text: "text-xs",
      icon: "h-3 w-3",
      roiBadge: "px-1.5 py-0.5 text-[10px]",
    },
    md: {
      container: "gap-2 px-3 py-1.5",
      text: "text-sm",
      icon: "h-3.5 w-3.5",
      roiBadge: "px-2 py-0.5 text-xs",
    },
    lg: {
      container: "gap-2.5 px-4 py-2",
      text: "text-base",
      icon: "h-4 w-4",
      roiBadge: "px-2.5 py-1 text-sm",
    },
  };

  const s = sizeClasses[size];

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-lg bg-emerald-500/10 border border-emerald-500/20",
        s.container,
        isHighProfit && "animate-profit-pulse"
      )}
    >
      <ArrowUp className={cn("text-profit-green", s.icon)} />
      <span className={cn("font-semibold text-profit-green", s.text)}>
        {formatCurrency(profit)}
      </span>
      <span
        className={cn(
          "rounded-md bg-emerald-500/15 font-medium text-emerald-400",
          s.roiBadge
        )}
      >
        {formatPercentage(roi)} ROI
      </span>
    </div>
  );
}
