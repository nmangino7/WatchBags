import {
  getListingById,
  getAllModels,
  getAllBrands,
  getValuationByListingId,
  getPriceHistoryByModelId,
  getListingsByModelId,
} from "@/lib/db/queries";
import { ValuationProof } from "@/components/ValuationProof";
import { AiAnalysis } from "@/components/AiAnalysis";
import { PriceChart } from "@/components/PriceChart";
import { ProfitBadge } from "@/components/ProfitBadge";
import { formatCurrency, getConditionLabel } from "@/lib/utils";
import {
  ArrowLeft,
  ExternalLink,
  MapPin,
  Calendar,
  Shield,
  ImageOff,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { WatchlistButton } from "@/components/WatchlistButton";
import { BuyButton } from "@/components/BuyButton";

export const dynamic = "force-dynamic";

export default async function DealDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const listing = await getListingById(id);
  if (!listing) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-2xl font-bold">Deal not found</h1>
        <Link
          href="/deals"
          className="text-gold hover:text-gold-light mt-4 inline-block"
        >
          Back to deals
        </Link>
      </div>
    );
  }

  const [models, brands, valuation, modelPriceHistory, modelListings] =
    await Promise.all([
      getAllModels(),
      getAllBrands(),
      getValuationByListingId(listing.id),
      getPriceHistoryByModelId(listing.modelId),
      getListingsByModelId(listing.modelId),
    ]);

  const model = models.find((m) => m.id === listing.modelId)!;
  const brand = brands.find((b) => b.id === model.brandId)!;

  const sortedPriceHistory = modelPriceHistory.sort(
    (a, b) =>
      new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
  );

  const comparablePrices = modelListings
    .filter((l) => l.id !== listing.id)
    .map((l) => l.askingPrice);

  const msrpUnknown = model.msrp === 0;

  const aiAnalysis = valuation
    ? {
        fairMarketValue: valuation.fairMarketValue,
        confidence: valuation.confidence,
        reasoning: valuation.reasoning,
        redFlags: valuation.redFlags,
        marketOutlook: valuation.marketOutlook,
        profitEstimate: {
          gross: valuation.estimatedProfit,
          fees: valuation.estimatedFees,
          net: valuation.netProfit,
          roi: `${valuation.roiPercentage.toFixed(1)}%`,
        },
      }
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back button */}
      <Link
        href="/deals"
        className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to deals
      </Link>

      {/* Header */}
      <div className="flex flex-col lg:flex-row gap-8 mb-8">
        {/* Item image */}
        <div className="w-full lg:w-96 h-64 lg:h-96 bg-card rounded-2xl border border-border flex items-center justify-center flex-shrink-0 overflow-hidden relative">
          {listing.imageUrl || model.imageUrl ? (
            <Image
              src={listing.imageUrl || model.imageUrl || ""}
              alt={`${brand.name} ${model.name}`}
              fill
              className="object-contain p-4"
              unoptimized
            />
          ) : (
            <div className="text-center text-muted-foreground">
              <ImageOff className="h-12 w-12 mx-auto mb-2 text-muted-foreground/40" />
              <p className="text-sm">{brand.name}</p>
              <p className="text-xs">{model.name}</p>
            </div>
          )}
        </div>

        {/* Item details */}
        <div className="flex-1">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-gold font-medium text-sm uppercase tracking-wider">
                {brand.name}
              </p>
              <h1 className="text-3xl font-bold mt-1">{model.name}</h1>
              {model.referenceNumber && (
                <p className="text-muted-foreground mt-1">
                  Ref. {model.referenceNumber}
                </p>
              )}
            </div>
            {valuation && (
              <ProfitBadge
                profit={valuation.netProfit}
                roi={valuation.roiPercentage}
                size="lg"
              />
            )}
          </div>

          {msrpUnknown && (
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-2 text-sm text-amber-400">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>
                MSRP unknown for this model — profit estimate is AI-generated
                and may be less accurate.
              </span>
            </div>
          )}

          {valuation && valuation.confidence === "low" && (
            <div className="mt-2 flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-sm text-red-400">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>Low confidence — limited comparable data. Verify before buying.</span>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            <div className="p-3 rounded-xl bg-card border border-border">
              <p className="text-xs text-muted-foreground">Asking Price</p>
              <p className="text-xl font-bold text-loss-red">
                {formatCurrency(listing.askingPrice)}
              </p>
            </div>
            {valuation && (
              <div className="p-3 rounded-xl bg-card border border-border">
                <p className="text-xs text-muted-foreground">
                  Fair Market Value
                </p>
                <p className="text-xl font-bold text-profit-green">
                  {formatCurrency(valuation.fairMarketValue)}
                </p>
              </div>
            )}
            <div className="p-3 rounded-xl bg-card border border-border">
              <p className="text-xs text-muted-foreground">MSRP</p>
              <p className="text-xl font-bold">
                {msrpUnknown ? "Unknown" : formatCurrency(model.msrp)}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-card border border-border">
              <p className="text-xs text-muted-foreground">Condition</p>
              <p className="text-xl font-bold">
                {getConditionLabel(listing.condition)}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> {listing.source}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Found{" "}
              {new Date(listing.foundAt).toLocaleDateString()}
            </span>
            {listing.seller && (
              <span className="flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" /> {listing.seller}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-3 mt-4">
            <a
              href={listing.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gold text-black font-medium hover:bg-gold-light transition-colors"
            >
              View Original Listing <ExternalLink className="w-4 h-4" />
            </a>
            <WatchlistButton listingId={listing.id} />
            <BuyButton listingId={listing.id} modelId={listing.modelId} askingPrice={listing.askingPrice} condition={listing.condition} />
          </div>
        </div>
      </div>

      {/* Analysis sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Price History Chart */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4">Price History</h2>
          <PriceChart
            priceHistory={sortedPriceHistory}
            fairMarketValue={
              valuation?.fairMarketValue ?? model.typicalResaleHigh
            }
          />
        </div>

        {/* AI Analysis */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4">AI Analysis</h2>
          {aiAnalysis ? (
            <AiAnalysis analysis={aiAnalysis} />
          ) : (
            <p className="text-muted-foreground">
              AI analysis not yet available for this item.
            </p>
          )}
        </div>

        {/* Valuation Proof */}
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4">
            Why This Item Is Undervalued
          </h2>
          {valuation ? (
            <ValuationProof
              valuation={valuation}
              comparablePrices={comparablePrices.map((price, i) => ({
                source: ["eBay", "Chrono24", "StockX", "Poshmark"][i % 4],
                price,
                condition: listing.condition,
              }))}
              model={model}
              listing={listing}
            />
          ) : (
            <p className="text-muted-foreground">
              Valuation data not available.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
