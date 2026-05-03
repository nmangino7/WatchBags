import { NextRequest, NextResponse } from 'next/server';
import { getDealsWithDetails } from '@/lib/db/queries';
import type { Condition, DealWithDetails } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const category = searchParams.get('category') as 'watch' | 'handbag' | null;
    const brandFilter = searchParams.get('brand');
    const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined;
    const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;
    const minProfit = searchParams.get('minProfit') ? Number(searchParams.get('minProfit')) : undefined;
    const conditionFilter = searchParams.get('condition') as Condition | null;
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') ?? 'profit';
    const page = Math.max(1, Number(searchParams.get('page') ?? '1'));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit') ?? '20')));

    let filtered: DealWithDetails[] = await getDealsWithDetails();

    if (category) {
      filtered = filtered.filter((d) => d.brand.category === category);
    }
    if (brandFilter) {
      const lowerBrand = brandFilter.toLowerCase();
      filtered = filtered.filter((d) => d.brand.name.toLowerCase() === lowerBrand);
    }
    if (minPrice !== undefined) {
      filtered = filtered.filter((d) => d.listing.askingPrice >= minPrice);
    }
    if (maxPrice !== undefined) {
      filtered = filtered.filter((d) => d.listing.askingPrice <= maxPrice);
    }
    if (minProfit !== undefined) {
      filtered = filtered.filter((d) => d.valuation.netProfit >= minProfit);
    }
    if (conditionFilter) {
      filtered = filtered.filter((d) => d.listing.condition === conditionFilter);
    }
    if (search) {
      const lowerSearch = search.toLowerCase();
      filtered = filtered.filter(
        (d) =>
          d.brand.name.toLowerCase().includes(lowerSearch) ||
          d.model.name.toLowerCase().includes(lowerSearch) ||
          (d.model.referenceNumber && d.model.referenceNumber.toLowerCase().includes(lowerSearch)) ||
          d.listing.source.toLowerCase().includes(lowerSearch)
      );
    }

    switch (sort) {
      case 'price':
        filtered.sort((a, b) => a.listing.askingPrice - b.listing.askingPrice);
        break;
      case 'roi':
        filtered.sort((a, b) => b.valuation.roiPercentage - a.valuation.roiPercentage);
        break;
      default:
        filtered.sort((a, b) => b.valuation.netProfit - a.valuation.netProfit);
    }

    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / limit);
    const offset = (page - 1) * limit;
    const paginatedDeals = filtered.slice(offset, offset + limit);

    return NextResponse.json({
      deals: paginatedDeals,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.error('Deals API error:', error);
    return NextResponse.json({ error: 'Internal server error fetching deals' }, { status: 500 });
  }
}
