import { NextRequest, NextResponse } from 'next/server';
import { analyzeItem } from '@/lib/ai/analyze';
import { getSeedData } from '@/lib/db/seed';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { brand, model, referenceNumber, askingPrice, condition, listingId } =
      body as {
        brand?: string;
        model?: string;
        referenceNumber?: string;
        askingPrice?: number;
        condition?: string;
        listingId?: string;
      };

    // Validate required fields
    if (!brand || !model || askingPrice === undefined || !condition) {
      return NextResponse.json(
        {
          error: 'Missing required fields: brand, model, askingPrice, condition',
        },
        { status: 400 }
      );
    }

    if (typeof askingPrice !== 'number' || askingPrice <= 0) {
      return NextResponse.json(
        { error: 'askingPrice must be a positive number' },
        { status: 400 }
      );
    }

    const validConditions = ['mint', 'excellent', 'good', 'fair'];
    if (!validConditions.includes(condition)) {
      return NextResponse.json(
        { error: `condition must be one of: ${validConditions.join(', ')}` },
        { status: 400 }
      );
    }

    // Look up comparable prices and recent sales from seed data
    const seed = getSeedData();

    // Find the matching model
    const matchedModel = seed.models.find(
      (m) =>
        m.name.toLowerCase() === model.toLowerCase() ||
        (referenceNumber && m.referenceNumber === referenceNumber)
    );

    // Find matching brand
    const matchedBrand = seed.brands.find(
      (b) => b.name.toLowerCase() === brand.toLowerCase()
    );

    // Collect comparable prices from active listings of the same model
    const comparablePrices: number[] = [];
    const recentSales: number[] = [];

    if (matchedModel) {
      // Get listing prices (excluding the current listing if listingId provided)
      const modelListings = seed.listings.filter(
        (l) =>
          l.modelId === matchedModel.id &&
          l.stillActive &&
          l.id !== listingId
      );
      for (const listing of modelListings) {
        comparablePrices.push(listing.askingPrice);
      }

      // Get recent sold prices from price history
      const modelHistory = seed.priceHistory.filter(
        (ph) => ph.modelId === matchedModel.id
      );
      for (const entry of modelHistory) {
        recentSales.push(entry.price);
      }
    }

    const msrp = matchedModel?.msrp ?? askingPrice;
    const typicalResaleLow = matchedModel?.typicalResaleLow ?? askingPrice * 0.8;
    const typicalResaleHigh =
      matchedModel?.typicalResaleHigh ?? askingPrice * 1.2;

    const analysis = await analyzeItem({
      brand,
      model,
      referenceNumber,
      askingPrice,
      condition,
      comparablePrices,
      recentSales,
      msrp,
      typicalResaleLow,
      typicalResaleHigh,
    });

    return NextResponse.json({
      analysis,
      metadata: {
        listingId: listingId ?? null,
        brand: matchedBrand?.name ?? brand,
        model: matchedModel?.name ?? model,
        comparablesCount: comparablePrices.length,
        salesCount: recentSales.length,
        analyzedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Analysis API error:', error);
    return NextResponse.json(
      { error: 'Internal server error during analysis' },
      { status: 500 }
    );
  }
}
