import { NextRequest, NextResponse } from 'next/server';
import { providerRegistry } from '@/lib/data-providers/provider-registry';
import { getSeedData, addListing, addValuation, addModel } from '@/lib/db/seed';
import { analyzeItem } from '@/lib/ai/analyze';
import type { Listing, Valuation, Condition, Confidence } from '@/types';

export const maxDuration = 300; // 5 minutes max for Vercel

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
// Streaming scan — sends real-time progress via Server-Sent Events
// ============================================================================

function handleStreamingScan() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };

      try {
        const providers = providerRegistry.getProviders();
        send('status', { phase: 'starting', message: 'Starting scan...', providers: providers.map((p) => p.name) });

        const seed = getSeedData();
        const existingUrls = new Set(seed.listings.map((l) => l.sourceUrl));

        // Phase 1: Scrape providers
        send('status', { phase: 'scraping', message: 'Scraping marketplaces for listings...' });

        let watchListings: Awaited<ReturnType<typeof providerRegistry.fetchAllListings>> = [];
        let handbagListings: Awaited<ReturnType<typeof providerRegistry.fetchAllListings>> = [];

        try {
          send('progress', { step: 'Scraping watch listings...', detail: 'eBay, Chrono24, Bob\'s Watches, Reddit' });
          watchListings = await providerRegistry.fetchAllListings('watch');
          send('progress', { step: `Found ${watchListings.length} watch listings`, done: true });
        } catch (err) {
          send('error', { message: `Watch scraping failed: ${err instanceof Error ? err.message : 'Unknown'}` });
        }

        try {
          send('progress', { step: 'Scraping handbag listings...', detail: 'eBay' });
          handbagListings = await providerRegistry.fetchAllListings('handbag');
          send('progress', { step: `Found ${handbagListings.length} handbag listings`, done: true });
        } catch (err) {
          send('error', { message: `Handbag scraping failed: ${err instanceof Error ? err.message : 'Unknown'}` });
        }

        const allScraped = [...watchListings, ...handbagListings];
        const newListings = allScraped.filter((l) => !existingUrls.has(l.sourceUrl));

        send('status', {
          phase: 'analyzing',
          message: `Found ${allScraped.length} listings (${newListings.length} new). Running AI analysis...`,
          scraped: allScraped.length,
          new: newListings.length,
        });

        // Phase 2: Process & analyze (limit to 20 to stay within Vercel timeout)
        const toProcess = newListings.slice(0, 20);
        let savedCount = 0;
        let analyzedCount = 0;
        const errors: string[] = [];

        for (let i = 0; i < toProcess.length; i++) {
          const scraped = toProcess[i];

          send('progress', {
            step: `Analyzing ${scraped.brand} ${scraped.model}...`,
            detail: `from ${scraped.source}`,
            current: i + 1,
            total: toProcess.length,
            percent: Math.round(((i + 1) / toProcess.length) * 100),
          });

          try {
            // Find matching model
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

            const analysis = await analyzeItem({
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
            });

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

            send('deal', {
              brand: scraped.brand,
              model: scraped.model,
              price: scraped.askingPrice,
              profit: netProfit,
              source: scraped.source,
            });
          } catch (error) {
            const msg = `Failed: ${scraped.brand} ${scraped.model} from ${scraped.source} — ${error instanceof Error ? error.message : 'Unknown error'}`;
            console.error(msg, error);
            errors.push(msg);
            send('error', { message: msg });
          }
        }

        // Done
        send('complete', {
          scraped: allScraped.length,
          newListings: newListings.length,
          processed: toProcess.length,
          saved: savedCount,
          analyzed: analyzedCount,
          errors: errors.length,
          errorMessages: errors,
          providers: providers.map((p) => p.name),
          breakdown: {
            watches: watchListings.length,
            handbags: handbagListings.length,
          },
        });
      } catch (error) {
        send('error', {
          message: `Fatal error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          fatal: true,
        });
      } finally {
        controller.close();
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

  const [watchListings, handbagListings] = await Promise.all([
    providerRegistry.fetchAllListings('watch'),
    providerRegistry.fetchAllListings('handbag'),
  ]);

  const allScraped = [...watchListings, ...handbagListings];
  const newListings = allScraped.filter((l) => !existingUrls.has(l.sourceUrl));

  let savedCount = 0;
  let analyzedCount = 0;
  const errors: string[] = [];
  const toProcess = newListings.slice(0, 20);

  for (const scraped of toProcess) {
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

      const analysis = await analyzeItem({
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
      });

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
    } catch (error) {
      const msg = `Failed to process ${scraped.brand} ${scraped.model} from ${scraped.source}: ${error instanceof Error ? error.message : 'Unknown'}`;
      console.error(msg, error);
      errors.push(msg);
    }
  }

  const providers = providerRegistry.getProviders();

  return NextResponse.json({
    refreshed: true,
    scraped: allScraped.length,
    newListings: newListings.length,
    processed: toProcess.length,
    saved: savedCount,
    analyzed: analyzedCount,
    errors: errors.length,
    errorMessages: errors.slice(0, 10),
    timestamp: new Date().toISOString(),
    providers: providers.map((p) => p.name),
    breakdown: {
      watches: watchListings.length,
      handbags: handbagListings.length,
    },
  });
}
