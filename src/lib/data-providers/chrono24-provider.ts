import * as cheerio from 'cheerio';
import type { DataProvider, ListingData, PriceDataPoint } from './types';

// ============================================================================
// Watch-only search catalog for Chrono24
// ============================================================================

interface SearchItem {
  brand: string;
  model: string;
  referenceNumber?: string;
}

const WATCH_CATALOG: SearchItem[] = [
  { brand: 'Rolex', model: 'Submariner Date', referenceNumber: '126610LN' },
  { brand: 'Rolex', model: 'Daytona', referenceNumber: '116500LN' },
  { brand: 'Rolex', model: 'GMT-Master II', referenceNumber: '126710BLRO' },
  { brand: 'Rolex', model: 'Datejust 41', referenceNumber: '126334' },
  { brand: 'Omega', model: 'Speedmaster Moonwatch' },
  { brand: 'Omega', model: 'Seamaster 300M' },
  { brand: 'Tudor', model: 'Black Bay 58' },
  { brand: 'Cartier', model: 'Santos' },
  { brand: 'Patek Philippe', model: 'Nautilus' },
  { brand: 'Patek Philippe', model: 'Aquanaut' },
  { brand: 'Audemars Piguet', model: 'Royal Oak' },
  { brand: 'IWC', model: 'Portugieser' },
  { brand: 'Breitling', model: 'Navitimer' },
  { brand: 'Grand Seiko', model: 'Snowflake' },
  { brand: 'TAG Heuer', model: 'Carrera' },
];

// ============================================================================
// Helpers
// ============================================================================

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parsePrice(text: string): number | null {
  // Chrono24 can show prices in various currencies
  // Try to extract the numeric value
  const cleaned = text.replace(/[^0-9.,]/g, '');
  // Handle European format: 12.500 or 12,500
  let normalized = cleaned;
  // If has dots as thousands separator (e.g., 12.500)
  if (/^\d{1,3}(\.\d{3})+$/.test(cleaned)) {
    normalized = cleaned.replace(/\./g, '');
  }
  // If has commas as thousands separator (e.g., 12,500)
  normalized = normalized.replace(/,/g, '');
  const num = parseFloat(normalized);
  return isNaN(num) ? null : num;
}

function inferCondition(text: string): 'mint' | 'excellent' | 'good' | 'fair' {
  const lower = text.toLowerCase();
  if (lower.includes('new') || lower.includes('unworn')) return 'mint';
  if (lower.includes('very good') || lower.includes('excellent')) return 'excellent';
  if (lower.includes('fair') || lower.includes('incomplete')) return 'fair';
  return 'good';
}

// ============================================================================
// Chrono24 Scraper (watches only)
// ============================================================================

export class Chrono24Provider implements DataProvider {
  public readonly name = 'Chrono24';

  async fetchListings(
    category: 'watch' | 'handbag',
    brands?: string[]
  ): Promise<ListingData[]> {
    // Chrono24 is watches only
    if (category !== 'watch') return [];

    let items = WATCH_CATALOG;
    if (brands && brands.length > 0) {
      const lowerBrands = brands.map((b) => b.toLowerCase());
      items = items.filter((item) =>
        lowerBrands.includes(item.brand.toLowerCase())
      );
    }

    // Pick a random subset of 5 items per scan to stay within Vercel limits
    const shuffled = [...items].sort(() => Math.random() - 0.5);
    const toScrape = shuffled.slice(0, 5);

    const allListings: ListingData[] = [];

    for (const item of toScrape) {
      try {
        const listings = await this.scrapeSearch(item);
        allListings.push(...listings);
      } catch (error) {
        console.error(`Chrono24 scrape failed for ${item.brand} ${item.model}:`, error);
      }

      // Short delay between requests
      await delay(800 + Math.random() * 700);
    }

    return allListings;
  }

  private async scrapeSearch(item: SearchItem): Promise<ListingData[]> {
    const query = encodeURIComponent(`${item.brand} ${item.model}`);
    const url = `https://www.chrono24.com/search/index.htm?query=${query}&dosearch=true&sortorder=5`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      throw new Error(`Chrono24 returned HTTP ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const listings: ListingData[] = [];

    // Chrono24 uses article elements or div.article-item-container for listings
    $('article.article-item-container, div.article-item-container, [class*="article-item"]').each((_i, el) => {
      try {
        const $item = $(el);

        // Title
        const title = $item.find('[class*="article-title"], h3, .text-bold').first().text().trim();
        if (!title) return;

        // Price — look for the price element
        const priceText = $item.find('[class*="article-price"], [class*="price"], .text-price-new').first().text().trim();
        const price = parsePrice(priceText);
        if (!price || price < 500) return;

        // URL
        let itemUrl = $item.find('a').first().attr('href') || '';
        if (itemUrl && !itemUrl.startsWith('http')) {
          itemUrl = `https://www.chrono24.com${itemUrl}`;
        }
        if (!itemUrl) return;

        // Condition
        const conditionText = $item.find('[class*="condition"], .article-condition').text().trim();
        const condition = inferCondition(conditionText || title);

        // Seller/dealer
        const seller = $item.find('[class*="dealer-name"], [class*="seller"], .merchant-name').text().trim() || undefined;

        // Verify brand match
        if (!title.toLowerCase().includes(item.brand.toLowerCase().split(' ')[0])) {
          return;
        }

        // Image
        const imageUrl = $item.find('img').first().attr('src')
          || $item.find('img').first().attr('data-src')
          || undefined;

        listings.push({
          source: 'Chrono24',
          sourceUrl: itemUrl,
          brand: item.brand,
          model: item.model,
          referenceNumber: item.referenceNumber,
          askingPrice: price,
          condition,
          seller,
          imageUrl,
        });
      } catch {
        // skip
      }
    });

    // Also try a simpler selector pattern as fallback
    if (listings.length === 0) {
      $('a[href*="/watch/"]').each((_i, el) => {
        try {
          const $link = $(el);
          const title = $link.text().trim();
          if (!title || title.length < 10) return;

          const $parent = $link.closest('[class*="item"], [class*="result"], li, article');
          const priceText = $parent.find('[class*="price"]').text().trim();
          const price = parsePrice(priceText);
          if (!price || price < 500) return;

          let href = $link.attr('href') || '';
          if (href && !href.startsWith('http')) {
            href = `https://www.chrono24.com${href}`;
          }

          if (!title.toLowerCase().includes(item.brand.toLowerCase().split(' ')[0])) return;

          const imageUrl = $parent.find('img').first().attr('src')
            || $parent.find('img').first().attr('data-src')
            || undefined;

          listings.push({
            source: 'Chrono24',
            sourceUrl: href,
            brand: item.brand,
            model: item.model,
            referenceNumber: item.referenceNumber,
            askingPrice: price,
            condition: 'good',
            seller: undefined,
            imageUrl,
          });
        } catch {
          // skip
        }
      });
    }

    return listings.slice(0, 10);
  }

  async fetchPriceHistory(brand: string, model: string): Promise<PriceDataPoint[]> {
    // Chrono24 doesn't expose historical sold prices on public pages
    // Return empty — eBay covers sold data
    return [];
  }
}

export const chrono24Provider = new Chrono24Provider();
