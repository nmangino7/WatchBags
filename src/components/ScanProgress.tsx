"use client";

import { useState, useCallback } from "react";
import {
  Loader2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertCircle,
  TrendingUp,
} from "lucide-react";

interface ProgressEvent {
  type: "status" | "progress" | "deal" | "error" | "complete";
  message?: string;
  step?: string;
  detail?: string;
  current?: number;
  total?: number;
  percent?: number;
  brand?: string;
  model?: string;
  price?: number;
  profit?: number;
  source?: string;
  scraped?: number;
  saved?: number;
  analyzed?: number;
  errors?: number;
  errorMessages?: string[];
  fatal?: boolean;
  phase?: string;
  providers?: string[];
}

interface ScanProgressProps {
  variant?: "large" | "small";
  onComplete?: () => void;
}

export function ScanProgress({ variant = "large", onComplete }: ScanProgressProps) {
  const [scanning, setScanning] = useState(false);
  const [events, setEvents] = useState<ProgressEvent[]>([]);
  const [currentStep, setCurrentStep] = useState("");
  const [percent, setPercent] = useState(0);
  const [phase, setPhase] = useState("");
  const [result, setResult] = useState<ProgressEvent | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleScan = useCallback(async () => {
    setScanning(true);
    setEvents([]);
    setCurrentStep("Connecting...");
    setPercent(0);
    setPhase("starting");
    setResult(null);
    setError(null);

    try {
      const response = await fetch("/api/cron/refresh", {
        headers: { Accept: "text/event-stream" },
      });

      if (!response.ok) {
        const text = await response.text();
        let errorMsg: string;
        try {
          const json = JSON.parse(text);
          errorMsg = json.error || `HTTP ${response.status}`;
        } catch {
          errorMsg = `HTTP ${response.status}: ${text.slice(0, 200)}`;
        }
        setError(errorMsg);
        setScanning(false);
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        setError("No response stream available");
        setScanning(false);
        return;
      }

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        let eventType = "";
        for (const line of lines) {
          if (line.startsWith("event: ")) {
            eventType = line.slice(7).trim();
          } else if (line.startsWith("data: ") && eventType) {
            try {
              const data = JSON.parse(line.slice(6));
              const event: ProgressEvent = { type: eventType as ProgressEvent["type"], ...data };

              setEvents((prev) => [...prev.slice(-50), event]);

              if (event.type === "status") {
                setPhase(event.phase || "");
                if (event.message) setCurrentStep(event.message);
              } else if (event.type === "progress") {
                if (event.step) setCurrentStep(event.step);
                if (event.percent !== undefined) setPercent(event.percent);
              } else if (event.type === "error") {
                if (event.fatal) setError(event.message || "Fatal error");
              } else if (event.type === "complete") {
                setResult(event);
                setPercent(100);
                setPhase("complete");
                onComplete?.();
              }
            } catch {
              // skip malformed JSON
            }
            eventType = "";
          }
        }
      }
    } catch (err) {
      setError(
        `Connection failed: ${err instanceof Error ? err.message : "Unknown error"}. Check that the app is deployed and your API keys are set.`
      );
    } finally {
      setScanning(false);
    }
  }, [onComplete]);

  const deals = events.filter((e) => e.type === "deal");
  const errors = events.filter((e) => e.type === "error");

  if (variant === "small") {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={handleScan}
          disabled={scanning}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
        >
          {scanning ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <RefreshCw className="h-3.5 w-3.5" />
          )}
          {scanning ? `Scanning ${percent}%` : "Rescan"}
        </button>
        {scanning && (
          <span className="text-xs text-muted-foreground truncate max-w-[200px]">
            {currentStep}
          </span>
        )}
        {result && !scanning && (
          <span className="text-xs text-muted-foreground">
            {result.saved} deals found
          </span>
        )}
        {error && !scanning && (
          <span className="text-xs text-red-400 truncate max-w-[250px]">
            {error}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Scan Button */}
      {!scanning && !result && (
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={handleScan}
            disabled={scanning}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-gold px-6 py-3 text-sm font-semibold text-black hover:bg-gold-light transition-colors disabled:opacity-50"
          >
            <RefreshCw className="h-4 w-4" /> Scan for Deals Now
          </button>
        </div>
      )}

      {/* Progress Bar & Live Log */}
      {scanning && (
        <div className="mt-4 space-y-4">
          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-gold" />
                {currentStep}
              </span>
              <span className="text-gold font-medium">{percent}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-gold h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${Math.max(percent, phase === "scraping" ? 15 : 5)}%` }}
              />
            </div>
          </div>

          {/* Live log */}
          <div className="rounded-lg border border-border bg-background/50 p-3 max-h-48 overflow-y-auto text-xs font-mono space-y-1">
            {events.map((event, i) => (
              <div key={i} className="flex items-start gap-2">
                {event.type === "progress" && (
                  <>
                    <span className="text-gold shrink-0">{">"}</span>
                    <span className="text-muted-foreground">
                      {event.step}
                      {event.detail && (
                        <span className="text-muted-foreground/60"> — {event.detail}</span>
                      )}
                    </span>
                  </>
                )}
                {event.type === "status" && (
                  <>
                    <span className="text-blue-400 shrink-0">i</span>
                    <span className="text-foreground">{event.message}</span>
                  </>
                )}
                {event.type === "deal" && (
                  <>
                    <TrendingUp className="h-3 w-3 text-green-400 shrink-0 mt-0.5" />
                    <span className="text-green-400">
                      Deal: {event.brand} {event.model} — ${event.price?.toLocaleString()} (profit: ${event.profit?.toLocaleString()})
                    </span>
                  </>
                )}
                {event.type === "error" && (
                  <>
                    <XCircle className="h-3 w-3 text-red-400 shrink-0 mt-0.5" />
                    <span className="text-red-400">{event.message}</span>
                  </>
                )}
              </div>
            ))}
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Scraping 5 sources and analyzing with Claude AI. This takes 2-4 minutes...
          </p>
        </div>
      )}

      {/* Error State */}
      {error && !scanning && (
        <div className="mt-4 space-y-3">
          <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium">Scan Failed</p>
              <p className="mt-1 text-red-400/80">{error}</p>
            </div>
          </div>
          <div className="text-center">
            <button
              onClick={handleScan}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              <RefreshCw className="h-4 w-4" /> Try Again
            </button>
          </div>

          {/* Show error log if any */}
          {errors.length > 0 && (
            <div className="rounded-lg border border-border bg-background/50 p-3 max-h-32 overflow-y-auto text-xs font-mono space-y-1">
              {errors.map((e, i) => (
                <div key={i} className="flex items-start gap-2">
                  <XCircle className="h-3 w-3 text-red-400 shrink-0 mt-0.5" />
                  <span className="text-red-400/80">{e.message}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Success State */}
      {result && !scanning && !error && (
        <div className="mt-4 space-y-3">
          <div className="rounded-lg border border-green-500/20 bg-green-500/5 px-4 py-3 text-sm flex items-start gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-400 shrink-0 mt-0.5" />
            <div className="text-muted-foreground">
              <p className="font-medium text-foreground">Scan Complete</p>
              <p className="mt-1">
                Scraped {result.scraped} listings.{" "}
                {(result.saved ?? 0) > 0 ? (
                  <span className="text-green-400 font-medium">
                    Found {result.saved} profitable deals!
                  </span>
                ) : (
                  "No profitable deals found this round."
                )}{" "}
                {(result.errors ?? 0) > 0 && (
                  <span className="text-yellow-400">({result.errors} errors)</span>
                )}
              </p>
            </div>
          </div>

          {/* Show found deals */}
          {deals.length > 0 && (
            <div className="rounded-lg border border-border bg-background/50 p-3 text-xs font-mono space-y-1">
              {deals.map((d, i) => (
                <div key={i} className="flex items-start gap-2">
                  <TrendingUp className="h-3 w-3 text-green-400 shrink-0 mt-0.5" />
                  <span className="text-green-400">
                    {d.brand} {d.model} — ${d.price?.toLocaleString()} (est. profit: ${d.profit?.toLocaleString()}) via {d.source}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Show errors */}
          {result.errorMessages && result.errorMessages.length > 0 && (
            <details className="text-xs">
              <summary className="text-muted-foreground cursor-pointer hover:text-foreground">
                {result.errors} error(s) — click to expand
              </summary>
              <div className="mt-2 rounded-lg border border-border bg-background/50 p-3 font-mono space-y-1">
                {result.errorMessages.map((msg, i) => (
                  <div key={i} className="text-red-400/80">{msg}</div>
                ))}
              </div>
            </details>
          )}

          <div className="text-center">
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 rounded-lg bg-gold px-5 py-2.5 text-sm font-medium text-black hover:bg-gold-light transition-colors"
            >
              <RefreshCw className="h-4 w-4" /> Reload Page to See Deals
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
