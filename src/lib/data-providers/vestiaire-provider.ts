import * as cheerio from 'cheerio';
import type { DataProvider, ListingData, PriceDataPoint } from './types';

// ============================================================================
// Vestiaire Collective — luxury resale marketplace for watches & handbags
// ============================================================================

interface VestiaireItem {
  brand: string;
  model: string;
  referenceNumber?: string;
  category: 'watch' | 'handbag';
}

const SEARCH_CATALOG: VestiaireItem[] = [
  // Watches
  { brand: 'Rolex', model: 'Submariner', category: 'watch' },
  { brand: 'Rolex', model: 'Daytona', category: 'watch' },
  { brand: 'Rolex', model: 'GMT-Master II', category: 'watch' },
  { brand: 'Omega', model: 'Speedmaster', category: 'watch' },
  { brand: 'Tudor', model: 'Black Bay', category: 'watch' },
  { brand: 'Cartier', model: 'Santos', category: 'watch' },
  { brand: 'Patek Philippe', model: 'Nautilus', category: 'watch' },
  { brand: 'Audemars Piguet', model: 'Royal Oak', category: 'watch' },

  // Handbags
  { brand: 'Hermes', model: 'Birkin', category: 'handbag' },
  { brand: 'Hermes', model: 'Kelly', category: 'handbag' },
  { brand: 'Chanel', model: 'Classic Flap', category: 'handbag' },
  { brand: 'Louis Vuitton', model: 'Neverfull', category: 'handbag' },
  { brand: 'Dior', model: 'Lady Dior', category: 'handbag' },
  { brand: 'Gucci', model: 'Dionysus', category: 'handbag' },
  { brand: 'Prada', model: 'Galleria', category: 'handbag' },
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

function inferCondition(title: string, subtitle: string = ''): 'mint' | 'excellent' | 'good' | 'fair' {
  const text = `${title} ${subtitle}`.toLowerCase();
  if (text.includes('new') || text.includes('unworn') || text.includes('bnib') || text.includes('sealed')) {
    return 'mint';
  }
  if (text.includes('excellent') || text.includes('like new') || text.includes('pristine')) {
    return 'excellent';
  }
  if (text.includes('fair') || text.includes('worn') || text.includes('used heavily') || text.includes('needs repair')) {
    return 'fair';
  }
  return 'good'; // default
}

// ============================================================================
// Vestiaire Collective Scraper
// ============================================================================

export class VestiaireProvider implements DataProvider {
  public readonly name = 'Vestiaire';

  async fetchListings(
    category: 'watch' | 'handbag',
    brands?: string[]
  ): Promise<ListingData[]> {
    const items = SEARCH_CATALOG.filter((item) => item.category === category);
    const filtered = brands && brands.length > 0
      ? items.filter((item) => brands.some((b) => b.toLowerCase() === item.brand.toLowerCase()))
      : items;

    // Pick a random subset of 5 items per scan
    const shuffled = [...filtered].sort(() => Math.random() - 0.5);
    const toScrape = shuffled.slice(0, 5);

    const allListings: ListingData[] = [];

    for (const item of toScrape) {
      try {
        const listings = await this.scrapeSearch(item);
        allListings.push(...listings);
      } catch (error) {
        console.error(`Vestiaire scrape failed for ${item.brand} ${item.model}:`, error);
      }

      // Delay between requests
      await delay(800 + Math.random() * 700);
    }

    return allListings;
  }

  private async scrapeSearch(item: VestiaireItem): Promise<ListingData[]> {
    const query = encodeURIComponent(`${item.brand} ${item.model}`);
    const categoryParam = item.category === 'watch' ? 'watches' : 'bags';
    const url = `https://www.vestiairecollective.com/search/?q=${query}&category=${categoryParam}`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      throw new Error(`Vestiaire returned HTTP ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const listings: ListingData[] = [];

    const minPrice = item.category === 'watch' ? 500 : 200;

    // Try multiple selectors as fallback
    const cardSelectors = [
      '.product-card',
      '.catalog-product',
      '[data-product]',
      'a[href*="/product/"]',
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

        // Get title
        const title = $item.find('.product-card__title, .product-title, h3, [class*="title"]').first().text().trim()
          || $item.attr('title')
          || '';
        if (!title || title.length < 5) return;

        // Get price
        const priceText = $item.find('.product-card__price, [class*="price"], .price').first().text().trim();
        const price = parsePrice(priceText);
        if (!price || price < minPrice) return;

        // Get URL
        let itemUrl = $item.find('a').first().attr('href') || $item.attr('href') || '';
        if (itemUrl && !itemUrl.startsWith('http')) {
          itemUrl = `https://www.vestiairecollective.com${itemUrl}`;
        }
        if (!itemUrl) return;

        // Get image URL — try multiple selectors
        let imageUrl: string | undefined;
        const imgSelectors = [
          'img.product-image',
          'img[data-src]',
          'picture source',
          'img[src*="images"]',
        ];
        for (const imgSel of imgSelectors) {
          const $img = $item.find(imgSel).first();
          if ($img.length > 0) {
            imageUrl = $img.attr('data-src') || $img.attr('src') || $img.attr('srcset')?.split(',')[0]?.trim()?.split(' ')[0];
            if (imageUrl) break;
          }
        }
        // Fallback: grab any img inside the card
        if (!imageUrl) {
          const $anyImg = $item.find('img').first();
          imageUrl = $anyImg.attr('data-src') || $anyImg.attr('src') || undefined;
        }

        // Verify brand match
        const titleLower = title.toLowerCase();
        if (!titleLower.includes(item.brand.toLowerCase().split(' ')[0])) return;

        // Skip accessories, parts, straps, boxes (not actual items)
        const skipWords = [
          'strap', 'band', 'bracelet only', 'clasp', 'bezel insert', 'dial only',
          'crown', 'crystal', 'parts', 'for parts', 'repair', 'manual', 'booklet',
          'box only', 'dust bag', 'wallet', 'card holder', 'charm', 'keychain', 'scarf',
        ];
        if (skipWords.some((w) => titleLower.includes(w))) return;

        // Get condition
        const conditionText = $item.find('[class*="condition"], .product-card__condition').text().trim();
        const condition = inferCondition(title, conditionText);

        // Get seller
        const seller = $item.find('[class*="seller"], [class*="user"], .vendor').first().text().trim() || undefined;

        listings.push({
          source: 'Vestiaire',
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
        // Skip items that fail to parse
      }
    });

    // Limit to top 10 per search
    return listings.slice(0, 10);
  }

  async fetchPriceHistory(_brand: string, _model: string): Promise<PriceDataPoint[]> {
    return [];
  }
}

export const vestiaireProvider = new VestiaireProvider();
