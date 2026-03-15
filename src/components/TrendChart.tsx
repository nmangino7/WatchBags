"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { GOLD_ACCENT } from "@/lib/constants";
import type { TrendDataPoint } from "@/types";

interface TrendChartProps {
  data: TrendDataPoint[];
  title: string;
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: TrendDataPoint }>;
}) {
  if (!active || !payload || payload.length === 0) return null;

  const point = payload[0].payload;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2.5 shadow-xl">
      <p className="text-xs text-muted-foreground">{point.date}</p>
      <p className="mt-0.5 text-sm font-bold text-foreground">
        {formatCurrency(point.value)}
      </p>
      {point.label && (
        <p className="mt-0.5 text-[10px] text-muted-foreground">{point.label}</p>
      )}
    </div>
  );
}

export function TrendChart({ data, title }: TrendChartProps) {
  if (data.length < 2) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-border bg-card">
        <p className="text-sm text-muted-foreground">Not enough data for trend</p>
      </div>
    );
  }

  const firstValue = data[0].value;
  const lastValue = data[data.length - 1].value;
  const change = lastValue - firstValue;
  const changePercent = firstValue > 0 ? (change / firstValue) * 100 : 0;
  const isPositive = change >= 0;

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          <p className="mt-0.5 text-lg font-bold text-foreground">
            {formatCurrency(lastValue)}
          </p>
        </div>
        <div
          className={cn(
            "flex items-center gap-1 rounded-lg px-2.5 py-1",
            isPositive
              ? "bg-emerald-500/10 text-emerald-400"
              : "bg-red-500/10 text-red-400"
          )}
        >
          {isPositive ? (
            <TrendingUp className="h-3.5 w-3.5" />
          ) : (
            <TrendingDown className="h-3.5 w-3.5" />
          )}
          <span className="text-xs font-semibold">
            {isPositive ? "+" : ""}
            {changePercent.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
          <defs>
            <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={GOLD_ACCENT} stopOpacity={0.3} />
              <stop offset="100%" stopColor={GOLD_ACCENT} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border)"
            opacity={0.5}
            vertical={false}
          />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value: string) => {
              const d = new Date(value);
              return `${d.getMonth() + 1}/${d.getDate()}`;
            }}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value: number) => `$${(value / 1000).toFixed(0)}k`}
            width={50}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="value"
            stroke={GOLD_ACCENT}
            strokeWidth={2}
            fill="url(#trendGradient)"
            dot={false}
            activeDot={{ fill: GOLD_ACCENT, r: 4, strokeWidth: 2, stroke: "#fff" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
