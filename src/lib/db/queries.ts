import { eq, and, desc, sql } from 'drizzle-orm';
import { getDb } from './index';
import * as schema from './schema';
import type {
  Brand,
  Model,
  Listing,
  Valuation,
  PriceHistoryPoint,
  WatchlistItem,
  InventoryItem,
  DealWithDetails,
  Condition,
  Confidence,
  InventoryStatus,
} from '@/types';

// ============================================================================
// In-memory fallback — import seed data for when no DB is configured
// ============================================================================

import { getSeedData, addListing as seedAddListing, addValuation as seedAddValuation, addModel as seedAddModel } from './seed';

function useDb() {
  return getDb();
}

// ============================================================================
// Brands
// ============================================================================

export async function getAllBrands(): Promise<Brand[]> {
  const db = useDb();
  if (!db) return getSeedData().brands;
  const rows = await db.select().from(schema.brands);
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    category: r.category as Brand['category'],
    logoUrl: r.logoUrl ?? undefined,
    description: r.description ?? undefined,
  }));
}

// ============================================================================
// Models
// ============================================================================

export async function getAllModels(): Promise<Model[]> {
  const db = useDb();
  if (!db) return getSeedData().models;
  const rows = await db.select().from(schema.models);
  return rows.map((r) => ({
    id: r.id,
    brandId: r.brandId,
    name: r.name,
    referenceNumber: r.referenceNumber ?? undefined,
    msrp: r.msrp,
    typicalResaleLow: r.typicalResaleLow,
    typicalResaleHigh: r.typicalResaleHigh,
    imageUrl: r.imageUrl ?? undefined,
  }));
}

export async function insertModel(model: Model): Promise<void> {
  const db = useDb();
  if (!db) {
    seedAddModel(model);
    return;
  }
  await db
    .insert(schema.models)
    .values({
      id: model.id,
      brandId: model.brandId,
      name: model.name,
      referenceNumber: model.referenceNumber ?? null,
      msrp: model.msrp,
      typicalResaleLow: model.typicalResaleLow,
      typicalResaleHigh: model.typicalResaleHigh,
      imageUrl: model.imageUrl ?? null,
    })
    .onConflictDoNothing();
}

// ============================================================================
// Listings
// ============================================================================

export async function getAllListings(): Promise<Listing[]> {
  const db = useDb();
  if (!db) return getSeedData().listings;
  const rows = await db.select().from(schema.listings).orderBy(desc(schema.listings.foundAt));
  return rows.map((r) => ({
    id: r.id,
    modelId: r.modelId,
    source: r.source,
    sourceUrl: r.sourceUrl,
    askingPrice: r.askingPrice,
    condition: r.condition as Condition,
    seller: r.seller ?? undefined,
    imageUrl: r.imageUrl ?? undefined,
    foundAt: r.foundAt,
    stillActive: r.stillActive,
  }));
}

export async function getListingById(id: string): Promise<Listing | null> {
  const db = useDb();
  if (!db) {
    return getSeedData().listings.find((l) => l.id === id) ?? null;
  }
  const rows = await db.select().from(schema.listings).where(eq(schema.listings.id, id)).limit(1);
  if (rows.length === 0) return null;
  const r = rows[0];
  return {
    id: r.id,
    modelId: r.modelId,
    source: r.source,
    sourceUrl: r.sourceUrl,
    askingPrice: r.askingPrice,
    condition: r.condition as Condition,
    seller: r.seller ?? undefined,
    imageUrl: r.imageUrl ?? undefined,
    foundAt: r.foundAt,
    stillActive: r.stillActive,
  };
}

export async function getListingSourceUrls(): Promise<Set<string>> {
  const db = useDb();
  if (!db) {
    return new Set(getSeedData().listings.map((l) => l.sourceUrl));
  }
  const rows = await db.select({ sourceUrl: schema.listings.sourceUrl }).from(schema.listings);
  return new Set(rows.map((r) => r.sourceUrl));
}

export async function insertListing(listing: Listing): Promise<void> {
  const db = useDb();
  if (!db) {
    seedAddListing(listing);
    return;
  }
  await db
    .insert(schema.listings)
    .values({
      id: listing.id,
      modelId: listing.modelId,
      source: listing.source,
      sourceUrl: listing.sourceUrl,
      askingPrice: listing.askingPrice,
      condition: listing.condition,
      seller: listing.seller ?? null,
      imageUrl: listing.imageUrl ?? null,
      foundAt: listing.foundAt,
      stillActive: listing.stillActive,
    })
    .onConflictDoNothing();
}

export async function getListingsByModelId(modelId: string): Promise<Listing[]> {
  const db = useDb();
  if (!db) {
    return getSeedData().listings.filter((l) => l.modelId === modelId);
  }
  const rows = await db
    .select()
    .from(schema.listings)
    .where(eq(schema.listings.modelId, modelId));
  return rows.map((r) => ({
    id: r.id,
    modelId: r.modelId,
    source: r.source,
    sourceUrl: r.sourceUrl,
    askingPrice: r.askingPrice,
    condition: r.condition as Condition,
    seller: r.seller ?? undefined,
    imageUrl: r.imageUrl ?? undefined,
    foundAt: r.foundAt,
    stillActive: r.stillActive,
  }));
}

// ============================================================================
// Valuations
// ============================================================================

export async function getAllValuations(): Promise<Valuation[]> {
  const db = useDb();
  if (!db) return getSeedData().valuations;
  const rows = await db.select().from(schema.valuations);
  return rows.map((r) => ({
    id: r.id,
    listingId: r.listingId,
    fairMarketValue: r.fairMarketValue,
    confidence: r.confidence as Confidence,
    reasoning: r.reasoning,
    redFlags: r.redFlags ?? [],
    marketOutlook: r.marketOutlook,
    estimatedProfit: r.estimatedProfit,
    estimatedFees: r.estimatedFees,
    netProfit: r.netProfit,
    roiPercentage: r.roiPercentage,
    createdAt: r.createdAt,
  }));
}

export async function getValuationByListingId(listingId: string): Promise<Valuation | null> {
  const db = useDb();
  if (!db) {
    return getSeedData().valuations.find((v) => v.listingId === listingId) ?? null;
  }
  const rows = await db
    .select()
    .from(schema.valuations)
    .where(eq(schema.valuations.listingId, listingId))
    .limit(1);
  if (rows.length === 0) return null;
  const r = rows[0];
  return {
    id: r.id,
    listingId: r.listingId,
    fairMarketValue: r.fairMarketValue,
    confidence: r.confidence as Confidence,
    reasoning: r.reasoning,
    redFlags: r.redFlags ?? [],
    marketOutlook: r.marketOutlook,
    estimatedProfit: r.estimatedProfit,
    estimatedFees: r.estimatedFees,
    netProfit: r.netProfit,
    roiPercentage: r.roiPercentage,
    createdAt: r.createdAt,
  };
}

export async function insertValuation(valuation: Valuation): Promise<void> {
  const db = useDb();
  if (!db) {
    seedAddValuation(valuation);
    return;
  }
  await db
    .insert(schema.valuations)
    .values({
      id: valuation.id,
      listingId: valuation.listingId,
      fairMarketValue: valuation.fairMarketValue,
      confidence: valuation.confidence,
      reasoning: valuation.reasoning,
      redFlags: valuation.redFlags,
      marketOutlook: valuation.marketOutlook,
      estimatedProfit: valuation.estimatedProfit,
      estimatedFees: valuation.estimatedFees,
      netProfit: valuation.netProfit,
      roiPercentage: valuation.roiPercentage,
      createdAt: valuation.createdAt,
    })
    .onConflictDoNothing();
}

// ============================================================================
// Price History
// ============================================================================

export async function getPriceHistoryByModelId(modelId: string): Promise<PriceHistoryPoint[]> {
  const db = useDb();
  if (!db) {
    return getSeedData().priceHistory.filter((p) => p.modelId === modelId);
  }
  const rows = await db
    .select()
    .from(schema.priceHistory)
    .where(eq(schema.priceHistory.modelId, modelId))
    .orderBy(schema.priceHistory.recordedAt);
  return rows.map((r) => ({
    id: r.id,
    modelId: r.modelId,
    source: r.source,
    price: r.price,
    recordedAt: r.recordedAt,
  }));
}

// ============================================================================
// Watchlist
// ============================================================================

export async function getWatchlistItems(): Promise<WatchlistItem[]> {
  const db = useDb();
  if (!db) return getSeedData().watchlistItems;
  const rows = await db.select().from(schema.watchlist).orderBy(desc(schema.watchlist.addedAt));
  return rows.map((r) => ({
    id: r.id,
    listingId: r.listingId,
    targetPrice: r.targetPrice ?? undefined,
    alertEnabled: r.alertEnabled,
    addedAt: r.addedAt,
  }));
}

export async function insertWatchlistItem(item: WatchlistItem): Promise<void> {
  const db = useDb();
  if (!db) {
    getSeedData().watchlist.push(item);
    return;
  }
  await db
    .insert(schema.watchlist)
    .values({
      id: item.id,
      listingId: item.listingId,
      targetPrice: item.targetPrice ?? null,
      alertEnabled: item.alertEnabled,
      addedAt: item.addedAt,
    })
    .onConflictDoNothing();
}

export async function deleteWatchlistItem(id: string): Promise<boolean> {
  const db = useDb();
  if (!db) {
    const wl = getSeedData().watchlist;
    const idx = wl.findIndex((w) => w.id === id);
    if (idx === -1) return false;
    wl.splice(idx, 1);
    return true;
  }
  const result = await db.delete(schema.watchlist).where(eq(schema.watchlist.id, id));
  return (result.rowCount ?? 0) > 0;
}

export async function getWatchlistItemByListingId(listingId: string): Promise<WatchlistItem | null> {
  const db = useDb();
  if (!db) {
    return getSeedData().watchlist.find((w) => w.listingId === listingId) ?? null;
  }
  const rows = await db
    .select()
    .from(schema.watchlist)
    .where(eq(schema.watchlist.listingId, listingId))
    .limit(1);
  if (rows.length === 0) return null;
  const r = rows[0];
  return {
    id: r.id,
    listingId: r.listingId,
    targetPrice: r.targetPrice ?? undefined,
    alertEnabled: r.alertEnabled,
    addedAt: r.addedAt,
  };
}

// ============================================================================
// Inventory
// ============================================================================

export async function getInventoryItems(): Promise<InventoryItem[]> {
  const db = useDb();
  if (!db) return getSeedData().inventoryItems;
  const rows = await db.select().from(schema.inventory).orderBy(desc(schema.inventory.purchaseDate));
  return rows.map((r) => ({
    id: r.id,
    modelId: r.modelId,
    purchasePrice: r.purchasePrice,
    purchaseDate: r.purchaseDate,
    condition: r.condition as Condition,
    status: r.status as InventoryStatus,
    salePrice: r.salePrice ?? undefined,
    saleDate: r.saleDate ?? undefined,
    platform: r.platform ?? undefined,
    notes: r.notes ?? undefined,
  }));
}

export async function insertInventoryItem(item: InventoryItem): Promise<void> {
  const db = useDb();
  if (!db) {
    getSeedData().inventory.push(item);
    return;
  }
  await db
    .insert(schema.inventory)
    .values({
      id: item.id,
      modelId: item.modelId,
      purchasePrice: item.purchasePrice,
      purchaseDate: item.purchaseDate,
      condition: item.condition,
      status: item.status,
      salePrice: item.salePrice ?? null,
      saleDate: item.saleDate ?? null,
      platform: item.platform ?? null,
      notes: item.notes ?? null,
    })
    .onConflictDoNothing();
}

export async function updateInventoryItem(
  id: string,
  updates: Partial<Pick<InventoryItem, 'status' | 'salePrice' | 'saleDate' | 'platform' | 'notes'>>
): Promise<boolean> {
  const db = useDb();
  if (!db) {
    const inv = getSeedData().inventory;
    const item = inv.find((i) => i.id === id);
    if (!item) return false;
    Object.assign(item, updates);
    return true;
  }
  const values: Record<string, unknown> = {};
  if (updates.status !== undefined) values.status = updates.status;
  if (updates.salePrice !== undefined) values.salePrice = updates.salePrice;
  if (updates.saleDate !== undefined) values.saleDate = updates.saleDate;
  if (updates.platform !== undefined) values.platform = updates.platform;
  if (updates.notes !== undefined) values.notes = updates.notes;

  const result = await db.update(schema.inventory).set(values).where(eq(schema.inventory.id, id));
  return (result.rowCount ?? 0) > 0;
}

export async function getInventoryItemById(id: string): Promise<InventoryItem | null> {
  const db = useDb();
  if (!db) {
    return getSeedData().inventory.find((i) => i.id === id) ?? null;
  }
  const rows = await db.select().from(schema.inventory).where(eq(schema.inventory.id, id)).limit(1);
  if (rows.length === 0) return null;
  const r = rows[0];
  return {
    id: r.id,
    modelId: r.modelId,
    purchasePrice: r.purchasePrice,
    purchaseDate: r.purchaseDate,
    condition: r.condition as Condition,
    status: r.status as InventoryStatus,
    salePrice: r.salePrice ?? undefined,
    saleDate: r.saleDate ?? undefined,
    platform: r.platform ?? undefined,
    notes: r.notes ?? undefined,
  };
}

// ============================================================================
// Composite: Deals (listing + model + brand + valuation)
// ============================================================================

export async function getDealsWithDetails(): Promise<DealWithDetails[]> {
  const [brands, models, listings, valuations] = await Promise.all([
    getAllBrands(),
    getAllModels(),
    getAllListings(),
    getAllValuations(),
  ]);

  const deals: DealWithDetails[] = [];

  for (const listing of listings) {
    if (!listing.stillActive) continue;
    const valuation = valuations.find((v) => v.listingId === listing.id);
    if (!valuation || valuation.netProfit <= 0) continue;
    const model = models.find((m) => m.id === listing.modelId);
    if (!model) continue;
    const brand = brands.find((b) => b.id === model.brandId);
    if (!brand) continue;
    deals.push({ listing, model, brand, valuation });
  }

  deals.sort((a, b) => b.valuation.netProfit - a.valuation.netProfit);
  return deals;
}

export async function getDealById(listingId: string): Promise<DealWithDetails | null> {
  const listing = await getListingById(listingId);
  if (!listing) return null;

  const [brands, models, valuations] = await Promise.all([
    getAllBrands(),
    getAllModels(),
    getAllValuations(),
  ]);

  const model = models.find((m) => m.id === listing.modelId);
  if (!model) return null;
  const brand = brands.find((b) => b.id === model.brandId);
  if (!brand) return null;
  const valuation = valuations.find((v) => v.listingId === listing.id) ?? null;

  return { listing, model, brand, valuation: valuation! };
}

// ============================================================================
// DB initialization — seed brands and models into the database
// ============================================================================

export async function ensureSeeded(): Promise<void> {
  const db = useDb();
  if (!db) return;

  const existingBrands = await db.select({ id: schema.brands.id }).from(schema.brands).limit(1);
  if (existingBrands.length > 0) return;

  const seed = getSeedData();

  if (seed.brands.length > 0) {
    await db
      .insert(schema.brands)
      .values(
        seed.brands.map((b) => ({
          id: b.id,
          name: b.name,
          category: b.category,
          logoUrl: b.logoUrl ?? null,
          description: b.description ?? null,
        }))
      )
      .onConflictDoNothing();
  }

  if (seed.models.length > 0) {
    await db
      .insert(schema.models)
      .values(
        seed.models.map((m) => ({
          id: m.id,
          brandId: m.brandId,
          name: m.name,
          referenceNumber: m.referenceNumber ?? null,
          msrp: m.msrp,
          typicalResaleLow: m.typicalResaleLow,
          typicalResaleHigh: m.typicalResaleHigh,
          imageUrl: m.imageUrl ?? null,
        }))
      )
      .onConflictDoNothing();
  }
}
