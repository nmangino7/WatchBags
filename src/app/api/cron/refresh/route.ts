import { NextRequest, NextResponse } from 'next/server';
import { providerRegistry } from '@/lib/data-providers/provider-registry';
import { getSeedData, addListing, addValuation, addModel } from '@/lib/db/seed';
import { analyzeItem } from '@/lib/ai/analyze';
import type { Listing, Valuation, Condition, Confidence } from '@/types';

export const maxDuration = 300; // 5 minutes max for Vercel

export async function GET(request: NextRequest) {
  try {
    // Verify authorization
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const seed = getSeedData();

    // Track existing listing URLs for deduplication
    const existingUrls = new Set(seed.listings.map((l) => l.sourceUrl));

    // Fetch new listings from all registered providers
    const [watchListings, handbagListings] = await Promise.all([
      providerRegistry.fetchAllListings('watch'),
      providerRegistry.fetchAllListings('handbag'),
    ]);

    const allScraped = [...watchListings, ...handbagListings];

    // Deduplicate — skip listings we already have
    const newListings = allScraped.filter((l) => !existingUrls.has(l.sourceUrl));

    // Process new listings: match to models, run AI analysis, save
    let savedCount = 0;
    let analyzedCount = 0;
    const errors: string[] = [];

    // Limit to top 50 new listings per cron run to control API costs
    const toProcess = newListings.slice(0, 50);

    for (const scraped of toProcess) {
      try {
        // Find matching model in seed data
        let matchedModel = seed.models.find((m) => {
          const brandMatch = seed.brands.find((b) => b.id === m.brandId);
          if (!brandMatch) return false;
          return (
            brandMatch.name.toLowerCase() === scraped.brand.toLowerCase() &&
            (m.name.toLowerCase().includes(scraped.model.toLowerCase().split(' ')[0]) ||
             scraped.model.toLowerCase().includes(m.name.toLowerCase().split(' ')[0]))
          );
        });

        // Find or infer the brand
        const matchedBrand = seed.brands.find(
          (b) => b.name.toLowerCase() === scraped.brand.toLowerCase()
        );

        // If no model match, create a temporary model entry
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

        // Create listing
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
        existingUrls.add(scraped.sourceUrl); // prevent duplicates within this run

        // Run AI analysis (only if we have the API key to avoid burning through fallback)
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

        // Only save valuation if the deal is profitable
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
        const msg = `Failed to process ${scraped.brand} ${scraped.model} from ${scraped.source}`;
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
      timestamp: new Date().toISOString(),
      providers: providers.map((p) => p.name),
      breakdown: {
        watches: watchListings.length,
        handbags: handbagListings.length,
      },
    });
  } catch (error) {
    console.error('Cron refresh error:', error);
    return NextResponse.json(
      { error: 'Internal server error during refresh' },
      { status: 500 }
    );
  }
}
