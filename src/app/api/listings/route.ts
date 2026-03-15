import { NextRequest, NextResponse } from 'next/server';
import { getSeedData, addListing, addValuation, addModel } from '@/lib/db/seed';
import { analyzeItem } from '@/lib/ai/analyze';
import type { Listing, Valuation, Condition, Confidence } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      brand,
      model,
      referenceNumber,
      askingPrice,
      condition,
      seller,
      source,
      sourceUrl,
      category,
    } = body as {
      brand?: string;
      model?: string;
      referenceNumber?: string;
      askingPrice?: number;
      condition?: string;
      seller?: string;
      source?: string;
      sourceUrl?: string;
      category?: string;
    };

    if (!brand || !model || !askingPrice || !condition) {
      return NextResponse.json(
        { error: 'Missing required fields: brand, model, askingPrice, condition' },
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

    const seed = getSeedData();

    // Find or create brand match
    const matchedBrand = seed.brands.find(
      (b) => b.name.toLowerCase() === brand.toLowerCase()
    );

    // Find or create model match
    let matchedModel = seed.models.find(
      (m) =>
        m.name.toLowerCase() === model.toLowerCase() ||
        (referenceNumber && m.referenceNumber?.toLowerCase() === referenceNumber.toLowerCase())
    );

    // If model not in DB, create a temporary one
    const brandId = matchedBrand?.id ?? `brand-custom-${Date.now()}`;
    if (!matchedModel) {
      matchedModel = {
        id: `model-custom-${Date.now()}`,
        brandId,
        name: model,
        referenceNumber: referenceNumber || undefined,
        msrp: askingPrice * 1.3, // rough estimate
        typicalResaleLow: askingPrice * 0.85,
        typicalResaleHigh: askingPrice * 1.25,
        imageUrl: undefined,
      };
      addModel(matchedModel);
    }

    // Create the listing
    const listingId = `lst-user-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newListing: Listing = {
      id: listingId,
      modelId: matchedModel.id,
      source: source ?? 'Manual',
      sourceUrl: sourceUrl ?? '',
      askingPrice,
      condition: condition as Condition,
      seller: seller || undefined,
      foundAt: new Date(),
      stillActive: true,
    };

    addListing(newListing);

    // Run AI analysis
    const comparablePrices = seed.listings
      .filter((l) => l.modelId === matchedModel!.id && l.id !== listingId && l.stillActive)
      .map((l) => l.askingPrice);

    const recentSales = seed.priceHistory
      .filter((p) => p.modelId === matchedModel!.id)
      .map((p) => p.price);

    const analysis = await analyzeItem({
      brand,
      model,
      referenceNumber,
      askingPrice,
      condition,
      comparablePrices,
      recentSales,
      msrp: matchedModel.msrp,
      typicalResaleLow: matchedModel.typicalResaleLow,
      typicalResaleHigh: matchedModel.typicalResaleHigh,
    });

    // Create valuation
    const valuation: Valuation = {
      id: `val-user-${Date.now()}`,
      listingId,
      fairMarketValue: analysis.fairMarketValue,
      confidence: analysis.confidence as Confidence,
      reasoning: analysis.reasoning,
      redFlags: analysis.redFlags,
      marketOutlook: analysis.marketOutlook,
      estimatedProfit: analysis.profitEstimate.gross,
      estimatedFees: analysis.profitEstimate.fees,
      netProfit: analysis.profitEstimate.net,
      roiPercentage: parseFloat(analysis.profitEstimate.roi),
      createdAt: new Date(),
    };

    addValuation(valuation);

    return NextResponse.json({
      listing: newListing,
      valuation,
      analysis,
      brand: matchedBrand?.name ?? brand,
      model: matchedModel.name,
    }, { status: 201 });
  } catch (error) {
    console.error('Listings API error:', error);
    return NextResponse.json(
      { error: 'Failed to create listing' },
      { status: 500 }
    );
  }
}
