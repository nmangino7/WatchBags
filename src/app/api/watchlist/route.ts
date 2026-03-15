import { NextRequest, NextResponse } from 'next/server';
import { getSeedData } from '@/lib/db/seed';
import type { WatchlistItem } from '@/types';

// In-memory store initialized from seed data
let watchlistItems: WatchlistItem[] | null = null;

function getWatchlist(): WatchlistItem[] {
  if (watchlistItems === null) {
    watchlistItems = [...getSeedData().watchlistItems];
  }
  return watchlistItems;
}

export async function GET() {
  try {
    const watchlist = getWatchlist();
    const seed = getSeedData();

    // Enrich watchlist items with listing, model, and brand details
    const enriched = watchlist.map((item) => {
      const listing = seed.listings.find((l) => l.id === item.listingId);
      const model = listing
        ? seed.models.find((m) => m.id === listing.modelId)
        : undefined;
      const brand = model
        ? seed.brands.find((b) => b.id === model.brandId)
        : undefined;
      const valuation = seed.valuations.find(
        (v) => v.listingId === item.listingId
      );

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
    });

    return NextResponse.json({ watchlist: enriched });
  } catch (error) {
    console.error('Watchlist GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error fetching watchlist' },
      { status: 500 }
    );
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
      return NextResponse.json(
        { error: 'Missing required field: listingId' },
        { status: 400 }
      );
    }

    // Verify listing exists
    const seed = getSeedData();
    const listing = seed.listings.find((l) => l.id === listingId);
    if (!listing) {
      return NextResponse.json(
        { error: `Listing with id "${listingId}" not found` },
        { status: 404 }
      );
    }

    const watchlist = getWatchlist();

    // Check for duplicates
    const existing = watchlist.find((w) => w.listingId === listingId);
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

    watchlist.push(newItem);

    // Enrich the response
    const model = seed.models.find((m) => m.id === listing.modelId);
    const brand = model
      ? seed.brands.find((b) => b.id === model.brandId)
      : undefined;

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
          model: model
            ? {
                id: model.id,
                name: model.name,
                referenceNumber: model.referenceNumber,
              }
            : null,
          brand: brand ? { id: brand.id, name: brand.name } : null,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Watchlist POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error adding to watchlist' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Missing required query parameter: id' },
        { status: 400 }
      );
    }

    const watchlist = getWatchlist();
    const index = watchlist.findIndex((w) => w.id === id);

    if (index === -1) {
      return NextResponse.json(
        { error: `Watchlist item with id "${id}" not found` },
        { status: 404 }
      );
    }

    const removed = watchlist.splice(index, 1)[0];

    return NextResponse.json({
      removed,
      message: 'Item removed from watchlist',
    });
  } catch (error) {
    console.error('Watchlist DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error removing from watchlist' },
      { status: 500 }
    );
  }
}
