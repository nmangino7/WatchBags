import * as cheerio from 'cheerio';
import type { DataProvider, ListingData, PriceDataPoint } from './types';

// ============================================================================
// Mercari — marketplace with luxury watches and handbags (server-rendered HTML)
// ============================================================================

interface MercariItem {
  brand: string;
  model: string;
  category: 'watch' | 'handbag';
}

const WATCH_CATALOG: MercariItem[] = [
  { brand: 'Rolex', model: 'Submariner', category: 'watch' },
  { brand: 'Rolex', model: 'Daytona', category: 'watch' },
  { brand: 'Omega', model: 'Speedmaster', category: 'watch' },
  { brand: 'Omega', model: 'Seamaster', category: 'watch' },
  { brand: 'Tudor', model: 'Black Bay', category: 'watch' },
  { brand: 'Cartier', model: 'Santos', category: 'watch' },
  { brand: 'TAG Heuer', model: 'Carrera', category: 'watch' },
  { brand: 'Breitling', model: 'Navitimer', category: 'watch' },
];

const HANDBAG_CATALOG: MercariItem[] = [
  { brand: 'Hermes', model: 'Birkin', category: 'handbag' },
  { brand: 'Chanel', model: 'Classic Flap', category: 'handbag' },
  { brand: 'Chanel', model: 'Boy Bag', category: 'handbag' },
  { brand: 'Louis Vuitton', model: 'Neverfull', category: 'handbag' },
  { brand: 'Louis Vuitton', model: 'Speedy', category: 'handbag' },
  { brand: 'Dior', model: 'Lady Dior', category: 'handbag' },
  { brand: 'Gucci', model: 'Dionysus', category: 'handbag' },
  { brand: 'Saint Laurent', model: 'Loulou', category: 'handbag' },
  { brand: 'Fendi', model: 'Peekaboo', category: 'handbag' },
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
  return isNaN(num) || num < 100 ? null : num;
}

function inferCondition(title: string): 'mint' | 'excellent' | 'good' | 'fair' {
  const text = title.toLowerCase();
  if (text.includes('new') || text.includes('unworn') || text.includes('bnib') || text.includes('sealed')) {
    return 'mint';
  }
  if (text.includes('excellent') || text.includes('like new') || text.includes('pristine')) {
    return 'excellent';
  }
  if (text.includes('fair') || text.includes('worn') || text.includes('used heavily') || text.includes('needs repair')) {
    return 'fair';
  }
  return 'good';
}

// ============================================================================
// Mercari Scraper
// ============================================================================

export class MercariProvider implements DataProvider {
  public readonly name = 'Mercari';

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
        console.error(`Mercari scrape failed for ${item.brand} ${item.model}:`, error);
      }

      await delay(600 + Math.random() * 600);
    }

    return allListings;
  }

  private async scrapeSearch(item: MercariItem): Promise<ListingData[]> {
    const query = encodeURIComponent(`${item.brand} ${item.model}`);
    const minPrice = item.category === 'watch' ? '500' : '200';
    const url = `https://www.mercari.com/search/?keyword=${query}&minPrice=${minPrice}&status=on_sale`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      throw new Error(`Mercari returned HTTP ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const listings: ListingData[] = [];

    // Try multiple selectors for Mercari search results
    const cardSelectors = [
      '[data-testid="SearchResults"] div',
      '.SearchItemGrid',
      '[class*="item-cell"]',
      'a[href*="/item/"]',
    ];

    let matchSelector = cardSelectors[0];
    for (const sel of cardSelectors) {
      if ($(sel).length > 0) {
        matchSelector = sel;
        break;
      }
    }

    $(matchSelector).each((_i, el) => {
      try {
        const $item = $(el);

        const title = $item.find('[class*="title"], h3, h4, [data-testid*="title"]').first().text().trim()
          || $item.attr('title')
          || $item.find('a').attr('aria-label')
          || '';
        if (!title || title.length < 5) return;

        const priceText = $item.find('[class*="price"], [data-testid*="price"], .price').first().text().trim();
        const price = parsePrice(priceText);
        if (!price) return;

        let itemUrl = $item.find('a[href*="/item/"]').first().attr('href')
          || $item.closest('a[href*="/item/"]').attr('href')
          || $item.attr('href')
          || '';
        if (itemUrl && !itemUrl.startsWith('http')) {
          itemUrl = `https://www.mercari.com${itemUrl}`;
        }
        if (!itemUrl) return;

        // Verify brand match
        const titleLower = title.toLowerCase();
        if (!titleLower.includes(item.brand.toLowerCase().split(' ')[0])) return;

        // Skip junk items
        const skipWords = ['strap', 'dust bag', 'wallet', 'card holder', 'charm', 'keychain', 'scarf', 'belt'];
        if (skipWords.some((w) => titleLower.includes(w))) return;

        const condition = inferCondition(title);

        const seller = $item.find('[class*="seller"], [data-testid*="seller"], .seller').first().text().trim() || undefined;

        // Scrape image URL — try multiple selectors
        let imageUrl: string | undefined;
        const imgSelectors = [
          'img[src*="static-mercari"]',
          'img[data-src]',
          'picture source',
          '.item-photo img',
          'img',
        ];
        for (const imgSel of imgSelectors) {
          const $img = $item.find(imgSel).first();
          if ($img.length > 0) {
            imageUrl = $img.attr('src')
              || $img.attr('data-src')
              || $img.attr('srcset')?.split(',')[0]?.trim().split(' ')[0]
              || undefined;
            if (imageUrl) break;
          }
        }

        listings.push({
          source: 'Mercari',
          sourceUrl: itemUrl,
          brand: item.brand,
          model: item.model,
          askingPrice: price,
          condition,
          seller,
          imageUrl,
        });
      } catch {
        // Skip items that fail to parse
      }
    });

    return listings.slice(0, 8);
  }

  async fetchPriceHistory(_brand: string, _model: string): Promise<PriceDataPoint[]> {
    return [];
  }
}

export const mercariProvider = new MercariProvider();
