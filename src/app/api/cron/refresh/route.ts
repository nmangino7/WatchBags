import { NextRequest, NextResponse } from 'next/server';
import { providerRegistry } from '@/lib/data-providers/provider-registry';

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

    // Fetch new listings from all registered providers
    const [watchListings, handbagListings] = await Promise.all([
      providerRegistry.fetchAllListings('watch'),
      providerRegistry.fetchAllListings('handbag'),
    ]);

    const totalNewListings = watchListings.length + handbagListings.length;

    // In a production app, we would:
    // 1. Deduplicate against existing listings in the database
    // 2. Run AI analysis on new listings
    // 3. Update price history records
    // 4. Flag new deals that meet threshold criteria
    // 5. Send notifications for watchlist matches

    // For now, collect unique models from the fetched listings to simulate
    // price updates
    const uniqueModels = new Set<string>();
    for (const listing of [...watchListings, ...handbagListings]) {
      uniqueModels.add(`${listing.brand}:${listing.model}`);
    }

    const providers = providerRegistry.getProviders();

    return NextResponse.json({
      refreshed: true,
      newListings: totalNewListings,
      updatedPrices: uniqueModels.size,
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
