import type { DataProvider, ListingData, PriceDataPoint } from './types';

// ============================================================================
// Reddit r/WatchExchange — free public JSON API, real market prices
// ============================================================================

interface RedditSearchItem {
  brand: string;
  model: string;
  referenceNumber?: string;
}

const WATCH_CATALOG: RedditSearchItem[] = [
  { brand: 'Rolex', model: 'Submariner', referenceNumber: '126610LN' },
  { brand: 'Rolex', model: 'Daytona', referenceNumber: '116500LN' },
  { brand: 'Rolex', model: 'GMT-Master', referenceNumber: '126710BLRO' },
  { brand: 'Rolex', model: 'Datejust' },
  { brand: 'Omega', model: 'Speedmaster' },
  { brand: 'Omega', model: 'Seamaster' },
  { brand: 'Tudor', model: 'Black Bay' },
  { brand: 'Cartier', model: 'Santos' },
  { brand: 'Patek Philippe', model: 'Nautilus' },
  { brand: 'Audemars Piguet', model: 'Royal Oak' },
  { brand: 'IWC', model: 'Portugieser' },
  { brand: 'Grand Seiko', model: 'Snowflake' },
  { brand: 'Breitling', model: 'Navitimer' },
  { brand: 'TAG Heuer', model: 'Carrera' },
];

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function extractPrice(text: string): number | null {
  // Match patterns like $8,500 or $12500 or $3.5k
  const kMatch = text.match(/\$\s*([\d,.]+)\s*k\b/i);
  if (kMatch) {
    const num = parseFloat(kMatch[1].replace(/,/g, '')) * 1000;
    return isNaN(num) || num < 500 ? null : num;
  }

  const match = text.match(/\$\s*([\d,]+(?:\.\d{2})?)/);
  if (match) {
    const num = parseFloat(match[1].replace(/,/g, ''));
    return isNaN(num) || num < 500 ? null : num;
  }

  return null;
}

function inferCondition(text: string): 'mint' | 'excellent' | 'good' | 'fair' {
  const lower = text.toLowerCase();
  if (lower.includes('bnib') || lower.includes('brand new') || lower.includes('unworn') || lower.includes('sealed')) return 'mint';
  if (lower.includes('lnib') || lower.includes('like new') || lower.includes('excellent') || lower.includes('mint')) return 'excellent';
  if (lower.includes('fair') || lower.includes('beat') || lower.includes('worn')) return 'fair';
  return 'good';
}

interface RedditPost {
  data: {
    title: string;
    selftext: string;
    url: string;
    permalink: string;
    author: string;
    link_flair_text?: string;
    created_utc: number;
  };
}

interface RedditResponse {
  data: {
    children: RedditPost[];
  };
}

export class RedditProvider implements DataProvider {
  public readonly name = 'r/WatchExchange';

  async fetchListings(
    category: 'watch' | 'handbag',
    brands?: string[]
  ): Promise<ListingData[]> {
    // Reddit r/WatchExchange is watches only
    if (category !== 'watch') return [];

    const items = brands && brands.length > 0
      ? WATCH_CATALOG.filter((item) => brands.some((b) => b.toLowerCase() === item.brand.toLowerCase()))
      : WATCH_CATALOG;

    const allListings: ListingData[] = [];

    for (const item of items) {
      try {
        const listings = await this.searchReddit(item);
        allListings.push(...listings);
      } catch (error) {
        console.error(`Reddit scrape failed for ${item.brand} ${item.model}:`, error);
      }

      // Reddit rate limit: 1 request per 2 seconds
      await delay(2000 + Math.random() * 1000);
    }

    return allListings;
  }

  private async searchReddit(item: RedditSearchItem): Promise<ListingData[]> {
    const query = encodeURIComponent(`[WTS] ${item.brand} ${item.model}`);
    const url = `https://www.reddit.com/r/Watchexchange/search.json?q=${query}&restrict_sr=1&sort=new&limit=15&t=month`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'WatchBags/1.0 (luxury resale tool)',
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      throw new Error(`Reddit returned HTTP ${response.status}`);
    }

    const data: RedditResponse = await response.json();
    const listings: ListingData[] = [];

    for (const post of data.data.children) {
      try {
        const { title, selftext, permalink, author, link_flair_text } = post.data;

        // Only include [WTS] posts (for sale)
        if (!title.toUpperCase().includes('[WTS]')) continue;

        // Skip sold items
        if (link_flair_text?.toLowerCase().includes('sold')) continue;
        if (title.toLowerCase().includes('[sold]')) continue;

        // Extract price from title or body
        const price = extractPrice(title) || extractPrice(selftext.slice(0, 500));
        if (!price) continue;

        // Verify brand match
        const titleLower = title.toLowerCase();
        if (!titleLower.includes(item.brand.toLowerCase().split(' ')[0])) continue;

        const condition = inferCondition(`${title} ${selftext.slice(0, 300)}`);

        // Extract reference number from title
        const refMatch = title.match(/\b(ref\.?\s*)?([\d]{4,6}[A-Z]*(?:[-/]\d+)?)\b/i);
        const referenceNumber = refMatch?.[2] || item.referenceNumber;

        const sourceUrl = `https://www.reddit.com${permalink}`;

        listings.push({
          source: 'r/WatchExchange',
          sourceUrl,
          brand: item.brand,
          model: item.model,
          referenceNumber,
          askingPrice: price,
          condition,
          seller: `u/${author}`,
        });
      } catch {
        // Skip posts that fail to parse
      }
    }

    return listings.slice(0, 8);
  }

  async fetchPriceHistory(brand: string, model: string): Promise<PriceDataPoint[]> {
    // Search for recently sold items on r/WatchExchange
    try {
      const query = encodeURIComponent(`[WTS] ${brand} ${model}`);
      const url = `https://www.reddit.com/r/Watchexchange/search.json?q=${query}&restrict_sr=1&sort=new&limit=20&t=year`;

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'WatchBags/1.0 (luxury resale tool)',
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(15000),
      });

      if (!response.ok) return [];

      const data: RedditResponse = await response.json();
      const points: PriceDataPoint[] = [];

      for (const post of data.data.children) {
        const { title, selftext, link_flair_text, created_utc } = post.data;

        // Only count sold items for price history
        const isSold = link_flair_text?.toLowerCase().includes('sold') || title.toLowerCase().includes('[sold]');
        if (!isSold) continue;

        const price = extractPrice(title) || extractPrice(selftext.slice(0, 500));
        if (!price) continue;

        if (!title.toLowerCase().includes(brand.toLowerCase().split(' ')[0])) continue;

        points.push({
          source: 'r/WatchExchange',
          price,
          date: new Date(created_utc * 1000),
          type: 'sold',
        });
      }

      return points;
    } catch (error) {
      console.error(`Reddit price history failed for ${brand} ${model}:`, error);
      return [];
    }
  }
}

export const redditProvider = new RedditProvider();
