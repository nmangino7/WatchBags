import * as cheerio from 'cheerio';
import type { DataProvider, ListingData, PriceDataPoint } from './types';

// ============================================================================
// Search catalog — brands + models to scrape
// ============================================================================

interface SearchItem {
  brand: string;
  model: string;
  referenceNumber?: string;
  category: 'watch' | 'handbag';
}

const SEARCH_CATALOG: SearchItem[] = [
  // Watches
  { brand: 'Rolex', model: 'Submariner Date', referenceNumber: '126610LN', category: 'watch' },
  { brand: 'Rolex', model: 'Daytona', referenceNumber: '116500LN', category: 'watch' },
  { brand: 'Rolex', model: 'GMT-Master II', referenceNumber: '126710BLRO', category: 'watch' },
  { brand: 'Rolex', model: 'Datejust 41', referenceNumber: '126334', category: 'watch' },
  { brand: 'Omega', model: 'Speedmaster Moonwatch', category: 'watch' },
  { brand: 'Omega', model: 'Seamaster 300M', category: 'watch' },
  { brand: 'Tudor', model: 'Black Bay 58', category: 'watch' },
  { brand: 'Cartier', model: 'Santos', category: 'watch' },
  { brand: 'Patek Philippe', model: 'Nautilus', category: 'watch' },
  { brand: 'Patek Philippe', model: 'Aquanaut', category: 'watch' },
  { brand: 'Audemars Piguet', model: 'Royal Oak', category: 'watch' },
  { brand: 'IWC', model: 'Portugieser', category: 'watch' },
  { brand: 'Breitling', model: 'Navitimer', category: 'watch' },
  { brand: 'Grand Seiko', model: 'Snowflake', category: 'watch' },
  { brand: 'TAG Heuer', model: 'Carrera', category: 'watch' },

  // Handbags
  { brand: 'Hermes', model: 'Birkin 25', category: 'handbag' },
  { brand: 'Hermes', model: 'Birkin 30', category: 'handbag' },
  { brand: 'Hermes', model: 'Kelly 28', category: 'handbag' },
  { brand: 'Chanel', model: 'Classic Flap Medium', category: 'handbag' },
  { brand: 'Chanel', model: 'Classic Flap Jumbo', category: 'handbag' },
  { brand: 'Chanel', model: 'Boy Bag', category: 'handbag' },
  { brand: 'Louis Vuitton', model: 'Neverfull MM', category: 'handbag' },
  { brand: 'Louis Vuitton', model: 'Speedy 25', category: 'handbag' },
  { brand: 'Dior', model: 'Lady Dior Medium', category: 'handbag' },
  { brand: 'Gucci', model: 'Dionysus', category: 'handbag' },
  { brand: 'Prada', model: 'Galleria', category: 'handbag' },
  { brand: 'Bottega Veneta', model: 'Jodie', category: 'handbag' },
  { brand: 'Saint Laurent', model: 'Loulou', category: 'handbag' },
  { brand: 'Celine', model: 'Luggage', category: 'handbag' },
  { brand: 'Fendi', model: 'Peekaboo', category: 'handbag' },
  { brand: 'Goyard', model: 'St Louis PM', category: 'handbag' },
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
// eBay Scraper
// ============================================================================

export class EbayProvider implements DataProvider {
  public readonly name = 'eBay';

  async fetchListings(
    category: 'watch' | 'handbag',
    brands?: string[]
  ): Promise<ListingData[]> {
    const items = SEARCH_CATALOG.filter((item) => item.category === category);
    const filtered = brands && brands.length > 0
      ? items.filter((item) => brands.some((b) => b.toLowerCase() === item.brand.toLowerCase()))
      : items;

    const allListings: ListingData[] = [];

    for (const item of filtered) {
      try {
        const listings = await this.scrapeSearch(item);
        allListings.push(...listings);
      } catch (error) {
        console.error(`eBay scrape failed for ${item.brand} ${item.model}:`, error);
      }

      // Rate limit: wait between requests
      await delay(1500 + Math.random() * 1000);
    }

    return allListings;
  }

  private async scrapeSearch(item: SearchItem): Promise<ListingData[]> {
    const query = encodeURIComponent(`${item.brand} ${item.model}`);
    // Buy It Now only, sorted by newly listed
    const url = `https://www.ebay.com/sch/i.html?_nkw=${query}&_sacat=0&LH_BIN=1&_sop=10&_ipg=60`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      throw new Error(`eBay returned HTTP ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const listings: ListingData[] = [];

    $('li.s-item').each((_i, el) => {
      try {
        const $item = $(el);

        // Get title
        const title = $item.find('.s-item__title').first().text().trim();
        if (!title || title === 'Shop on eBay') return; // skip placeholder items

        // Get price
        const priceText = $item.find('.s-item__price').first().text().trim();
        const price = parsePrice(priceText);
        if (!price || price < 100) return; // skip junk/accessories

        // Get URL
        const itemUrl = $item.find('a.s-item__link').attr('href') || '';
        if (!itemUrl) return;

        // Clean the URL (remove tracking params)
        const cleanUrl = itemUrl.split('?')[0];

        // Get condition
        const conditionText = $item.find('.SECONDARY_INFO').text().trim();
        const condition = inferCondition(title, conditionText);

        // Get seller
        const seller = $item.find('.s-item__seller-info-text, .s-item__seller-info').text().trim() || undefined;

        // Verify the title actually matches the brand
        const titleLower = title.toLowerCase();
        if (!titleLower.includes(item.brand.toLowerCase().split(' ')[0])) {
          return; // skip irrelevant results
        }

        listings.push({
          source: 'eBay',
          sourceUrl: cleanUrl,
          brand: item.brand,
          model: item.model,
          referenceNumber: item.referenceNumber,
          askingPrice: price,
          condition,
          seller: seller || undefined,
        });
      } catch {
        // Skip items that fail to parse
      }
    });

    // Limit to top 10 per search to keep data manageable
    return listings.slice(0, 10);
  }

  async fetchPriceHistory(brand: string, model: string): Promise<PriceDataPoint[]> {
    // Scrape eBay completed/sold listings for price history
    try {
      const query = encodeURIComponent(`${brand} ${model}`);
      // LH_Complete=1&LH_Sold=1 = completed+sold items
      const url = `https://www.ebay.com/sch/i.html?_nkw=${query}&_sacat=0&LH_Complete=1&LH_Sold=1&_sop=13&_ipg=30`;

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        signal: AbortSignal.timeout(15000),
      });

      if (!response.ok) return [];

      const html = await response.text();
      const $ = cheerio.load(html);
      const points: PriceDataPoint[] = [];

      $('li.s-item').each((_i, el) => {
        try {
          const $item = $(el);
          const title = $item.find('.s-item__title').first().text().trim();
          if (!title || title === 'Shop on eBay') return;

          const priceText = $item.find('.s-item__price').first().text().trim();
          const price = parsePrice(priceText);
          if (!price || price < 100) return;

          // Verify brand match
          if (!title.toLowerCase().includes(brand.toLowerCase().split(' ')[0])) return;

          // Get sold date
          const dateText = $item.find('.s-item__ended-date, .s-item__endedDate, .POSITIVE').text().trim();
          let date = new Date();
          if (dateText) {
            const parsed = new Date(dateText);
            if (!isNaN(parsed.getTime())) {
              date = parsed;
            }
          }

          points.push({
            source: 'eBay',
            price,
            date,
            type: 'sold',
          });
        } catch {
          // skip
        }
      });

      return points;
    } catch (error) {
      console.error(`eBay price history failed for ${brand} ${model}:`, error);
      return [];
    }
  }
}

export const ebayProvider = new EbayProvider();
