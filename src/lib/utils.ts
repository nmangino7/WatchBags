import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Condition, Confidence, ProfitCalculation } from '@/types';

// ============================================================================
// Class Name Utility
// ============================================================================

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// ============================================================================
// Formatting Utilities
// ============================================================================

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(d);
}

// ============================================================================
// Business Logic Utilities
// ============================================================================

export function calculateProfit(
  askingPrice: number,
  fairMarketValue: number,
  feeRate: number = 0.13
): ProfitCalculation {
  const gross = fairMarketValue - askingPrice;
  const fees = fairMarketValue * feeRate;
  const net = gross - fees;
  const roi = askingPrice > 0 ? (net / askingPrice) * 100 : 0;

  return {
    gross: Math.round(gross),
    fees: Math.round(fees),
    net: Math.round(net),
    roi: Math.round(roi * 10) / 10,
  };
}

// ============================================================================
// Display Utilities
// ============================================================================

export function getConditionLabel(condition: Condition): string {
  const labels: Record<Condition, string> = {
    mint: 'Mint / Unworn',
    excellent: 'Excellent',
    good: 'Good',
    fair: 'Fair',
  };
  return labels[condition];
}

export function getConfidenceColor(confidence: Confidence): string {
  const colors: Record<Confidence, string> = {
    high: 'text-emerald-500',
    medium: 'text-amber-500',
    low: 'text-red-500',
  };
  return colors[confidence];
}
