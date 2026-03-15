"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid,
} from "recharts";
import { formatCurrency, formatDate } from "@/lib/utils";
import { GOLD_ACCENT } from "@/lib/constants";
import type { PriceHistoryPoint } from "@/types";

interface PriceChartProps {
  priceHistory: PriceHistoryPoint[];
  fairMarketValue: number;
}

interface ChartDataPoint {
  date: string;
  price: number;
  source: string;
  formattedDate: string;
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: ChartDataPoint }>;
}) {
  if (!active || !payload || payload.length === 0) return null;

  const data = payload[0].payload;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2.5 shadow-xl">
      <p className="text-xs text-muted-foreground">{data.formattedDate}</p>
      <p className="mt-0.5 text-sm font-bold text-foreground">
        {formatCurrency(data.price)}
      </p>
      <p className="mt-0.5 text-[10px] text-muted-foreground">{data.source}</p>
    </div>
  );
}

export function PriceChart({ priceHistory, fairMarketValue }: PriceChartProps) {
  const chartData: ChartDataPoint[] = priceHistory
    .map((point) => ({
      date: new Date(point.recordedAt).toISOString().split("T")[0],
      price: point.price,
      source: point.source,
      formattedDate: formatDate(point.recordedAt),
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (chartData.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-border bg-card">
        <p className="text-sm text-muted-foreground">No price history available</p>
      </div>
    );
  }

  const prices = chartData.map((d) => d.price);
  const minPrice = Math.min(...prices, fairMarketValue) * 0.9;
  const maxPrice = Math.max(...prices, fairMarketValue) * 1.1;

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Price History</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 rounded-full" style={{ backgroundColor: GOLD_ACCENT }} />
            <span className="text-[10px] text-muted-foreground">Price</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 rounded-full bg-emerald-500" />
            <span className="text-[10px] text-muted-foreground">FMV</span>
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border)"
            opacity={0.5}
          />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
            tickLine={false}
            axisLine={{ stroke: "var(--border)" }}
            tickFormatter={(value: string) => {
              const d = new Date(value);
              return `${d.getMonth() + 1}/${d.getDate()}`;
            }}
          />
          <YAxis
            domain={[minPrice, maxPrice]}
            tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
            tickLine={false}
            axisLine={{ stroke: "var(--border)" }}
            tickFormatter={(value: number) => `$${(value / 1000).toFixed(1)}k`}
            width={55}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine
            y={fairMarketValue}
            stroke="#22c55e"
            strokeDasharray="6 4"
            strokeWidth={1.5}
            label={{
              value: `FMV ${formatCurrency(fairMarketValue)}`,
              position: "insideTopRight",
              fill: "#22c55e",
              fontSize: 10,
            }}
          />
          <Line
            type="monotone"
            dataKey="price"
            stroke={GOLD_ACCENT}
            strokeWidth={2}
            dot={{ fill: GOLD_ACCENT, r: 3, strokeWidth: 0 }}
            activeDot={{ fill: GOLD_ACCENT, r: 5, strokeWidth: 2, stroke: "#fff" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
