import { ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
  subtitle?: string;
}

export function StatsCard({ title, value, change, icon, subtitle }: StatsCardProps) {
  const isPositive = change >= 0;

  return (
    <div className="group rounded-xl border border-border bg-card p-5 transition-all duration-300 hover:border-gold/20 hover:shadow-lg hover:shadow-gold/5">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-muted-foreground">{title}</p>
          <p className="mt-1.5 text-2xl font-bold tracking-tight text-foreground">
            {value}
          </p>
          <div className="mt-2 flex items-center gap-1.5">
            <div
              className={cn(
                "flex items-center gap-0.5 rounded-md px-1.5 py-0.5",
                isPositive
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "bg-red-500/10 text-red-400"
              )}
            >
              {isPositive ? (
                <ArrowUp className="h-3 w-3" />
              ) : (
                <ArrowDown className="h-3 w-3" />
              )}
              <span className="text-[11px] font-semibold">
                {isPositive ? "+" : ""}
                {change.toFixed(1)}%
              </span>
            </div>
            {subtitle && (
              <span className="text-[11px] text-muted-foreground">{subtitle}</span>
            )}
          </div>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold/10 text-gold transition-colors group-hover:bg-gold/15">
          {icon}
        </div>
      </div>
    </div>
  );
}
