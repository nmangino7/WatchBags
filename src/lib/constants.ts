import type {
  PlatformFeeRates,
  ConditionGrade,
  ConfidenceLevel,
  DataSource,
} from '@/types';

// ============================================================================
// Platform Fee Rates
// ============================================================================

export const PLATFORM_FEE_RATES: PlatformFeeRates = {
  ebay: 0.13,
  stockx: 0.10,
  vestiaire: 0.12,
  chrono24: 0.065,
  private: 0,
};

// ============================================================================
// Condition Grades
// ============================================================================

export const CONDITION_GRADES: ConditionGrade[] = [
  {
    value: 'mint',
    label: 'Mint / Unworn',
    description: 'Brand new or unworn with all original packaging, tags, and documentation.',
    priceImpact: 1.0,
  },
  {
    value: 'excellent',
    label: 'Excellent',
    description: 'Minimal signs of wear. May have very light surface marks only visible under magnification.',
    priceImpact: 0.92,
  },
  {
    value: 'good',
    label: 'Good',
    description: 'Normal signs of wear consistent with regular use. Minor scratches or marks visible.',
    priceImpact: 0.82,
  },
  {
    value: 'fair',
    label: 'Fair',
    description: 'Noticeable wear, scratches, or marks. May need servicing or refurbishment.',
    priceImpact: 0.70,
  },
];

// ============================================================================
// Categories
// ============================================================================

export const CATEGORIES = [
  { value: 'watch' as const, label: 'Watches', icon: 'Watch' },
  { value: 'handbag' as const, label: 'Handbags', icon: 'ShoppingBag' },
];

// ============================================================================
// Confidence Levels
// ============================================================================

export const CONFIDENCE_LEVELS: ConfidenceLevel[] = [
  {
    value: 'high',
    label: 'High Confidence',
    color: 'text-emerald-500',
  },
  {
    value: 'medium',
    label: 'Medium Confidence',
    color: 'text-amber-500',
  },
  {
    value: 'low',
    label: 'Low Confidence',
    color: 'text-red-500',
  },
];

// ============================================================================
// Data Sources
// ============================================================================

export const DATA_SOURCES: DataSource[] = [
  {
    id: 'ebay',
    name: 'eBay',
    url: 'https://www.ebay.com',
    type: 'marketplace',
  },
  {
    id: 'chrono24',
    name: 'Chrono24',
    url: 'https://www.chrono24.com',
    type: 'marketplace',
  },
  {
    id: 'stockx',
    name: 'StockX',
    url: 'https://www.stockx.com',
    type: 'marketplace',
  },
  {
    id: 'vestiaire',
    name: 'Vestiaire Collective',
    url: 'https://www.vestiairecollective.com',
    type: 'marketplace',
  },
  {
    id: 'watchcharts',
    name: 'WatchCharts',
    url: 'https://www.watchcharts.com',
    type: 'analytics',
  },
];

// ============================================================================
// Navigation Links
// ============================================================================

export const NAV_LINKS = [
  { href: '/', label: 'Dashboard' },
  { href: '/deals', label: 'Deals' },
  { href: '/inventory', label: 'Inventory' },
  { href: '/trends', label: 'Trends' },
  { href: '/watchlist', label: 'Watchlist' },
  { href: '/sales', label: 'Sales' },
] as const;

// ============================================================================
// Sort Options
// ============================================================================

export const SORT_OPTIONS = [
  { value: 'highest_profit', label: 'Highest Profit' },
  { value: 'best_roi', label: 'Best ROI' },
  { value: 'lowest_price', label: 'Lowest Price' },
  { value: 'newest', label: 'Newest' },
] as const;

// ============================================================================
// Source Badge Styles
// ============================================================================

export const SOURCE_BADGE_STYLES: Record<string, string> = {
  eBay: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Chrono24: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  StockX: 'bg-green-500/10 text-green-400 border-green-500/20',
  Vestiaire: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'The RealReal': 'bg-pink-500/10 text-pink-400 border-pink-500/20',
};

// ============================================================================
// Confidence Badge Styles
// ============================================================================

export const CONFIDENCE_BADGE_STYLES: Record<string, { dotColor: string; bgColor: string; textColor: string }> = {
  high: { dotColor: 'bg-emerald-500', bgColor: 'bg-emerald-500/10', textColor: 'text-emerald-400' },
  medium: { dotColor: 'bg-amber-500', bgColor: 'bg-amber-500/10', textColor: 'text-amber-400' },
  low: { dotColor: 'bg-red-500', bgColor: 'bg-red-500/10', textColor: 'text-red-400' },
};

// ============================================================================
// Brand Color / Design Tokens
// ============================================================================

export const GOLD_ACCENT = '#C9A84C';
