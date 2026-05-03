import { NextRequest, NextResponse } from 'next/server';
import {
  getWatchlistItems,
  insertWatchlistItem,
  deleteWatchlistItem,
  getWatchlistItemByListingId,
  getListingById,
  getAllModels,
  getAllBrands,
  getAllValuations,
} from '@/lib/db/queries';
import type { WatchlistItem } from '@/types';

export async function GET() {
  try {
    const [items, models, brands, valuations] = await Promise.all([
      getWatchlistItems(),
      getAllModels(),
      getAllBrands(),
      getAllValuations(),
    ]);

    const enriched = await Promise.all(
      items.map(async (item) => {
        const listing = await getListingById(item.listingId);
        const model = listing ? models.find((m) => m.id === listing.modelId) : undefined;
        const brand = model ? brands.find((b) => b.id === model.brandId) : undefined;
        const valuation = valuations.find((v) => v.listingId === item.listingId);

        return {
          ...item,
          listing: listing
            ? {
                id: listing.id,
                source: listing.source,
                sourceUrl: listing.sourceUrl,
                askingPrice: listing.askingPrice,
                condition: listing.condition,
                stillActive: listing.stillActive,
                imageUrl: listing.imageUrl,
              }
            : null,
          model: model
            ? {
                id: model.id,
                name: model.name,
                referenceNumber: model.referenceNumber,
                imageUrl: model.imageUrl,
              }
            : null,
          brand: brand ? { id: brand.id, name: brand.name } : null,
          valuation: valuation
            ? {
                fairMarketValue: valuation.fairMarketValue,
                confidence: valuation.confidence,
                netProfit: valuation.netProfit,
                roiPercentage: valuation.roiPercentage,
              }
            : null,
        };
      })
    );

    return NextResponse.json({ watchlist: enriched });
  } catch (error) {
    console.error('Watchlist GET error:', error);
    return NextResponse.json({ error: 'Internal server error fetching watchlist' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { listingId, targetPrice, alertEnabled } = body as {
      listingId?: string;
      targetPrice?: number;
      alertEnabled?: boolean;
    };

    if (!listingId) {
      return NextResponse.json({ error: 'Missing required field: listingId' }, { status: 400 });
    }

    const listing = await getListingById(listingId);
    if (!listing) {
      return NextResponse.json({ error: `Listing with id "${listingId}" not found` }, { status: 404 });
    }

    const existing = await getWatchlistItemByListingId(listingId);
    if (existing) {
      return NextResponse.json(
        { error: 'Item is already on your watchlist', item: existing },
        { status: 409 }
      );
    }

    const newItem: WatchlistItem = {
      id: `wl-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      listingId,
      targetPrice: targetPrice ?? undefined,
      alertEnabled: alertEnabled ?? true,
      addedAt: new Date(),
    };

    await insertWatchlistItem(newItem);

    const [models, brands] = await Promise.all([getAllModels(), getAllBrands()]);
    const model = models.find((m) => m.id === listing.modelId);
    const brand = model ? brands.find((b) => b.id === model.brandId) : undefined;

    return NextResponse.json(
      {
        item: {
          ...newItem,
          listing: {
            id: listing.id,
            source: listing.source,
            sourceUrl: listing.sourceUrl,
            askingPrice: listing.askingPrice,
            condition: listing.condition,
            stillActive: listing.stillActive,
          },
          model: model ? { id: model.id, name: model.name, referenceNumber: model.referenceNumber } : null,
          brand: brand ? { id: brand.id, name: brand.name } : null,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Watchlist POST error:', error);
    return NextResponse.json({ error: 'Internal server error adding to watchlist' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing required query parameter: id' }, { status: 400 });
    }

    const removed = await deleteWatchlistItem(id);
    if (!removed) {
      return NextResponse.json({ error: `Watchlist item with id "${id}" not found` }, { status: 404 });
    }

    return NextResponse.json({ message: 'Item removed from watchlist' });
  } catch (error) {
    console.error('Watchlist DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error removing from watchlist' }, { status: 500 });
  }
}
