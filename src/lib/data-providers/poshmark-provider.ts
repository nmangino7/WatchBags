import * as cheerio from 'cheerio';
import type { DataProvider, ListingData, PriceDataPoint } from './types';

// ============================================================================
// Poshmark — luxury handbag marketplace (server-rendered search pages)
// ============================================================================

interface PoshmarkItem {
  brand: string;
  model: string;
  category: 'watch' | 'handbag';
}

const HANDBAG_CATALOG: PoshmarkItem[] = [
  { brand: 'Hermes', model: 'Birkin', category: 'handbag' },
  { brand: 'Hermes', model: 'Kelly', category: 'handbag' },
  { brand: 'Chanel', model: 'Classic Flap', category: 'handbag' },
  { brand: 'Chanel', model: 'Boy Bag', category: 'handbag' },
  { brand: 'Louis Vuitton', model: 'Neverfull', category: 'handbag' },
  { brand: 'Louis Vuitton', model: 'Speedy', category: 'handbag' },
  { brand: 'Dior', model: 'Lady Dior', category: 'handbag' },
  { brand: 'Gucci', model: 'Dionysus', category: 'handbag' },
  { brand: 'Prada', model: 'Galleria', category: 'handbag' },
  { brand: 'Bottega Veneta', model: 'Jodie', category: 'handbag' },
  { brand: 'Saint Laurent', model: 'Loulou', category: 'handbag' },
  { brand: 'Celine', model: 'Luggage', category: 'handbag' },
  { brand: 'Fendi', model: 'Peekaboo', category: 'handbag' },
  { brand: 'Goyard', model: 'St Louis', category: 'handbag' },
];

// Also search for watches on Poshmark
const WATCH_CATALOG: PoshmarkItem[] = [
  { brand: 'Rolex', model: 'Submariner', category: 'watch' },
  { brand: 'Rolex', model: 'Datejust', category: 'watch' },
  { brand: 'Omega', model: 'Speedmaster', category: 'watch' },
  { brand: 'Cartier', model: 'Santos', category: 'watch' },
  { brand: 'TAG Heuer', model: 'Carrera', category: 'watch' },
];

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parsePrice(text: string): number | null {
  const cleaned = text.replace(/[^0-9.,]/g, '').replace(/,/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) || num < 100 ? null : num;
}

export class PoshmarkProvider implements DataProvider {
  public readonly name = 'Poshmark';

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

    // Pick random subset of 5 items
    const shuffled = [...items].sort(() => Math.random() - 0.5);
    const toScrape = shuffled.slice(0, 5);

    const allListings: ListingData[] = [];

    for (const item of toScrape) {
      try {
        const listings = await this.scrapeSearch(item);
        allListings.push(...listings);
      } catch (error) {
        console.error(`Poshmark scrape failed for ${item.brand} ${item.model}:`, error);
      }

      await delay(600 + Math.random() * 600);
    }

    return allListings;
  }

  private async scrapeSearch(item: PoshmarkItem): Promise<ListingData[]> {
    const query = encodeURIComponent(`${item.brand} ${item.model}`);
    const minPrice = item.category === 'handbag' ? '200' : '500';
    const url = `https://poshmark.com/search?query=${query}&type=listings&price%5B%5D=${minPrice}-&condition%5B%5D=nwt&condition%5B%5D=like_new&condition%5B%5D=good`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      throw new Error(`Poshmark returned HTTP ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const listings: ListingData[] = [];

    // Poshmark uses tile cards for listings
    const cardSelectors = [
      '[data-et-name="listing"]',
      '.card--small',
      '.tile',
      'a[href*="/listing/"]',
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

        const title = $item.find('.tile__title, .title, h4, [class*="title"]').first().text().trim()
          || $item.attr('title')
          || '';
        if (!title || title.length < 5) return;

        const priceText = $item.find('.fw--bold, [class*="price"], .price').first().text().trim();
        const price = parsePrice(priceText);
        if (!price) return;

        let itemUrl = $item.find('a').first().attr('href') || $item.attr('href') || '';
        if (itemUrl && !itemUrl.startsWith('http')) {
          itemUrl = `https://poshmark.com${itemUrl}`;
        }
        if (!itemUrl) return;

        // Verify brand match
        const titleLower = title.toLowerCase();
        if (!titleLower.includes(item.brand.toLowerCase().split(' ')[0])) return;

        // Skip junk
        const skipWords = ['dust bag', 'box only', 'wallet', 'card holder', 'charm', 'keychain', 'scarf', 'belt'];
        if (skipWords.some((w) => titleLower.includes(w))) return;

        let condition: 'mint' | 'excellent' | 'good' | 'fair' = 'good';
        if (titleLower.includes('nwt') || titleLower.includes('new with')) condition = 'mint';
        else if (titleLower.includes('like new') || titleLower.includes('excellent')) condition = 'excellent';
        else if (titleLower.includes('fair') || titleLower.includes('worn')) condition = 'fair';

        const seller = $item.find('[class*="user"], .seller, .username').first().text().trim() || undefined;

        listings.push({
          source: 'Poshmark',
          sourceUrl: itemUrl,
          brand: item.brand,
          model: item.model,
          askingPrice: price,
          condition,
          seller,
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

export const poshmarkProvider = new PoshmarkProvider();
