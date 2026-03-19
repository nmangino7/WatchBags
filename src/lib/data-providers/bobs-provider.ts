import * as cheerio from 'cheerio';
import type { DataProvider, ListingData, PriceDataPoint } from './types';

// ============================================================================
// Bob's Watches — Rolex specialist, server-rendered HTML
// ============================================================================

interface BobsSearchItem {
  brand: string;
  model: string;
  slug: string;
  referenceNumber?: string;
}

const BOBS_CATALOG: BobsSearchItem[] = [
  { brand: 'Rolex', model: 'Submariner', slug: 'rolex-submariner', referenceNumber: '126610LN' },
  { brand: 'Rolex', model: 'Daytona', slug: 'rolex-daytona', referenceNumber: '116500LN' },
  { brand: 'Rolex', model: 'GMT-Master II', slug: 'rolex-gmt-master-ii', referenceNumber: '126710BLRO' },
  { brand: 'Rolex', model: 'Datejust', slug: 'rolex-datejust' },
  { brand: 'Rolex', model: 'Explorer', slug: 'rolex-explorer' },
  { brand: 'Rolex', model: 'Sea-Dweller', slug: 'rolex-sea-dweller' },
  { brand: 'Rolex', model: 'Yacht-Master', slug: 'rolex-yacht-master' },
  { brand: 'Rolex', model: 'Air-King', slug: 'rolex-air-king' },
  { brand: 'Rolex', model: 'Day-Date', slug: 'rolex-day-date' },
  { brand: 'Rolex', model: 'Milgauss', slug: 'rolex-milgauss' },
];

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parsePrice(text: string): number | null {
  const cleaned = text.replace(/[^0-9.,]/g, '').replace(/,/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) || num < 500 ? null : num;
}

export class BobsProvider implements DataProvider {
  public readonly name = "Bob's Watches";

  async fetchListings(
    category: 'watch' | 'handbag',
    brands?: string[]
  ): Promise<ListingData[]> {
    // Bob's only sells watches (Rolex specialist)
    if (category !== 'watch') return [];

    const items = brands && brands.length > 0
      ? BOBS_CATALOG.filter((item) => brands.some((b) => b.toLowerCase() === item.brand.toLowerCase()))
      : BOBS_CATALOG;

    // Pick a random subset of 4 items per scan
    const shuffled = [...items].sort(() => Math.random() - 0.5);
    const toScrape = shuffled.slice(0, 4);

    const allListings: ListingData[] = [];

    for (const item of toScrape) {
      try {
        const listings = await this.scrapePage(item);
        allListings.push(...listings);
      } catch (error) {
        console.error(`Bob's Watches scrape failed for ${item.model}:`, error);
      }

      await delay(800 + Math.random() * 700);
    }

    return allListings;
  }

  private async scrapePage(item: BobsSearchItem): Promise<ListingData[]> {
    const url = `https://www.bobswatches.com/${item.slug}`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      throw new Error(`Bob's Watches returned HTTP ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const listings: ListingData[] = [];

    // Bob's uses product cards — try multiple selectors
    const selectors = [
      '.product-item',
      '.product-card',
      '[data-product-id]',
      '.plp-product-card',
      'a[href*="/used-rolex"]',
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

        // Get title
        const title = $item.find('.product-name, .product-title, h3, h2').first().text().trim()
          || $item.attr('title')
          || $item.text().trim().slice(0, 100);
        if (!title) return;

        // Get price
        const priceText = $item.find('.price, .product-price, [class*="price"]').first().text().trim();
        const price = parsePrice(priceText);
        if (!price) return;

        // Get URL
        let itemUrl = $item.find('a').first().attr('href') || $item.attr('href') || '';
        if (itemUrl && !itemUrl.startsWith('http')) {
          itemUrl = `https://www.bobswatches.com${itemUrl}`;
        }
        if (!itemUrl) return;

        // Extract reference number from title if present
        const refMatch = title.match(/\b(\d{5,6}[A-Z]*)\b/);
        const referenceNumber = refMatch?.[1] || item.referenceNumber;

        // Infer condition — Bob's specializes in pre-owned
        let condition: 'mint' | 'excellent' | 'good' | 'fair' = 'good';
        const titleLower = title.toLowerCase();
        if (titleLower.includes('unworn') || titleLower.includes('new')) condition = 'mint';
        else if (titleLower.includes('excellent')) condition = 'excellent';
        else if (titleLower.includes('fair')) condition = 'fair';

        // Get image
        const imageUrl = $item.find('img').first().attr('src')
          || $item.find('img').first().attr('data-src')
          || $item.find('img').first().attr('data-lazy')
          || undefined;

        listings.push({
          source: "Bob's Watches",
          sourceUrl: itemUrl,
          brand: item.brand,
          model: item.model,
          referenceNumber,
          askingPrice: price,
          condition,
          seller: "Bob's Watches",
          imageUrl: imageUrl && !imageUrl.startsWith('http') ? `https://www.bobswatches.com${imageUrl}` : imageUrl,
        });
      } catch {
        // Skip items that fail to parse
      }
    });

    return listings.slice(0, 10);
  }

  async fetchPriceHistory(_brand: string, _model: string): Promise<PriceDataPoint[]> {
    // Bob's doesn't have public sold history pages
    return [];
  }
}

export const bobsProvider = new BobsProvider();
