import { NextRequest, NextResponse } from 'next/server';
import { providerRegistry } from '@/lib/data-providers/provider-registry';
import { getSeedData, addListing, addValuation, addModel } from '@/lib/db/seed';
import { analyzeItem } from '@/lib/ai/analyze';
import type { Listing, Valuation, Condition, Confidence } from '@/types';

export const maxDuration = 300; // 5 minutes max for Vercel

// Timeout wrapper — abort if a promise takes too long
function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_resolve, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${ms / 1000}s`)), ms)
    ),
  ]);
}

export async function GET(request: NextRequest) {
  try {
    // Verify authorization — allow same-origin requests (from the app UI)
    // and cron requests with the secret
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    const referer = request.headers.get('referer') || '';
    const host = request.headers.get('host') || '';
    const isSameOrigin = referer.includes(host);

    if (cronSecret && !isSameOrigin && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if client wants streaming progress
    const acceptHeader = request.headers.get('accept') || '';
    const wantsStream = acceptHeader.includes('text/event-stream');

    if (wantsStream) {
      return handleStreamingScan();
    } else {
      return handleNormalScan();
    }
  } catch (error) {
    console.error('Cron refresh error:', error);
    return NextResponse.json(
      { error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

// ============================================================================
// Shared scraping + analysis logic
// ============================================================================

async function scrapeAllProviders() {
  // Run watch and handbag scraping with a 60s timeout each
  const [watchResult, handbagResult] = await Promise.allSettled([
    withTimeout(providerRegistry.fetchAllListings('watch'), 60000, 'Watch scraping'),
    withTimeout(providerRegistry.fetchAllListings('handbag'), 60000, 'Handbag scraping'),
  ]);

  const watchListings = watchResult.status === 'fulfilled' ? watchResult.value : [];
  const handbagListings = handbagResult.status === 'fulfilled' ? handbagResult.value : [];

  if (watchResult.status === 'rejected') {
    console.error('Watch scraping failed:', watchResult.reason);
  }
  if (handbagResult.status === 'rejected') {
    console.error('Handbag scraping failed:', handbagResult.reason);
  }

  return { watchListings, handbagListings };
}

interface ProcessResult {
  savedCount: number;
  analyzedCount: number;
  errors: string[];
  deals: Array<{ brand: string; model: string; price: number; profit: number; source: string }>;
}

async function processListings(
  allScraped: Array<{ brand: string; model: string; referenceNumber?: string; askingPrice: number; condition: string; seller?: string; source: string; sourceUrl: string }>,
  existingUrls: Set<string>,
  onProgress?: (step: string, current: number, total: number) => void
): Promise<ProcessResult> {
  const seed = getSeedData();
  const newListings = allScraped.filter((l) => !existingUrls.has(l.sourceUrl));

  // Limit to 10 items for AI analysis to stay within Vercel timeout
  const toProcess = newListings.slice(0, 10);
  let savedCount = 0;
  let analyzedCount = 0;
  const errors: string[] = [];
  const deals: ProcessResult['deals'] = [];

  for (let i = 0; i < toProcess.length; i++) {
    const scraped = toProcess[i];
    onProgress?.(
      `Analyzing ${scraped.brand} ${scraped.model} from ${scraped.source}`,
      i + 1,
      toProcess.length
    );

    try {
      let matchedModel = seed.models.find((m) => {
        const brandMatch = seed.brands.find((b) => b.id === m.brandId);
        if (!brandMatch) return false;
        return (
          brandMatch.name.toLowerCase() === scraped.brand.toLowerCase() &&
          (m.name.toLowerCase().includes(scraped.model.toLowerCase().split(' ')[0]) ||
           scraped.model.toLowerCase().includes(m.name.toLowerCase().split(' ')[0]))
        );
      });

      const matchedBrand = seed.brands.find(
        (b) => b.name.toLowerCase() === scraped.brand.toLowerCase()
      );

      if (!matchedModel) {
        const brandId = matchedBrand?.id ?? `brand-scraped-${scraped.brand.toLowerCase().replace(/\s+/g, '-')}`;
        matchedModel = {
          id: `model-scraped-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
          brandId,
          name: scraped.model,
          referenceNumber: scraped.referenceNumber,
          msrp: scraped.askingPrice * 1.3,
          typicalResaleLow: scraped.askingPrice * 0.85,
          typicalResaleHigh: scraped.askingPrice * 1.25,
        };
        addModel(matchedModel);
      }

      const listingId = `lst-scraped-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const newListing: Listing = {
        id: listingId,
        modelId: matchedModel.id,
        source: scraped.source,
        sourceUrl: scraped.sourceUrl,
        askingPrice: scraped.askingPrice,
        condition: scraped.condition as Condition,
        seller: scraped.seller,
        foundAt: new Date(),
        stillActive: true,
      };

      addListing(newListing);
      existingUrls.add(scraped.sourceUrl);

      const comparablePrices = seed.listings
        .filter((l) => l.modelId === matchedModel!.id && l.id !== listingId && l.stillActive)
        .map((l) => l.askingPrice);

      const recentSales = seed.priceHistory
        .filter((p) => p.modelId === matchedModel!.id)
        .map((p) => p.price);

      // 15s timeout per AI analysis
      const analysis = await withTimeout(
        analyzeItem({
          brand: scraped.brand,
          model: scraped.model,
          referenceNumber: scraped.referenceNumber,
          askingPrice: scraped.askingPrice,
          condition: scraped.condition,
          comparablePrices,
          recentSales,
          msrp: matchedModel.msrp,
          typicalResaleLow: matchedModel.typicalResaleLow,
          typicalResaleHigh: matchedModel.typicalResaleHigh,
        }),
        15000,
        `AI analysis of ${scraped.brand} ${scraped.model}`
      );

      analyzedCount++;

      const netProfit = analysis.profitEstimate.net;
      const roiPercentage = parseFloat(analysis.profitEstimate.roi);

      const valuation: Valuation = {
        id: `val-scraped-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        listingId,
        fairMarketValue: analysis.fairMarketValue,
        confidence: analysis.confidence as Confidence,
        reasoning: analysis.reasoning,
        redFlags: analysis.redFlags,
        marketOutlook: analysis.marketOutlook,
        estimatedProfit: analysis.profitEstimate.gross,
        estimatedFees: analysis.profitEstimate.fees,
        netProfit,
        roiPercentage: isNaN(roiPercentage) ? 0 : roiPercentage,
        createdAt: new Date(),
      };

      addValuation(valuation);
      savedCount++;
      deals.push({ brand: scraped.brand, model: scraped.model, price: scraped.askingPrice, profit: netProfit, source: scraped.source });
    } catch (error) {
      const msg = `Failed: ${scraped.brand} ${scraped.model} from ${scraped.source} — ${error instanceof Error ? error.message : 'Unknown'}`;
      console.error(msg);
      errors.push(msg);
    }
  }

  return { savedCount, analyzedCount, errors, deals };
}

// ============================================================================
// Streaming scan — sends real-time progress via Server-Sent Events
// ============================================================================

function handleStreamingScan() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: Record<string, unknown>) => {
        try {
          controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
        } catch {
          // controller might be closed
        }
      };

      try {
        const providers = providerRegistry.getProviders();
        send('status', { phase: 'starting', message: 'Starting scan...', providers: providers.map((p) => p.name) });

        const seed = getSeedData();
        const existingUrls = new Set(seed.listings.map((l) => l.sourceUrl));

        // Phase 1: Scrape
        send('status', { phase: 'scraping', message: 'Scraping marketplaces for listings...' });
        send('progress', { step: 'Scraping all providers in parallel...', detail: providers.map(p => p.name).join(', ') });

        const { watchListings, handbagListings } = await scrapeAllProviders();

        send('progress', { step: `Found ${watchListings.length} watches + ${handbagListings.length} handbags`, done: true });

        const allScraped = [...watchListings, ...handbagListings];

        // Phase 2: Analyze
        send('status', {
          phase: 'analyzing',
          message: `Found ${allScraped.length} listings. Analyzing top deals with AI...`,
          scraped: allScraped.length,
        });

        const result = await processListings(allScraped, existingUrls, (step, current, total) => {
          send('progress', {
            step,
            current,
            total,
            percent: Math.round((current / total) * 100),
          });
        });

        // Send found deals
        for (const deal of result.deals) {
          send('deal', deal);
        }

        // Done
        send('complete', {
          scraped: allScraped.length,
          newListings: allScraped.filter(l => !existingUrls.has(l.sourceUrl)).length,
          processed: Math.min(10, allScraped.length),
          saved: result.savedCount,
          analyzed: result.analyzedCount,
          errors: result.errors.length,
          errorMessages: result.errors,
          providers: providers.map((p) => p.name),
          breakdown: { watches: watchListings.length, handbags: handbagListings.length },
        });
      } catch (error) {
        send('error', {
          message: `Fatal error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          fatal: true,
        });
      } finally {
        try { controller.close(); } catch { /* already closed */ }
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}

// ============================================================================
// Normal scan — returns JSON (for cron jobs)
// ============================================================================

async function handleNormalScan() {
  const seed = getSeedData();
  const existingUrls = new Set(seed.listings.map((l) => l.sourceUrl));

  const { watchListings, handbagListings } = await scrapeAllProviders();
  const allScraped = [...watchListings, ...handbagListings];

  const result = await processListings(allScraped, existingUrls);

  const providers = providerRegistry.getProviders();

  return NextResponse.json({
    refreshed: true,
    scraped: allScraped.length,
    newListings: allScraped.filter(l => !existingUrls.has(l.sourceUrl)).length,
    processed: Math.min(10, allScraped.length),
    saved: result.savedCount,
    analyzed: result.analyzedCount,
    errors: result.errors.length,
    errorMessages: result.errors.slice(0, 10),
    timestamp: new Date().toISOString(),
    providers: providers.map((p) => p.name),
    breakdown: {
      watches: watchListings.length,
      handbags: handbagListings.length,
    },
  });
}
