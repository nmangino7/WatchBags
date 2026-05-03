import { NextRequest, NextResponse } from 'next/server';
import { analyzeItem } from '@/lib/ai/analyze';
import {
  getAllBrands,
  getAllModels,
  getAllListings,
  getPriceHistoryByModelId,
} from '@/lib/db/queries';

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

    if (!brand || !model || askingPrice === undefined || !condition) {
      return NextResponse.json(
        { error: 'Missing required fields: brand, model, askingPrice, condition' },
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

    const [brands, models, listings] = await Promise.all([
      getAllBrands(),
      getAllModels(),
      getAllListings(),
    ]);

    const matchedModel = models.find(
      (m) =>
        m.name.toLowerCase() === model.toLowerCase() ||
        (referenceNumber && m.referenceNumber === referenceNumber)
    );

    const matchedBrand = brands.find(
      (b) => b.name.toLowerCase() === brand.toLowerCase()
    );

    const comparablePrices: number[] = [];
    const recentSales: number[] = [];

    if (matchedModel) {
      const modelListings = listings.filter(
        (l) => l.modelId === matchedModel.id && l.stillActive && l.id !== listingId
      );
      for (const listing of modelListings) {
        comparablePrices.push(listing.askingPrice);
      }

      const priceHistoryPoints = await getPriceHistoryByModelId(matchedModel.id);
      for (const entry of priceHistoryPoints) {
        recentSales.push(entry.price);
      }
    }

    const msrp = matchedModel?.msrp ?? 0;
    const typicalResaleLow = matchedModel?.typicalResaleLow ?? 0;
    const typicalResaleHigh = matchedModel?.typicalResaleHigh ?? 0;

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
