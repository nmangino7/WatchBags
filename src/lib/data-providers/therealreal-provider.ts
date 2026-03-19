import * as cheerio from 'cheerio';
import type { DataProvider, ListingData, PriceDataPoint } from './types';

// ============================================================================
// The RealReal — luxury consignment marketplace (watches & handbags)
// ============================================================================

interface TheRealRealItem {
  brand: string;
  model: string;
  category: 'watch' | 'handbag';
}

const WATCH_CATALOG: TheRealRealItem[] = [
  { brand: 'Rolex', model: 'Submariner', category: 'watch' },
  { brand: 'Rolex', model: 'Daytona', category: 'watch' },
  { brand: 'Rolex', model: 'Datejust', category: 'watch' },
  { brand: 'Omega', model: 'Speedmaster', category: 'watch' },
  { brand: 'Cartier', model: 'Santos', category: 'watch' },
  { brand: 'Cartier', model: 'Tank', category: 'watch' },
  { brand: 'Patek Philippe', model: 'Nautilus', category: 'watch' },
  { brand: 'IWC', model: 'Portugieser', category: 'watch' },
];

const HANDBAG_CATALOG: TheRealRealItem[] = [
  { brand: 'Hermes', model: 'Birkin', category: 'handbag' },
  { brand: 'Hermes', model: 'Kelly', category: 'handbag' },
  { brand: 'Chanel', model: 'Classic Flap', category: 'handbag' },
  { brand: 'Chanel', model: 'Boy Bag', category: 'handbag' },
  { brand: 'Louis Vuitton', model: 'Neverfull', category: 'handbag' },
  { brand: 'Louis Vuitton', model: 'Speedy', category: 'handbag' },
  { brand: 'Dior', model: 'Lady Dior', category: 'handbag' },
  { brand: 'Bottega Veneta', model: 'Jodie', category: 'handbag' },
  { brand: 'Celine', model: 'Luggage', category: 'handbag' },
  { brand: 'Goyard', model: 'St Louis', category: 'handbag' },
];

// ============================================================================
// Helpers
// ============================================================================

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parsePrice(text: string): number | null {
  const cleaned = text.replace(/[^0-9.,]/g, '').replace(/,/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

function mapCondition(text: string): 'mint' | 'excellent' | 'good' | 'fair' {
  const lower = text.toLowerCase();
  if (lower.includes('pristine')) return 'mint';
  if (lower.includes('excellent')) return 'excellent';
  if (lower.includes('very good')) return 'good';
  if (lower.includes('good')) return 'fair';
  return 'good'; // default
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractImageUrl($item: any, $: cheerio.CheerioAPI): string | undefined {
  // Try multiple selectors for images on TheRealReal
  const imgSelectors = [
    'img.product-image',
    'img[data-src]',
    'img[src*="therealreal"]',
    'picture source',
    'img',
  ];

  for (const selector of imgSelectors) {
    const el = $item.find(selector).first();
    if (el.length === 0) continue;

    // Check various image source attributes
    const src =
      el.attr('data-src') ||
      el.attr('lazy-src') ||
      el.attr('srcset')?.split(',')[0]?.trim()?.split(' ')[0] ||
      el.attr('src');

    if (src && src.length > 10 && !src.includes('data:image') && !src.includes('placeholder')) {
      // Ensure absolute URL
      if (src.startsWith('//')) return `https:${src}`;
      if (src.startsWith('/')) return `https://www.therealreal.com${src}`;
      return src;
    }
  }

  return undefined;
}

// ============================================================================
// TheRealReal Scraper
// ============================================================================

export class TheRealRealProvider implements DataProvider {
  public readonly name = 'TheRealReal';

  async fetchListings(
    category: 'watch' | 'handbag',
    brands?: string[]
  ): Promise<ListingData[]> {
    const catalog = category === 'handbag' ? HANDBAG_CATALOG : WATCH_CATALOG;
    let items = catalog;
    if (brands && brands.length > 0) {
      items = items.filter((item) =>
        brands.some((b) => b.toLowerCase() === item.brand.toLowerCase())
      );
    }

    // Pick random subset of 5 items per scan
    const shuffled = [...items].sort(() => Math.random() - 0.5);
    const toScrape = shuffled.slice(0, 5);

    const allListings: ListingData[] = [];

    for (const item of toScrape) {
      try {
        const listings = await this.scrapeSearch(item);
        allListings.push(...listings);
      } catch (error) {
        console.error(`TheRealReal scrape failed for ${item.brand} ${item.model}:`, error);
      }

      await delay(800 + Math.random() * 700);
    }

    return allListings;
  }

  private async scrapeSearch(item: TheRealRealItem): Promise<ListingData[]> {
    const query = encodeURIComponent(`${item.brand} ${item.model}`);
    const taxon = item.category === 'watch' ? 'watches' : 'handbags';
    const url = `https://www.therealreal.com/shop?search=${query}&taxons%5B%5D=${taxon}`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      throw new Error(`TheRealReal returned HTTP ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const listings: ListingData[] = [];

    // TheRealReal product card selectors
    const cardSelectors = [
      '.product-card',
      '[data-product-id]',
      '.product-thumb',
      'a[href*="/products/"]',
    ];

    let matchSelector = cardSelectors[0];
    for (const sel of cardSelectors) {
      if ($(sel).length > 0) {
        matchSelector = sel;
        break;
      }
    }

    const minPrice = item.category === 'watch' ? 500 : 200;

    $(matchSelector).each((_i, el) => {
      try {
        const $item = $(el);

        const title = $item.find('[class*="title"], .product-title, h3, h4').first().text().trim()
          || $item.attr('title')
          || '';
        if (!title || title.length < 5) return;

        const priceText = $item.find('[class*="price"], .product-price, .price').first().text().trim();
        const price = parsePrice(priceText);
        if (!price || price < minPrice) return;

        let itemUrl = $item.find('a[href*="/products/"]').first().attr('href')
          || $item.find('a').first().attr('href')
          || $item.attr('href')
          || '';
        if (itemUrl && !itemUrl.startsWith('http')) {
          itemUrl = `https://www.therealreal.com${itemUrl}`;
        }
        if (!itemUrl) return;

        // Verify brand match
        const titleLower = title.toLowerCase();
        if (!titleLower.includes(item.brand.toLowerCase().split(' ')[0])) return;

        // Skip junk items (straps, accessories, etc.)
        const skipWords = ['strap', 'dust bag', 'wallet', 'card holder', 'charm', 'keychain', 'scarf', 'belt'];
        if (skipWords.some((w) => titleLower.includes(w))) return;

        // Map condition from TheRealReal's condition labels
        const conditionText = $item.find('[class*="condition"], .condition, .product-condition').first().text().trim();
        const condition = mapCondition(conditionText || title);

        const seller = $item.find('[class*="seller"], .consignor').first().text().trim() || undefined;

        // Extract image URL
        const imageUrl = extractImageUrl($item, $);

        listings.push({
          source: 'TheRealReal',
          sourceUrl: itemUrl,
          brand: item.brand,
          model: item.model,
          askingPrice: price,
          condition,
          seller,
          imageUrl,
        });
      } catch {
        // skip
      }
    });

    return listings.slice(0, 8);
  }

  async fetchPriceHistory(_brand: string, _model: string): Promise<PriceDataPoint[]> {
    return [];
  }
}

export const theRealRealProvider = new TheRealRealProvider();
