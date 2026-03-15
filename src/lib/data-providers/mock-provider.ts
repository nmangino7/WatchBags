import type { DataProvider, ListingData, PriceDataPoint } from './types';

// ============================================================================
// Seed catalog used for generating realistic mock data
// ============================================================================

interface MockItem {
  brand: string;
  model: string;
  referenceNumber?: string;
  category: 'watch' | 'handbag';
  basePriceLow: number;
  basePriceHigh: number;
}

const WATCH_CATALOG: MockItem[] = [
  { brand: 'Rolex', model: 'Submariner Date', referenceNumber: '126610LN', category: 'watch', basePriceLow: 12000, basePriceHigh: 15500 },
  { brand: 'Rolex', model: 'Daytona', referenceNumber: '116500LN', category: 'watch', basePriceLow: 25000, basePriceHigh: 32000 },
  { brand: 'Rolex', model: 'GMT-Master II Pepsi', referenceNumber: '126710BLRO', category: 'watch', basePriceLow: 17000, basePriceHigh: 21000 },
  { brand: 'Rolex', model: 'Datejust 41', referenceNumber: '126334', category: 'watch', basePriceLow: 9500, basePriceHigh: 12500 },
  { brand: 'Omega', model: 'Speedmaster Moonwatch', referenceNumber: '310.30.42.50.01.001', category: 'watch', basePriceLow: 4800, basePriceHigh: 6200 },
  { brand: 'Omega', model: 'Seamaster 300M', referenceNumber: '210.30.42.20.01.001', category: 'watch', basePriceLow: 3800, basePriceHigh: 5200 },
  { brand: 'Patek Philippe', model: 'Nautilus', referenceNumber: '5711/1A-010', category: 'watch', basePriceLow: 110000, basePriceHigh: 145000 },
  { brand: 'Patek Philippe', model: 'Aquanaut', referenceNumber: '5167A-001', category: 'watch', basePriceLow: 42000, basePriceHigh: 55000 },
  { brand: 'Audemars Piguet', model: 'Royal Oak', referenceNumber: '15500ST.OO.1220ST.01', category: 'watch', basePriceLow: 38000, basePriceHigh: 52000 },
  { brand: 'Tudor', model: 'Black Bay 58', referenceNumber: '79030N', category: 'watch', basePriceLow: 3200, basePriceHigh: 4200 },
];

const HANDBAG_CATALOG: MockItem[] = [
  { brand: 'Hermes', model: 'Birkin 25', category: 'handbag', basePriceLow: 12000, basePriceHigh: 20000 },
  { brand: 'Hermes', model: 'Birkin 30', category: 'handbag', basePriceLow: 11000, basePriceHigh: 18000 },
  { brand: 'Hermes', model: 'Kelly 28', category: 'handbag', basePriceLow: 11000, basePriceHigh: 17000 },
  { brand: 'Chanel', model: 'Classic Flap Medium', category: 'handbag', basePriceLow: 7500, basePriceHigh: 10500 },
  { brand: 'Chanel', model: 'Classic Flap Jumbo', category: 'handbag', basePriceLow: 6800, basePriceHigh: 9800 },
  { brand: 'Louis Vuitton', model: 'Neverfull MM Monogram', category: 'handbag', basePriceLow: 1200, basePriceHigh: 1700 },
  { brand: 'Louis Vuitton', model: 'Speedy Bandouliere 25', category: 'handbag', basePriceLow: 1100, basePriceHigh: 1600 },
];

const SOURCES_WATCH = ['eBay', 'Chrono24', 'StockX', 'WatchBox', 'Bob\'s Watches'];
const SOURCES_HANDBAG = ['eBay', 'Vestiaire Collective', 'The RealReal', 'Rebag', 'Fashionphile'];
const CONDITIONS: Array<'mint' | 'excellent' | 'good' | 'fair'> = ['mint', 'excellent', 'good', 'fair'];
const CONDITION_WEIGHTS = [0.15, 0.40, 0.35, 0.10];

// ============================================================================
// Helpers
// ============================================================================

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

function pickCondition(rand: () => number): 'mint' | 'excellent' | 'good' | 'fair' {
  const r = rand();
  let cumulative = 0;
  for (let i = 0; i < CONDITION_WEIGHTS.length; i++) {
    cumulative += CONDITION_WEIGHTS[i];
    if (r <= cumulative) return CONDITIONS[i];
  }
  return 'good';
}

function conditionMultiplier(condition: 'mint' | 'excellent' | 'good' | 'fair'): number {
  const map = { mint: 1.05, excellent: 1.0, good: 0.88, fair: 0.75 };
  return map[condition];
}

function generateSlug(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

// ============================================================================
// Mock Provider Implementation
// ============================================================================

export class MockDataProvider implements DataProvider {
  public readonly name = 'MockDataProvider';

  private rand: () => number;

  constructor(seed: number = 42) {
    this.rand = seededRandom(seed);
  }

  async fetchListings(
    category: 'watch' | 'handbag',
    brands?: string[]
  ): Promise<ListingData[]> {
    const catalog = category === 'watch' ? WATCH_CATALOG : HANDBAG_CATALOG;
    const sources = category === 'watch' ? SOURCES_WATCH : SOURCES_HANDBAG;

    let items = catalog;
    if (brands && brands.length > 0) {
      const lowerBrands = brands.map((b) => b.toLowerCase());
      items = catalog.filter((item) =>
        lowerBrands.includes(item.brand.toLowerCase())
      );
    }

    const listings: ListingData[] = [];

    for (const item of items) {
      const listingCount = 2 + Math.floor(this.rand() * 3); // 2-4 listings per item

      for (let i = 0; i < listingCount; i++) {
        const condition = pickCondition(this.rand);
        const condMult = conditionMultiplier(condition);
        const range = item.basePriceHigh - item.basePriceLow;
        const basePrice = item.basePriceLow + this.rand() * range;

        // Some items are underpriced (deals), some are at or above market
        const pricingBias = this.rand();
        let priceMultiplier: number;
        if (pricingBias < 0.25) {
          // 25% chance: deal (10-25% below fair value)
          priceMultiplier = 0.75 + this.rand() * 0.15;
        } else if (pricingBias < 0.70) {
          // 45% chance: fair price (within 5% of fair value)
          priceMultiplier = 0.95 + this.rand() * 0.10;
        } else {
          // 30% chance: overpriced (5-20% above fair value)
          priceMultiplier = 1.05 + this.rand() * 0.15;
        }

        const askingPrice = Math.round((basePrice * condMult * priceMultiplier) / 100) * 100;
        const source = sources[Math.floor(this.rand() * sources.length)];
        const slug = generateSlug(`${item.brand}-${item.model}`);

        const sellers = [
          'LuxWatch_Dealer', 'TimeZone_Pro', 'WristCheck', 'PrestigeResale',
          'VintageVault', 'AuthenticLux', 'DesignerDeals', 'PremiumPieces',
        ];
        const seller = this.rand() > 0.3
          ? sellers[Math.floor(this.rand() * sellers.length)]
          : undefined;

        listings.push({
          source,
          sourceUrl: `https://${generateSlug(source)}.com/listing/${slug}-${Math.floor(this.rand() * 100000)}`,
          brand: item.brand,
          model: item.model,
          referenceNumber: item.referenceNumber,
          askingPrice,
          condition,
          seller,
          imageUrl: `/images/${slug}.jpg`,
        });
      }
    }

    return listings;
  }

  async fetchPriceHistory(brand: string, model: string): Promise<PriceDataPoint[]> {
    const allItems = [...WATCH_CATALOG, ...HANDBAG_CATALOG];
    const item = allItems.find(
      (i) =>
        i.brand.toLowerCase() === brand.toLowerCase() &&
        i.model.toLowerCase() === model.toLowerCase()
    );

    if (!item) {
      return [];
    }

    const points: PriceDataPoint[] = [];
    const sources = item.category === 'watch' ? SOURCES_WATCH : SOURCES_HANDBAG;
    const now = new Date('2026-03-15');

    // Generate 30 data points over the last 90 days
    for (let i = 0; i < 30; i++) {
      const daysAgo = Math.floor(this.rand() * 90);
      const date = new Date(now);
      date.setDate(date.getDate() - daysAgo);

      const range = item.basePriceHigh - item.basePriceLow;
      const midPrice = item.basePriceLow + range * 0.5;

      // Add a slight downward trend for older entries to simulate real market
      const trendFactor = 1 - (daysAgo / 90) * 0.05;
      const volatility = (this.rand() - 0.5) * range * 0.3;
      const price = Math.round((midPrice * trendFactor + volatility) / 100) * 100;

      const source = sources[Math.floor(this.rand() * sources.length)];
      const type: 'listing' | 'sold' = this.rand() > 0.4 ? 'sold' : 'listing';

      points.push({ source, price, date, type });
    }

    return points.sort((a, b) => b.date.getTime() - a.date.getTime());
  }
}

export const mockProvider = new MockDataProvider();
