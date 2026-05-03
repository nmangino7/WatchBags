import { NextResponse } from 'next/server';
import { getAllBrands, getAllModels } from '@/lib/db/queries';
import { getDb } from '@/lib/db';
import * as schema from '@/lib/db/schema';
import { getSeedData } from '@/lib/db/seed';

export async function GET() {
  try {
    const [brands, models] = await Promise.all([getAllBrands(), getAllModels()]);

    const db = getDb();
    let priceHistory: Array<{ id: string; modelId: string; source: string; price: number; recordedAt: Date }>;

    if (db) {
      const rows = await db.select().from(schema.priceHistory);
      priceHistory = rows.map((r) => ({
        id: r.id,
        modelId: r.modelId,
        source: r.source,
        price: r.price,
        recordedAt: r.recordedAt,
      }));
    } else {
      priceHistory = getSeedData().priceHistory;
    }

    return NextResponse.json({ brands, models, priceHistory });
  } catch (error) {
    console.error('Trends API error:', error);
    return NextResponse.json({ error: 'Failed to fetch trends' }, { status: 500 });
  }
}
