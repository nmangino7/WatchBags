import {
  pgTable,
  text,
  real,
  boolean,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';

export const brands = pgTable('brands', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  category: text('category').notNull(),
  logoUrl: text('logo_url'),
  description: text('description'),
});

export const models = pgTable(
  'models',
  {
    id: text('id').primaryKey(),
    brandId: text('brand_id')
      .notNull()
      .references(() => brands.id),
    name: text('name').notNull(),
    referenceNumber: text('reference_number'),
    msrp: real('msrp').notNull().default(0),
    typicalResaleLow: real('typical_resale_low').notNull().default(0),
    typicalResaleHigh: real('typical_resale_high').notNull().default(0),
    imageUrl: text('image_url'),
  },
  (table) => [index('models_brand_id_idx').on(table.brandId)]
);

export const listings = pgTable(
  'listings',
  {
    id: text('id').primaryKey(),
    modelId: text('model_id')
      .notNull()
      .references(() => models.id),
    source: text('source').notNull(),
    sourceUrl: text('source_url').notNull(),
    askingPrice: real('asking_price').notNull(),
    condition: text('condition').notNull(),
    seller: text('seller'),
    imageUrl: text('image_url'),
    foundAt: timestamp('found_at').notNull().defaultNow(),
    stillActive: boolean('still_active').notNull().default(true),
  },
  (table) => [index('listings_model_id_idx').on(table.modelId)]
);

export const valuations = pgTable(
  'valuations',
  {
    id: text('id').primaryKey(),
    listingId: text('listing_id')
      .notNull()
      .references(() => listings.id),
    fairMarketValue: real('fair_market_value').notNull(),
    confidence: text('confidence').notNull(),
    reasoning: text('reasoning').notNull(),
    redFlags: text('red_flags').array().notNull().default([]),
    marketOutlook: text('market_outlook').notNull(),
    estimatedProfit: real('estimated_profit').notNull(),
    estimatedFees: real('estimated_fees').notNull(),
    netProfit: real('net_profit').notNull(),
    roiPercentage: real('roi_percentage').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [index('valuations_listing_id_idx').on(table.listingId)]
);

export const priceHistory = pgTable(
  'price_history',
  {
    id: text('id').primaryKey(),
    modelId: text('model_id')
      .notNull()
      .references(() => models.id),
    source: text('source').notNull(),
    price: real('price').notNull(),
    recordedAt: timestamp('recorded_at').notNull().defaultNow(),
  },
  (table) => [index('price_history_model_id_idx').on(table.modelId)]
);

export const watchlist = pgTable(
  'watchlist',
  {
    id: text('id').primaryKey(),
    listingId: text('listing_id')
      .notNull()
      .references(() => listings.id),
    targetPrice: real('target_price'),
    alertEnabled: boolean('alert_enabled').notNull().default(true),
    addedAt: timestamp('added_at').notNull().defaultNow(),
  },
  (table) => [index('watchlist_listing_id_idx').on(table.listingId)]
);

export const inventory = pgTable(
  'inventory',
  {
    id: text('id').primaryKey(),
    modelId: text('model_id')
      .notNull()
      .references(() => models.id),
    purchasePrice: real('purchase_price').notNull(),
    purchaseDate: timestamp('purchase_date').notNull().defaultNow(),
    condition: text('condition').notNull(),
    status: text('status').notNull().default('in_hand'),
    salePrice: real('sale_price'),
    saleDate: timestamp('sale_date'),
    platform: text('platform'),
    notes: text('notes'),
  },
  (table) => [index('inventory_model_id_idx').on(table.modelId)]
);
