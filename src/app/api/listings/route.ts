import { NextRequest, NextResponse } from 'next/server';
import {
  getAllBrands,
  getAllModels,
  getAllListings,
  insertListing,
  insertValuation,
  insertModel,
  getPriceHistoryByModelId,
} from '@/lib/db/queries';
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
    } = body as {
      brand?: string;
      model?: string;
      referenceNumber?: string;
      askingPrice?: number;
      condition?: string;
      seller?: string;
      source?: string;
      sourceUrl?: string;
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

    const [brands, models, allListings] = await Promise.all([
      getAllBrands(),
      getAllModels(),
      getAllListings(),
    ]);

    const matchedBrand = brands.find((b) => b.name.toLowerCase() === brand.toLowerCase());

    let matchedModel = models.find(
      (m) =>
        m.name.toLowerCase() === model.toLowerCase() ||
        (referenceNumber && m.referenceNumber?.toLowerCase() === referenceNumber.toLowerCase())
    );

    const brandId = matchedBrand?.id ?? `brand-custom-${Date.now()}`;
    if (!matchedModel) {
      matchedModel = {
        id: `model-custom-${Date.now()}`,
        brandId,
        name: model,
        referenceNumber: referenceNumber || undefined,
        msrp: 0,
        typicalResaleLow: 0,
        typicalResaleHigh: 0,
        imageUrl: undefined,
      };
      await insertModel(matchedModel);
    }

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

    await insertListing(newListing);

    const comparablePrices = allListings
      .filter((l) => l.modelId === matchedModel!.id && l.id !== listingId && l.stillActive)
      .map((l) => l.askingPrice);

    const priceHistoryPoints = await getPriceHistoryByModelId(matchedModel.id);
    const recentSales = priceHistoryPoints.map((p) => p.price);

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

    await insertValuation(valuation);

    return NextResponse.json(
      {
        listing: newListing,
        valuation,
        analysis,
        brand: matchedBrand?.name ?? brand,
        model: matchedModel.name,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Listings API error:', error);
    return NextResponse.json({ error: 'Failed to create listing' }, { status: 500 });
  }
}
