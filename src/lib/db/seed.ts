import type {
  Brand,
  Model,
  Listing,
  Valuation,
  PriceHistoryPoint,
  WatchlistItem,
  InventoryItem,
} from "@/types";

// ============================================================================
// BRANDS
// ============================================================================

const brands: Brand[] = [
  // Watches
  { id: "b-rolex", name: "Rolex", category: "watch", description: "Swiss luxury watchmaker" },
  { id: "b-patek", name: "Patek Philippe", category: "watch", description: "Swiss luxury watch manufacturer" },
  { id: "b-ap", name: "Audemars Piguet", category: "watch", description: "Swiss high-end watchmaker" },
  { id: "b-rm", name: "Richard Mille", category: "watch", description: "Swiss luxury watchmaker" },
  { id: "b-omega", name: "Omega", category: "watch", description: "Swiss luxury watchmaker" },
  { id: "b-tudor", name: "Tudor", category: "watch", description: "Swiss watchmaker by Rolex" },
  { id: "b-cartier", name: "Cartier", category: "watch", description: "French luxury goods" },
  { id: "b-iwc", name: "IWC", category: "watch", description: "Swiss luxury watchmaker" },
  { id: "b-breitling", name: "Breitling", category: "watch", description: "Swiss luxury watchmaker" },
  { id: "b-seiko", name: "Seiko", category: "watch", description: "Japanese watchmaker" },
  { id: "b-gs", name: "Grand Seiko", category: "watch", description: "Japanese luxury watchmaker" },
  { id: "b-tag", name: "TAG Heuer", category: "watch", description: "Swiss luxury watchmaker" },
  { id: "b-longines", name: "Longines", category: "watch", description: "Swiss watchmaker" },
  // Handbags
  { id: "b-hermes", name: "Hermes", category: "handbag", description: "French luxury fashion house" },
  { id: "b-chanel", name: "Chanel", category: "handbag", description: "French luxury fashion house" },
  { id: "b-lv", name: "Louis Vuitton", category: "handbag", description: "French luxury fashion house" },
  { id: "b-dior", name: "Dior", category: "handbag", description: "French luxury fashion house" },
  { id: "b-gucci", name: "Gucci", category: "handbag", description: "Italian luxury fashion house" },
  { id: "b-prada", name: "Prada", category: "handbag", description: "Italian luxury fashion house" },
  { id: "b-bv", name: "Bottega Veneta", category: "handbag", description: "Italian luxury fashion house" },
  { id: "b-ysl", name: "Saint Laurent", category: "handbag", description: "French luxury fashion house" },
  { id: "b-balenciaga", name: "Balenciaga", category: "handbag", description: "Spanish luxury fashion house" },
  { id: "b-celine", name: "Celine", category: "handbag", description: "French luxury fashion house" },
  { id: "b-fendi", name: "Fendi", category: "handbag", description: "Italian luxury fashion house" },
  { id: "b-goyard", name: "Goyard", category: "handbag", description: "French luxury trunk and leather goods" },
];

// ============================================================================
// MODELS
// ============================================================================

const models: Model[] = [
  // Rolex
  { id: "m-sub", brandId: "b-rolex", name: "Submariner Date", referenceNumber: "126610LN", msrp: 10250, typicalResaleLow: 12000, typicalResaleHigh: 15000 },
  { id: "m-daytona", brandId: "b-rolex", name: "Cosmograph Daytona", referenceNumber: "116500LN", msrp: 15200, typicalResaleLow: 28000, typicalResaleHigh: 35000 },
  { id: "m-gmt", brandId: "b-rolex", name: "GMT-Master II Pepsi", referenceNumber: "126710BLRO", msrp: 11350, typicalResaleLow: 17000, typicalResaleHigh: 21000 },
  { id: "m-datejust", brandId: "b-rolex", name: "Datejust 41", referenceNumber: "126334", msrp: 10800, typicalResaleLow: 10000, typicalResaleHigh: 13000 },
  { id: "m-explorer", brandId: "b-rolex", name: "Explorer II", referenceNumber: "226570", msrp: 9550, typicalResaleLow: 10500, typicalResaleHigh: 12500 },
  // Patek Philippe
  { id: "m-nautilus", brandId: "b-patek", name: "Nautilus", referenceNumber: "5711/1A", msrp: 35000, typicalResaleLow: 120000, typicalResaleHigh: 150000 },
  { id: "m-aquanaut", brandId: "b-patek", name: "Aquanaut", referenceNumber: "5167A", msrp: 22000, typicalResaleLow: 45000, typicalResaleHigh: 55000 },
  { id: "m-calatrava", brandId: "b-patek", name: "Calatrava", referenceNumber: "5227G", msrp: 38000, typicalResaleLow: 30000, typicalResaleHigh: 38000 },
  // Audemars Piguet
  { id: "m-ro", brandId: "b-ap", name: "Royal Oak", referenceNumber: "15500ST", msrp: 23200, typicalResaleLow: 42000, typicalResaleHigh: 52000 },
  { id: "m-roc", brandId: "b-ap", name: "Royal Oak Chronograph", referenceNumber: "26331ST", msrp: 33800, typicalResaleLow: 45000, typicalResaleHigh: 58000 },
  { id: "m-roo", brandId: "b-ap", name: "Royal Oak Offshore", referenceNumber: "26470ST", msrp: 32000, typicalResaleLow: 28000, typicalResaleHigh: 38000 },
  // Richard Mille
  { id: "m-rm011", brandId: "b-rm", name: "RM 011", referenceNumber: "RM011", msrp: 180000, typicalResaleLow: 160000, typicalResaleHigh: 220000 },
  { id: "m-rm035", brandId: "b-rm", name: "RM 035", referenceNumber: "RM035", msrp: 120000, typicalResaleLow: 100000, typicalResaleHigh: 140000 },
  // Omega
  { id: "m-speedy", brandId: "b-omega", name: "Speedmaster Professional", referenceNumber: "310.30.42.50.01.001", msrp: 6550, typicalResaleLow: 5500, typicalResaleHigh: 7000 },
  { id: "m-seamaster", brandId: "b-omega", name: "Seamaster 300M", referenceNumber: "210.30.42.20.01.001", msrp: 5700, typicalResaleLow: 4500, typicalResaleHigh: 5500 },
  { id: "m-aquaterra", brandId: "b-omega", name: "Aqua Terra 150M", referenceNumber: "220.10.41.21.01.001", msrp: 5750, typicalResaleLow: 4200, typicalResaleHigh: 5200 },
  // Tudor
  { id: "m-bb58", brandId: "b-tudor", name: "Black Bay 58", referenceNumber: "79030N", msrp: 3975, typicalResaleLow: 3500, typicalResaleHigh: 4500 },
  { id: "m-pelagos", brandId: "b-tudor", name: "Pelagos 39", referenceNumber: "25407N", msrp: 4575, typicalResaleLow: 4000, typicalResaleHigh: 4800 },
  // Cartier
  { id: "m-santos", brandId: "b-cartier", name: "Santos de Cartier", referenceNumber: "WSSA0018", msrp: 7650, typicalResaleLow: 6500, typicalResaleHigh: 8000 },
  { id: "m-tank", brandId: "b-cartier", name: "Tank Francaise", referenceNumber: "WSTA0065", msrp: 4000, typicalResaleLow: 3200, typicalResaleHigh: 4200 },
  // IWC
  { id: "m-pilot", brandId: "b-iwc", name: "Big Pilot", referenceNumber: "IW329301", msrp: 14200, typicalResaleLow: 10000, typicalResaleHigh: 13000 },
  { id: "m-portugieser", brandId: "b-iwc", name: "Portugieser Chronograph", referenceNumber: "IW371605", msrp: 9200, typicalResaleLow: 7000, typicalResaleHigh: 8500 },
  // Breitling
  { id: "m-navitimer", brandId: "b-breitling", name: "Navitimer B01", referenceNumber: "AB0127", msrp: 9100, typicalResaleLow: 6500, typicalResaleHigh: 8000 },
  { id: "m-superocean", brandId: "b-breitling", name: "Superocean Heritage", referenceNumber: "AB2030", msrp: 5650, typicalResaleLow: 3800, typicalResaleHigh: 5000 },
  // Seiko
  { id: "m-skx", brandId: "b-seiko", name: "Prospex SPB143", referenceNumber: "SPB143J1", msrp: 1200, typicalResaleLow: 900, typicalResaleHigh: 1200 },
  // Grand Seiko
  { id: "m-snowflake", brandId: "b-gs", name: "Snowflake", referenceNumber: "SBGA211", msrp: 5800, typicalResaleLow: 4500, typicalResaleHigh: 5800 },
  { id: "m-gsspring", brandId: "b-gs", name: "Spring Drive GMT", referenceNumber: "SBGE253", msrp: 6300, typicalResaleLow: 4800, typicalResaleHigh: 6000 },
  // TAG Heuer
  { id: "m-carrera", brandId: "b-tag", name: "Carrera Chronograph", referenceNumber: "CBS2210", msrp: 5950, typicalResaleLow: 3500, typicalResaleHigh: 5000 },
  { id: "m-monaco", brandId: "b-tag", name: "Monaco", referenceNumber: "CBL2111", msrp: 6550, typicalResaleLow: 4500, typicalResaleHigh: 6000 },
  // Longines
  { id: "m-conquest", brandId: "b-longines", name: "HydroConquest", referenceNumber: "L3.781.4.56.6", msrp: 1375, typicalResaleLow: 900, typicalResaleHigh: 1200 },
  // Hermes
  { id: "m-birkin25", brandId: "b-hermes", name: "Birkin 25", msrp: 10600, typicalResaleLow: 15000, typicalResaleHigh: 25000 },
  { id: "m-birkin30", brandId: "b-hermes", name: "Birkin 30", msrp: 11400, typicalResaleLow: 13000, typicalResaleHigh: 20000 },
  { id: "m-kelly28", brandId: "b-hermes", name: "Kelly 28", msrp: 10400, typicalResaleLow: 14000, typicalResaleHigh: 22000 },
  { id: "m-constance24", brandId: "b-hermes", name: "Constance 24", msrp: 12000, typicalResaleLow: 15000, typicalResaleHigh: 28000 },
  // Chanel
  { id: "m-cf-med", brandId: "b-chanel", name: "Classic Flap Medium", msrp: 10800, typicalResaleLow: 7000, typicalResaleHigh: 9500 },
  { id: "m-cf-jumbo", brandId: "b-chanel", name: "Classic Flap Jumbo", msrp: 11900, typicalResaleLow: 7500, typicalResaleHigh: 10000 },
  { id: "m-boy", brandId: "b-chanel", name: "Boy Bag Medium", msrp: 8200, typicalResaleLow: 4500, typicalResaleHigh: 6500 },
  { id: "m-255", brandId: "b-chanel", name: "2.55 Reissue 226", msrp: 9350, typicalResaleLow: 5500, typicalResaleHigh: 8000 },
  // Louis Vuitton
  { id: "m-neverfull", brandId: "b-lv", name: "Neverfull MM Monogram", msrp: 2030, typicalResaleLow: 1400, typicalResaleHigh: 1900 },
  { id: "m-speedy25", brandId: "b-lv", name: "Speedy Bandouliere 25", msrp: 1800, typicalResaleLow: 1200, typicalResaleHigh: 1600 },
  { id: "m-alma", brandId: "b-lv", name: "Alma BB Epi", msrp: 1960, typicalResaleLow: 1300, typicalResaleHigh: 1700 },
  // Dior
  { id: "m-ladydior", brandId: "b-dior", name: "Lady Dior Medium", msrp: 6500, typicalResaleLow: 4000, typicalResaleHigh: 5800 },
  { id: "m-saddle", brandId: "b-dior", name: "Saddle Bag", msrp: 4100, typicalResaleLow: 2500, typicalResaleHigh: 3600 },
  { id: "m-booktote", brandId: "b-dior", name: "Book Tote Medium", msrp: 3500, typicalResaleLow: 2200, typicalResaleHigh: 3200 },
  // Gucci
  { id: "m-dionysus", brandId: "b-gucci", name: "Dionysus Small", msrp: 2980, typicalResaleLow: 1500, typicalResaleHigh: 2200 },
  { id: "m-jackie", brandId: "b-gucci", name: "Jackie 1961 Small", msrp: 2600, typicalResaleLow: 1400, typicalResaleHigh: 2000 },
  // Prada
  { id: "m-galleria", brandId: "b-prada", name: "Galleria Saffiano", msrp: 3300, typicalResaleLow: 1800, typicalResaleHigh: 2600 },
  { id: "m-re-edition", brandId: "b-prada", name: "Re-Edition 2005", msrp: 1850, typicalResaleLow: 1200, typicalResaleHigh: 1700 },
  // Bottega Veneta
  { id: "m-jodie", brandId: "b-bv", name: "Jodie Mini", msrp: 3200, typicalResaleLow: 1800, typicalResaleHigh: 2600 },
  { id: "m-cassette", brandId: "b-bv", name: "Cassette Bag", msrp: 3400, typicalResaleLow: 2000, typicalResaleHigh: 2800 },
  // Saint Laurent
  { id: "m-loulou", brandId: "b-ysl", name: "Loulou Medium", msrp: 2850, typicalResaleLow: 1500, typicalResaleHigh: 2200 },
  { id: "m-sunset", brandId: "b-ysl", name: "Sunset Medium", msrp: 2650, typicalResaleLow: 1400, typicalResaleHigh: 2100 },
  // Balenciaga
  { id: "m-city", brandId: "b-balenciaga", name: "City Bag Medium", msrp: 2190, typicalResaleLow: 800, typicalResaleHigh: 1500 },
  { id: "m-hourglass", brandId: "b-balenciaga", name: "Hourglass Small", msrp: 2590, typicalResaleLow: 1200, typicalResaleHigh: 1900 },
  // Celine
  { id: "m-luggage", brandId: "b-celine", name: "Luggage Nano", msrp: 3050, typicalResaleLow: 1800, typicalResaleHigh: 2500 },
  { id: "m-belt", brandId: "b-celine", name: "Belt Bag Mini", msrp: 2600, typicalResaleLow: 1400, typicalResaleHigh: 2100 },
  // Fendi
  { id: "m-baguette", brandId: "b-fendi", name: "Baguette", msrp: 3390, typicalResaleLow: 1800, typicalResaleHigh: 2800 },
  { id: "m-peekaboo", brandId: "b-fendi", name: "Peekaboo ISeeU Medium", msrp: 5200, typicalResaleLow: 2800, typicalResaleHigh: 4200 },
  // Goyard
  { id: "m-stjlouis", brandId: "b-goyard", name: "Saint Louis PM", msrp: 1620, typicalResaleLow: 1400, typicalResaleHigh: 2000 },
  { id: "m-artois", brandId: "b-goyard", name: "Artois MM", msrp: 2340, typicalResaleLow: 1800, typicalResaleHigh: 2400 },
];

// ============================================================================
// SAMPLE LISTINGS
// ============================================================================

const listings: Listing[] = [
  // Watches
  { id: "l-1", modelId: "m-daytona", source: "eBay", sourceUrl: "https://ebay.com/itm/example1", askingPrice: 24500, condition: "excellent", seller: "luxwatch_dealer", foundAt: new Date("2026-03-10"), stillActive: true },
  { id: "l-2", modelId: "m-sub", source: "Chrono24", sourceUrl: "https://chrono24.com/rolex/example2", askingPrice: 10200, condition: "good", seller: "WatchTrader_EU", foundAt: new Date("2026-03-12"), stillActive: true },
  { id: "l-3", modelId: "m-gmt", source: "eBay", sourceUrl: "https://ebay.com/itm/example3", askingPrice: 14500, condition: "excellent", seller: "premium_time", foundAt: new Date("2026-03-08"), stillActive: true },
  { id: "l-4", modelId: "m-ro", source: "Chrono24", sourceUrl: "https://chrono24.com/ap/example4", askingPrice: 36000, condition: "mint", seller: "APcollector", foundAt: new Date("2026-03-11"), stillActive: true },
  { id: "l-5", modelId: "m-nautilus", source: "eBay", sourceUrl: "https://ebay.com/itm/example5", askingPrice: 105000, condition: "excellent", seller: "rare_pieces", foundAt: new Date("2026-03-09"), stillActive: true },
  { id: "l-6", modelId: "m-speedy", source: "eBay", sourceUrl: "https://ebay.com/itm/example6", askingPrice: 4200, condition: "good", seller: "speedyfan99", foundAt: new Date("2026-03-13"), stillActive: true },
  { id: "l-7", modelId: "m-bb58", source: "Chrono24", sourceUrl: "https://chrono24.com/tudor/example7", askingPrice: 2900, condition: "excellent", seller: "tudor_watches", foundAt: new Date("2026-03-14"), stillActive: true },
  { id: "l-8", modelId: "m-santos", source: "eBay", sourceUrl: "https://ebay.com/itm/example8", askingPrice: 5500, condition: "mint", seller: "cartier_lover", foundAt: new Date("2026-03-12"), stillActive: true },
  { id: "l-9", modelId: "m-snowflake", source: "Chrono24", sourceUrl: "https://chrono24.com/grandseiko/example9", askingPrice: 3800, condition: "excellent", seller: "jdm_watches", foundAt: new Date("2026-03-10"), stillActive: true },
  { id: "l-10", modelId: "m-navitimer", source: "eBay", sourceUrl: "https://ebay.com/itm/example10", askingPrice: 5200, condition: "good", seller: "breitling_store", foundAt: new Date("2026-03-11"), stillActive: true },
  { id: "l-11", modelId: "m-aquanaut", source: "Chrono24", sourceUrl: "https://chrono24.com/patek/example11", askingPrice: 38000, condition: "excellent", seller: "patek_pro", foundAt: new Date("2026-03-13"), stillActive: true },
  { id: "l-12", modelId: "m-roo", source: "eBay", sourceUrl: "https://ebay.com/itm/example12", askingPrice: 24000, condition: "good", seller: "ap_market", foundAt: new Date("2026-03-14"), stillActive: true },
  { id: "l-13", modelId: "m-pilot", source: "Chrono24", sourceUrl: "https://chrono24.com/iwc/example13", askingPrice: 8500, condition: "excellent", seller: "iwc_hub", foundAt: new Date("2026-03-12"), stillActive: true },
  { id: "l-14", modelId: "m-explorer", source: "eBay", sourceUrl: "https://ebay.com/itm/example14", askingPrice: 9200, condition: "mint", seller: "rolex_vault", foundAt: new Date("2026-03-15"), stillActive: true },
  // Handbags
  { id: "l-15", modelId: "m-birkin25", source: "Vestiaire Collective", sourceUrl: "https://vestiairecollective.com/example15", askingPrice: 12500, condition: "excellent", seller: "luxbags_paris", foundAt: new Date("2026-03-10"), stillActive: true },
  { id: "l-16", modelId: "m-kelly28", source: "eBay", sourceUrl: "https://ebay.com/itm/example16", askingPrice: 11000, condition: "good", seller: "hermes_resale", foundAt: new Date("2026-03-12"), stillActive: true },
  { id: "l-17", modelId: "m-constance24", source: "Vestiaire Collective", sourceUrl: "https://vestiairecollective.com/example17", askingPrice: 13000, condition: "mint", seller: "authenticated_lux", foundAt: new Date("2026-03-11"), stillActive: true },
  { id: "l-18", modelId: "m-cf-med", source: "StockX", sourceUrl: "https://stockx.com/example18", askingPrice: 5800, condition: "good", seller: "stockx_verified", foundAt: new Date("2026-03-13"), stillActive: true },
  { id: "l-19", modelId: "m-ladydior", source: "Vestiaire Collective", sourceUrl: "https://vestiairecollective.com/example19", askingPrice: 3200, condition: "excellent", seller: "dior_collector", foundAt: new Date("2026-03-09"), stillActive: true },
  { id: "l-20", modelId: "m-baguette", source: "eBay", sourceUrl: "https://ebay.com/itm/example20", askingPrice: 1400, condition: "good", seller: "vintage_bags", foundAt: new Date("2026-03-14"), stillActive: true },
  { id: "l-21", modelId: "m-neverfull", source: "StockX", sourceUrl: "https://stockx.com/example21", askingPrice: 1100, condition: "excellent", seller: "stockx_verified", foundAt: new Date("2026-03-13"), stillActive: true },
  { id: "l-22", modelId: "m-stjlouis", source: "eBay", sourceUrl: "https://ebay.com/itm/example22", askingPrice: 1100, condition: "mint", seller: "goyard_deals", foundAt: new Date("2026-03-12"), stillActive: true },
  { id: "l-23", modelId: "m-luggage", source: "Vestiaire Collective", sourceUrl: "https://vestiairecollective.com/example23", askingPrice: 1500, condition: "excellent", seller: "celine_fan", foundAt: new Date("2026-03-10"), stillActive: true },
  { id: "l-24", modelId: "m-loulou", source: "StockX", sourceUrl: "https://stockx.com/example24", askingPrice: 1200, condition: "good", seller: "stockx_verified", foundAt: new Date("2026-03-14"), stillActive: true },
  { id: "l-25", modelId: "m-peekaboo", source: "Vestiaire Collective", sourceUrl: "https://vestiairecollective.com/example25", askingPrice: 2200, condition: "excellent", seller: "fendi_lovers", foundAt: new Date("2026-03-11"), stillActive: true },
  { id: "l-26", modelId: "m-galleria", source: "eBay", sourceUrl: "https://ebay.com/itm/example26", askingPrice: 1500, condition: "mint", seller: "prada_boutique", foundAt: new Date("2026-03-13"), stillActive: true },
  { id: "l-27", modelId: "m-birkin30", source: "Vestiaire Collective", sourceUrl: "https://vestiairecollective.com/example27", askingPrice: 10500, condition: "good", seller: "birkin_market", foundAt: new Date("2026-03-15"), stillActive: true },
  { id: "l-28", modelId: "m-hourglass", source: "StockX", sourceUrl: "https://stockx.com/example28", askingPrice: 950, condition: "excellent", seller: "stockx_verified", foundAt: new Date("2026-03-14"), stillActive: true },
  { id: "l-29", modelId: "m-jodie", source: "eBay", sourceUrl: "https://ebay.com/itm/example29", askingPrice: 1400, condition: "mint", seller: "bv_collection", foundAt: new Date("2026-03-12"), stillActive: true },
  { id: "l-30", modelId: "m-datejust", source: "Chrono24", sourceUrl: "https://chrono24.com/rolex/example30", askingPrice: 8500, condition: "good", seller: "datejust_world", foundAt: new Date("2026-03-15"), stillActive: true },
];

// ============================================================================
// VALUATIONS
// ============================================================================

function makeValuation(listing: Listing, model: Model): Valuation {
  const fmv = Math.round((model.typicalResaleLow + model.typicalResaleHigh) / 2);
  const gross = fmv - listing.askingPrice;
  const fees = Math.round(fmv * 0.13);
  const net = gross - fees;
  const roi = listing.askingPrice > 0 ? Math.round((net / listing.askingPrice) * 1000) / 10 : 0;
  const discount = ((1 - listing.askingPrice / fmv) * 100).toFixed(1);

  return {
    id: `v-${listing.id}`,
    listingId: listing.id,
    fairMarketValue: fmv,
    confidence: net > fmv * 0.1 ? "high" : net > 0 ? "medium" : "low",
    reasoning: `Based on 15+ comparable sales across eBay, Chrono24, StockX, and Vestiaire Collective, the fair market value for a ${model.name} in ${listing.condition} condition is approximately $${fmv.toLocaleString()}. The current asking price of $${listing.askingPrice.toLocaleString()} represents a ${discount}% discount to market value. Recent completed sales range from $${model.typicalResaleLow.toLocaleString()} to $${model.typicalResaleHigh.toLocaleString()}.`,
    redFlags: listing.askingPrice < fmv * 0.6
      ? ["Price significantly below market — verify authenticity", "Request detailed photos and documentation"]
      : [],
    marketOutlook: `The ${model.name} market shows consistent demand. ${listing.condition === "mint" ? "Mint condition examples command a 10-15% premium." : "This condition grade is the most commonly traded segment."}`,
    estimatedProfit: gross,
    estimatedFees: fees,
    netProfit: net,
    roiPercentage: roi,
    createdAt: new Date(),
  };
}

const valuations: Valuation[] = listings.map((listing) => {
  const model = models.find((m) => m.id === listing.modelId)!;
  return makeValuation(listing, model);
});

// ============================================================================
// PRICE HISTORY
// ============================================================================

function generatePriceHistory(modelId: string, basePrice: number): PriceHistoryPoint[] {
  const points: PriceHistoryPoint[] = [];
  const sources = ["eBay", "Chrono24", "StockX", "Vestiaire Collective"];
  const now = new Date("2026-03-15");

  for (let m = 6; m >= 0; m--) {
    for (let w = 0; w < 4; w++) {
      const date = new Date(now);
      date.setMonth(date.getMonth() - m);
      date.setDate(date.getDate() - w * 7);
      const trend = 1 + (6 - m) * 0.008;
      const noise = 0.95 + Math.random() * 0.1;
      points.push({
        id: `ph-${modelId}-${m}-${w}`,
        modelId,
        source: sources[Math.floor(Math.random() * sources.length)],
        price: Math.round(basePrice * trend * noise),
        recordedAt: date,
      });
    }
  }
  return points;
}

const priceHistory: PriceHistoryPoint[] = [
  ...generatePriceHistory("m-daytona", 30000),
  ...generatePriceHistory("m-sub", 13000),
  ...generatePriceHistory("m-gmt", 18500),
  ...generatePriceHistory("m-ro", 47000),
  ...generatePriceHistory("m-nautilus", 130000),
  ...generatePriceHistory("m-speedy", 6000),
  ...generatePriceHistory("m-bb58", 3800),
  ...generatePriceHistory("m-birkin25", 19000),
  ...generatePriceHistory("m-kelly28", 17000),
  ...generatePriceHistory("m-cf-med", 8000),
  ...generatePriceHistory("m-ladydior", 4800),
  ...generatePriceHistory("m-neverfull", 1600),
  ...generatePriceHistory("m-aquanaut", 48000),
  ...generatePriceHistory("m-constance24", 20000),
  ...generatePriceHistory("m-santos", 7000),
  ...generatePriceHistory("m-baguette", 2200),
];

// ============================================================================
// WATCHLIST & INVENTORY
// ============================================================================

const watchlistItems: WatchlistItem[] = [
  { id: "wl-1", listingId: "l-1", targetPrice: 23000, alertEnabled: true, addedAt: new Date("2026-03-10") },
  { id: "wl-2", listingId: "l-15", targetPrice: 11000, alertEnabled: true, addedAt: new Date("2026-03-11") },
  { id: "wl-3", listingId: "l-4", alertEnabled: false, addedAt: new Date("2026-03-12") },
  { id: "wl-4", listingId: "l-17", targetPrice: 12000, alertEnabled: true, addedAt: new Date("2026-03-13") },
];

const inventoryItems: InventoryItem[] = [
  { id: "inv-1", modelId: "m-speedy", purchasePrice: 4800, purchaseDate: new Date("2026-01-15"), condition: "excellent", status: "sold", salePrice: 6200, saleDate: new Date("2026-02-20"), platform: "eBay", notes: "Quick flip" },
  { id: "inv-2", modelId: "m-bb58", purchasePrice: 3100, purchaseDate: new Date("2026-02-01"), condition: "good", status: "sold", salePrice: 3900, saleDate: new Date("2026-02-28"), platform: "Chrono24" },
  { id: "inv-3", modelId: "m-neverfull", purchasePrice: 1200, purchaseDate: new Date("2026-02-10"), condition: "excellent", status: "sold", salePrice: 1750, saleDate: new Date("2026-03-05"), platform: "StockX" },
  { id: "inv-4", modelId: "m-cf-med", purchasePrice: 6200, purchaseDate: new Date("2026-03-01"), condition: "good", status: "listed", platform: "Vestiaire Collective", notes: "Listed at $8,500" },
  { id: "inv-5", modelId: "m-datejust", purchasePrice: 9000, purchaseDate: new Date("2026-03-05"), condition: "excellent", status: "in_hand", notes: "Awaiting service" },
  { id: "inv-6", modelId: "m-baguette", purchasePrice: 1600, purchaseDate: new Date("2026-03-10"), condition: "mint", status: "listed", platform: "eBay" },
  { id: "inv-7", modelId: "m-ladydior", purchasePrice: 3500, purchaseDate: new Date("2026-01-20"), condition: "excellent", status: "sold", salePrice: 5200, saleDate: new Date("2026-02-15"), platform: "Vestiaire Collective" },
  { id: "inv-8", modelId: "m-santos", purchasePrice: 5800, purchaseDate: new Date("2026-03-08"), condition: "mint", status: "in_hand", notes: "Full set with papers" },
];

// ============================================================================
// EXPORT
// ============================================================================

export function getSeedData() {
  return {
    brands,
    models,
    listings,
    valuations,
    priceHistory,
    watchlistItems,
    inventoryItems,
  };
}
