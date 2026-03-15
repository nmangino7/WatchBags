"use client";

import { useState } from "react";
import { getSeedData } from "@/lib/db/seed";
import { formatCurrency } from "@/lib/utils";
import {
  Link2,
  PenLine,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Tab = "url" | "manual";

interface ExtractedData {
  brand: string;
  model: string;
  referenceNumber?: string;
  askingPrice: number;
  condition: string;
  seller?: string;
  source: string;
  category: string;
  title: string;
  description?: string;
}

interface SaveResult {
  listing: { id: string };
  analysis: {
    fairMarketValue: number;
    profitEstimate: { net: number; roi: string };
    confidence: string;
  };
}

export default function AddDealPage() {
  const [activeTab, setActiveTab] = useState<Tab>("url");

  // URL tab state
  const [url, setUrl] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [extractError, setExtractError] = useState("");
  const [extracted, setExtracted] = useState<ExtractedData | null>(null);

  // Manual tab state
  const [manualBrand, setManualBrand] = useState("");
  const [manualModel, setManualModel] = useState("");
  const [manualRef, setManualRef] = useState("");
  const [manualPrice, setManualPrice] = useState("");
  const [manualCondition, setManualCondition] = useState("excellent");
  const [manualCategory, setManualCategory] = useState("watch");
  const [manualSource, setManualSource] = useState("");
  const [manualSourceUrl, setManualSourceUrl] = useState("");

  // Save state
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveResult, setSaveResult] = useState<SaveResult | null>(null);

  const { brands } = getSeedData();

  const handleExtract = async () => {
    if (!url.trim()) return;
    setExtracting(true);
    setExtractError("");
    setExtracted(null);
    setSaveResult(null);

    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        setExtractError(data.error || "Failed to extract listing");
        if (data.partial) {
          setExtracted(data.partial);
        }
        return;
      }

      setExtracted(data.extracted);
    } catch {
      setExtractError("Network error. Please try again.");
    } finally {
      setExtracting(false);
    }
  };

  const handleSave = async (listing: {
    brand: string;
    model: string;
    referenceNumber?: string;
    askingPrice: number;
    condition: string;
    seller?: string;
    source?: string;
    sourceUrl?: string;
    category?: string;
  }) => {
    setSaving(true);
    setSaveError("");
    setSaveResult(null);

    try {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(listing),
      });

      const data = await res.json();
      if (!res.ok) {
        setSaveError(data.error || "Failed to save listing");
        return;
      }

      setSaveResult(data);
    } catch {
      setSaveError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveExtracted = () => {
    if (!extracted) return;
    handleSave({
      brand: extracted.brand,
      model: extracted.model,
      referenceNumber: extracted.referenceNumber,
      askingPrice: extracted.askingPrice,
      condition: extracted.condition,
      seller: extracted.seller,
      source: extracted.source,
      sourceUrl: url,
      category: extracted.category,
    });
  };

  const handleSaveManual = () => {
    const price = parseFloat(manualPrice);
    if (!manualBrand || !manualModel || isNaN(price) || price <= 0) return;
    handleSave({
      brand: manualBrand,
      model: manualModel,
      referenceNumber: manualRef || undefined,
      askingPrice: price,
      condition: manualCondition,
      source: manualSource || "Manual",
      sourceUrl: manualSourceUrl || undefined,
      category: manualCategory,
    });
  };

  // Success state
  if (saveResult) {
    const profit = saveResult.analysis.profitEstimate.net;
    const isProfitable = profit > 0;

    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
            <CheckCircle2 className="h-8 w-8 text-emerald-400" />
          </div>
        </div>
        <h1 className="text-2xl font-bold">Deal Added!</h1>
        <p className="mt-2 text-muted-foreground">
          Claude analyzed this listing and estimated a{" "}
          <span
            className={
              isProfitable ? "font-semibold text-profit-green" : "font-semibold text-loss-red"
            }
          >
            {formatCurrency(profit)} {isProfitable ? "profit" : "loss"}
          </span>{" "}
          ({saveResult.analysis.profitEstimate.roi} ROI) with{" "}
          <span className="font-medium text-foreground">
            {saveResult.analysis.confidence}
          </span>{" "}
          confidence.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href={`/deals/${saveResult.listing.id}`}
            className="inline-flex items-center gap-2 rounded-lg bg-gold px-4 py-2.5 text-sm font-medium text-black hover:bg-gold-light transition-colors"
          >
            View Deal <ArrowRight className="h-4 w-4" />
          </Link>
          <button
            onClick={() => {
              setSaveResult(null);
              setExtracted(null);
              setUrl("");
              setManualBrand("");
              setManualModel("");
              setManualRef("");
              setManualPrice("");
              setManualSource("");
              setManualSourceUrl("");
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            Add Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Add a Deal</h1>
        <p className="mt-1 text-muted-foreground">
          Paste a listing URL from any marketplace or enter details manually.
          Claude AI will analyze the deal for you.
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex rounded-xl border border-border bg-card p-1">
        <button
          onClick={() => setActiveTab("url")}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
            activeTab === "url"
              ? "bg-gold text-black"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Link2 className="h-4 w-4" /> Paste URL
        </button>
        <button
          onClick={() => setActiveTab("manual")}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
            activeTab === "manual"
              ? "bg-gold text-black"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <PenLine className="h-4 w-4" /> Manual Entry
        </button>
      </div>

      {/* URL Tab */}
      {activeTab === "url" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-5">
            <label className="mb-2 block text-sm font-medium text-foreground">
              Listing URL
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.ebay.com/itm/..."
                className="flex-1 rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                onKeyDown={(e) => e.key === "Enter" && handleExtract()}
              />
              <button
                onClick={handleExtract}
                disabled={extracting || !url.trim()}
                className="inline-flex items-center gap-2 rounded-lg bg-gold px-5 py-2.5 text-sm font-medium text-black hover:bg-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {extracting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" /> Analyze
                  </>
                )}
              </button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Works with eBay, Chrono24, StockX, Vestiaire, The RealReal,
              Mercari, Poshmark, and more
            </p>
          </div>

          {extractError && (
            <div className="rounded-xl border border-loss-red/20 bg-loss-red/5 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-loss-red" />
                <div>
                  <p className="text-sm font-medium text-loss-red">
                    Extraction Failed
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {extractError}
                  </p>
                </div>
              </div>
            </div>
          )}

          {extracting && (
            <div className="rounded-xl border border-border bg-card p-8 text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-gold" />
              <p className="mt-3 text-sm text-muted-foreground">
                Claude is reading the listing page and extracting details...
              </p>
            </div>
          )}

          {extracted && !extracting && (
            <div className="rounded-xl border border-border bg-card p-5 space-y-4">
              <h3 className="text-lg font-semibold">Extracted Details</h3>
              <p className="text-xs text-muted-foreground">
                Review the details below. You can edit them before saving.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">
                    Brand
                  </label>
                  <input
                    type="text"
                    value={extracted.brand}
                    onChange={(e) =>
                      setExtracted({ ...extracted, brand: e.target.value })
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-gold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">
                    Model
                  </label>
                  <input
                    type="text"
                    value={extracted.model}
                    onChange={(e) =>
                      setExtracted({ ...extracted, model: e.target.value })
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-gold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">
                    Reference #
                  </label>
                  <input
                    type="text"
                    value={extracted.referenceNumber ?? ""}
                    onChange={(e) =>
                      setExtracted({
                        ...extracted,
                        referenceNumber: e.target.value || undefined,
                      })
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-gold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">
                    Asking Price ($)
                  </label>
                  <input
                    type="number"
                    value={extracted.askingPrice}
                    onChange={(e) =>
                      setExtracted({
                        ...extracted,
                        askingPrice: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-gold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">
                    Condition
                  </label>
                  <select
                    value={extracted.condition}
                    onChange={(e) =>
                      setExtracted({ ...extracted, condition: e.target.value })
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-gold focus:outline-none"
                  >
                    <option value="mint">Mint / Unworn</option>
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">
                    Category
                  </label>
                  <select
                    value={extracted.category}
                    onChange={(e) =>
                      setExtracted({ ...extracted, category: e.target.value })
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-gold focus:outline-none"
                  >
                    <option value="watch">Watch</option>
                    <option value="handbag">Handbag</option>
                  </select>
                </div>
              </div>

              {extracted.description && (
                <p className="text-sm text-muted-foreground italic">
                  {extracted.description}
                </p>
              )}

              {saveError && (
                <div className="rounded-lg border border-loss-red/20 bg-loss-red/5 px-3 py-2">
                  <p className="text-sm text-loss-red">{saveError}</p>
                </div>
              )}

              <button
                onClick={handleSaveExtracted}
                disabled={saving}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-gold px-4 py-3 text-sm font-semibold text-black hover:bg-gold-light transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Saving &
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" /> Save & Get AI Analysis
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Manual Tab */}
      {activeTab === "manual" && (
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Brand *
              </label>
              <input
                type="text"
                value={manualBrand}
                onChange={(e) => setManualBrand(e.target.value)}
                placeholder="e.g. Rolex, Hermès, Chanel"
                list="brand-suggestions"
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
              />
              <datalist id="brand-suggestions">
                {brands.map((b) => (
                  <option key={b.id} value={b.name} />
                ))}
              </datalist>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Model *
              </label>
              <input
                type="text"
                value={manualModel}
                onChange={(e) => setManualModel(e.target.value)}
                placeholder="e.g. Submariner, Birkin 25"
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Reference # (optional)
              </label>
              <input
                type="text"
                value={manualRef}
                onChange={(e) => setManualRef(e.target.value)}
                placeholder="e.g. 126610LN"
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Asking Price ($) *
              </label>
              <input
                type="number"
                value={manualPrice}
                onChange={(e) => setManualPrice(e.target.value)}
                placeholder="12500"
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Condition *
              </label>
              <select
                value={manualCondition}
                onChange={(e) => setManualCondition(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
              >
                <option value="mint">Mint / Unworn</option>
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Category *
              </label>
              <select
                value={manualCategory}
                onChange={(e) => setManualCategory(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
              >
                <option value="watch">Watch</option>
                <option value="handbag">Handbag</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Source (optional)
              </label>
              <input
                type="text"
                value={manualSource}
                onChange={(e) => setManualSource(e.target.value)}
                placeholder="e.g. eBay, Chrono24, local dealer"
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Listing URL (optional)
              </label>
              <input
                type="url"
                value={manualSourceUrl}
                onChange={(e) => setManualSourceUrl(e.target.value)}
                placeholder="https://..."
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
              />
            </div>
          </div>

          {saveError && (
            <div className="rounded-lg border border-loss-red/20 bg-loss-red/5 px-3 py-2">
              <p className="text-sm text-loss-red">{saveError}</p>
            </div>
          )}

          <button
            onClick={handleSaveManual}
            disabled={saving || !manualBrand || !manualModel || !manualPrice}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-gold px-4 py-3 text-sm font-semibold text-black hover:bg-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Saving &
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" /> Save & Get AI Analysis
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
