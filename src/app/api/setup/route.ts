import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { sql } from 'drizzle-orm';
import * as schema from '@/lib/db/schema';
import { getSeedData } from '@/lib/db/seed';

export async function POST() {
  const db = getDb();
  if (!db) {
    return NextResponse.json(
      { error: 'No POSTGRES_URL or DATABASE_URL configured' },
      { status: 400 }
    );
  }

  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS brands (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        logo_url TEXT,
        description TEXT
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS models (
        id TEXT PRIMARY KEY,
        brand_id TEXT NOT NULL REFERENCES brands(id),
        name TEXT NOT NULL,
        reference_number TEXT,
        msrp REAL NOT NULL DEFAULT 0,
        typical_resale_low REAL NOT NULL DEFAULT 0,
        typical_resale_high REAL NOT NULL DEFAULT 0,
        image_url TEXT
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS listings (
        id TEXT PRIMARY KEY,
        model_id TEXT NOT NULL REFERENCES models(id),
        source TEXT NOT NULL,
        source_url TEXT NOT NULL,
        asking_price REAL NOT NULL,
        condition TEXT NOT NULL,
        seller TEXT,
        image_url TEXT,
        found_at TIMESTAMP NOT NULL DEFAULT NOW(),
        still_active BOOLEAN NOT NULL DEFAULT TRUE
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS valuations (
        id TEXT PRIMARY KEY,
        listing_id TEXT NOT NULL REFERENCES listings(id),
        fair_market_value REAL NOT NULL,
        confidence TEXT NOT NULL,
        reasoning TEXT NOT NULL,
        red_flags TEXT[] NOT NULL DEFAULT '{}',
        market_outlook TEXT NOT NULL,
        estimated_profit REAL NOT NULL,
        estimated_fees REAL NOT NULL,
        net_profit REAL NOT NULL,
        roi_percentage REAL NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS price_history (
        id TEXT PRIMARY KEY,
        model_id TEXT NOT NULL REFERENCES models(id),
        source TEXT NOT NULL,
        price REAL NOT NULL,
        recorded_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS watchlist (
        id TEXT PRIMARY KEY,
        listing_id TEXT NOT NULL REFERENCES listings(id),
        target_price REAL,
        alert_enabled BOOLEAN NOT NULL DEFAULT TRUE,
        added_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS inventory (
        id TEXT PRIMARY KEY,
        model_id TEXT NOT NULL REFERENCES models(id),
        purchase_price REAL NOT NULL,
        purchase_date TIMESTAMP NOT NULL DEFAULT NOW(),
        condition TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'in_hand',
        sale_price REAL,
        sale_date TIMESTAMP,
        platform TEXT,
        notes TEXT
      )
    `);

    await db.execute(sql`CREATE INDEX IF NOT EXISTS models_brand_id_idx ON models(brand_id)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS listings_model_id_idx ON listings(model_id)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS valuations_listing_id_idx ON valuations(listing_id)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS price_history_model_id_idx ON price_history(model_id)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS watchlist_listing_id_idx ON watchlist(listing_id)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS inventory_model_id_idx ON inventory(model_id)`);

    // Seed brands and models
    const existingBrands = await db.select({ id: schema.brands.id }).from(schema.brands).limit(1);
    let seeded = false;

    if (existingBrands.length === 0) {
      const seed = getSeedData();

      for (const b of seed.brands) {
        await db
          .insert(schema.brands)
          .values({
            id: b.id,
            name: b.name,
            category: b.category,
            logoUrl: b.logoUrl ?? null,
            description: b.description ?? null,
          })
          .onConflictDoNothing();
      }

      for (const m of seed.models) {
        await db
          .insert(schema.models)
          .values({
            id: m.id,
            brandId: m.brandId,
            name: m.name,
            referenceNumber: m.referenceNumber ?? null,
            msrp: m.msrp,
            typicalResaleLow: m.typicalResaleLow,
            typicalResaleHigh: m.typicalResaleHigh,
            imageUrl: m.imageUrl ?? null,
          })
          .onConflictDoNothing();
      }

      seeded = true;
    }

    return NextResponse.json({
      success: true,
      tables: 'created',
      seeded,
      message: seeded
        ? 'Database initialized and seeded with brands/models'
        : 'Database tables verified (already seeded)',
    });
  } catch (error) {
    console.error('DB setup error:', error);
    return NextResponse.json(
      { error: `Setup failed: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
