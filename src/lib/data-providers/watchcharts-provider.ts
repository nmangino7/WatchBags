import * as cheerio from 'cheerio';
import type { DataProvider, ListingData, PriceDataPoint } from './types';

// ============================================================================
// WatchCharts — market price data for luxury watches
// Scrapes their public search/listing pages
// ============================================================================

interface WatchChartsItem {
  brand: string;
  model: string;
  slug: string;
  referenceNumber?: string;
}

const WATCH_CATALOG: WatchChartsItem[] = [
  { brand: 'Rolex', model: 'Submariner', slug: 'rolex/submariner', referenceNumber: '126610LN' },
  { brand: 'Rolex', model: 'Daytona', slug: 'rolex/daytona', referenceNumber: '116500LN' },
  { brand: 'Rolex', model: 'GMT-Master II', slug: 'rolex/gmt-master-ii', referenceNumber: '126710BLRO' },
  { brand: 'Rolex', model: 'Datejust', slug: 'rolex/datejust' },
  { brand: 'Omega', model: 'Speedmaster', slug: 'omega/speedmaster' },
  { brand: 'Omega', model: 'Seamaster', slug: 'omega/seamaster' },
  { brand: 'Tudor', model: 'Black Bay', slug: 'tudor/black-bay' },
  { brand: 'Patek Philippe', model: 'Nautilus', slug: 'patek-philippe/nautilus' },
  { brand: 'Audemars Piguet', model: 'Royal Oak', slug: 'audemars-piguet/royal-oak' },
  { brand: 'Cartier', model: 'Santos', slug: 'cartier/santos' },
];

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parsePrice(text: string): number | null {
  const cleaned = text.replace(/[^0-9.,]/g, '').replace(/,/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) || num < 500 ? null : num;
}

export class WatchChartsProvider implements DataProvider {
  public readonly name = 'WatchCharts';

  async fetchListings(
    category: 'watch' | 'handbag',
    brands?: string[]
  ): Promise<ListingData[]> {
    if (category !== 'watch') return [];

    let items = WATCH_CATALOG;
    if (brands && brands.length > 0) {
      items = items.filter((item) =>
        brands.some((b) => b.toLowerCase() === item.brand.toLowerCase())
      );
    }

    // Pick random subset of 4 items
    const shuffled = [...items].sort(() => Math.random() - 0.5);
    const toScrape = shuffled.slice(0, 4);

    const allListings: ListingData[] = [];

    for (const item of toScrape) {
      try {
        const listings = await this.scrapePage(item);
        allListings.push(...listings);
      } catch (error) {
        console.error(`WatchCharts scrape failed for ${item.brand} ${item.model}:`, error);
      }

      await delay(800 + Math.random() * 700);
    }

    return allListings;
  }

  private async scrapePage(item: WatchChartsItem): Promise<ListingData[]> {
    const url = `https://watchcharts.com/listings/${item.slug}`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      throw new Error(`WatchCharts returned HTTP ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const listings: ListingData[] = [];

    // WatchCharts listing cards
    const selectors = [
      '.listing-card',
      '.listing-item',
      '[class*="listing"]',
      '.card',
      'a[href*="/listing/"]',
    ];

    let matchSelector = selectors[0];
    for (const sel of selectors) {
      if ($(sel).length > 0) {
        matchSelector = sel;
        break;
      }
    }

    $(matchSelector).each((_i, el) => {
      try {
        const $item = $(el);

        const title = $item.find('h3, h4, .title, [class*="title"]').first().text().trim()
          || $item.text().trim().slice(0, 100);
        if (!title || title.length < 5) return;

        const priceText = $item.find('[class*="price"], .price').first().text().trim();
        const price = parsePrice(priceText);
        if (!price) return;

        let itemUrl = $item.find('a').first().attr('href') || $item.attr('href') || '';
        if (itemUrl && !itemUrl.startsWith('http')) {
          itemUrl = `https://watchcharts.com${itemUrl}`;
        }
        if (!itemUrl) return;

        const refMatch = title.match(/\b(\d{5,6}[A-Z]*)\b/);

        listings.push({
          source: 'WatchCharts',
          sourceUrl: itemUrl,
          brand: item.brand,
          model: item.model,
          referenceNumber: refMatch?.[1] || item.referenceNumber,
          askingPrice: price,
          condition: 'good',
          seller: 'WatchCharts',
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

export const watchChartsProvider = new WatchChartsProvider();
