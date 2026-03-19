// ============================================================================
// WatchBags - TypeScript Type Definitions
// ============================================================================

export type Category = 'watch' | 'handbag';

export type Condition = 'mint' | 'excellent' | 'good' | 'fair';

export type Confidence = 'high' | 'medium' | 'low';

export type InventoryStatus = 'in_hand' | 'listed' | 'sold';

// ============================================================================
// Core Domain Types
// ============================================================================

export interface Brand {
  id: string;
  name: string;
  category: Category;
  logoUrl?: string;
  description?: string;
}

export interface Model {
  id: string;
  brandId: string;
  name: string;
  referenceNumber?: string;
  msrp: number;
  typicalResaleLow: number;
  typicalResaleHigh: number;
  imageUrl?: string;
}

export interface Listing {
  id: string;
  modelId: string;
  source: string;
  sourceUrl: string;
  askingPrice: number;
  condition: Condition;
  seller?: string;
  imageUrl?: string;
  foundAt: Date;
  stillActive: boolean;
}

export interface PriceHistoryPoint {
  id: string;
  modelId: string;
  source: string;
  price: number;
  recordedAt: Date;
}

export interface Valuation {
  id: string;
  listingId: string;
  fairMarketValue: number;
  confidence: Confidence;
  reasoning: string;
  redFlags: string[];
  marketOutlook: string;
  estimatedProfit: number;
  estimatedFees: number;
  netProfit: number;
  roiPercentage: number;
  createdAt: Date;
}

export interface AiAnalysis {
  fairMarketValue: number;
  confidence: Confidence;
  reasoning: string;
  redFlags: string[];
  marketOutlook: string;
  profitEstimate: {
    gross: number;
    fees: number;
    net: number;
    roi: string;
  };
}

export interface WatchlistItem {
  id: string;
  listingId: string;
  targetPrice?: number;
  alertEnabled: boolean;
  addedAt: Date;
}

export interface InventoryItem {
  id: string;
  modelId: string;
  purchasePrice: number;
  purchaseDate: Date;
  condition: Condition;
  status: InventoryStatus;
  salePrice?: number;
  saleDate?: Date;
  platform?: string;
  notes?: string;
}

// ============================================================================
// Composite / Frontend Types
// ============================================================================

export interface DealWithDetails {
  listing: Listing;
  model: Model;
  brand: Brand;
  valuation: Valuation;
}

export interface FilterOptions {
  category?: Category;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  minProfit?: number;
  condition?: Condition;
  search?: string;
  sort?: 'profit' | 'price' | 'roi' | 'newest';
}

// ============================================================================
// Utility Types
// ============================================================================

export interface ProfitCalculation {
  gross: number;
  fees: number;
  net: number;
  roi: number;
}

export interface ConditionGrade {
  value: Condition;
  label: string;
  description: string;
  priceImpact: number;
}

export interface DataSource {
  id: string;
  name: string;
  url: string;
  type: string;
}

export interface ConfidenceLevel {
  value: Confidence;
  label: string;
  color: string;
}

export interface PlatformFeeRates {
  ebay: number;
  stockx: number;
  vestiaire: number;
  chrono24: number;
  private: number;
}

export interface TrendDataPoint {
  date: string;
  value: number;
  label?: string;
}
