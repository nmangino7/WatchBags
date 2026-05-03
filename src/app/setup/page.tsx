"use client";

import { useState } from "react";
import {
  CheckCircle2,
  ExternalLink,
  Shield,
  Database,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";

function ExtLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-gold hover:text-gold-light underline underline-offset-2"
    >
      {children}
      <ExternalLink className="h-3 w-3" />
    </a>
  );
}

function CodeBlock({ children }: { children: string }) {
  return (
    <div className="rounded-lg border border-border bg-background px-4 py-3 font-mono text-sm text-foreground overflow-x-auto">
      {children}
    </div>
  );
}

export default function SetupPage() {
  const [dbStatus, setDbStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [dbMessage, setDbMessage] = useState("");

  const initializeDb = async () => {
    setDbStatus("loading");
    try {
      const res = await fetch("/api/setup", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setDbStatus("success");
        setDbMessage(data.message);
      } else {
        setDbStatus("error");
        setDbMessage(data.error);
      }
    } catch (err) {
      setDbStatus("error");
      setDbMessage(err instanceof Error ? err.message : "Failed to connect");
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Setup Guide</h1>
        <p className="mt-2 text-muted-foreground">
          Only 3 things needed to run WatchBags. No marketplace API keys required
          — the app scrapes listings directly.
        </p>
      </div>

      <div className="space-y-6">
        {/* Step 1: Claude API */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold/10 text-gold font-bold text-sm">
              1
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">Claude API Key</h3>
                <span className="rounded-md bg-loss-red/10 px-2 py-0.5 text-xs font-medium text-loss-red">
                  Required
                </span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Powers the AI pricing analysis for each listing.
              </p>
              <ol className="mt-3 list-decimal list-inside space-y-1.5 text-sm text-muted-foreground">
                <li>
                  Go to{" "}
                  <ExtLink href="https://console.anthropic.com">
                    console.anthropic.com
                  </ExtLink>{" "}
                  and sign up
                </li>
                <li>
                  Settings &rarr; API Keys &rarr; Create Key
                </li>
                <li>
                  In your{" "}
                  <ExtLink href="https://vercel.com/dashboard">
                    Vercel project
                  </ExtLink>
                  , go to Settings &rarr; Environment Variables
                </li>
                <li>
                  Add:
                  <div className="mt-1">
                    <CodeBlock>ANTHROPIC_API_KEY = sk-ant-api03-your-key</CodeBlock>
                  </div>
                </li>
              </ol>
            </div>
          </div>
        </div>

        {/* Step 2: Cron Secret */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold/10 text-gold font-bold text-sm">
              2
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">Cron Secret</h3>
                <span className="rounded-md bg-loss-red/10 px-2 py-0.5 text-xs font-medium text-loss-red">
                  Required
                </span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Protects your auto-scan endpoint. Just make up any random string.
              </p>
              <div className="mt-3">
                <CodeBlock>CRON_SECRET = any-random-password-here</CodeBlock>
              </div>
            </div>
          </div>
        </div>

        {/* Step 3: Database */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold/10 text-gold font-bold text-sm">
              3
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">Neon Postgres Database</h3>
                <span className="rounded-md bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-400">
                  Recommended
                </span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Without a database, data is lost on every deploy. With it, your
                deals, inventory, and sales persist forever.
              </p>
              <ol className="mt-3 list-decimal list-inside space-y-1.5 text-sm text-muted-foreground">
                <li>
                  In your Vercel project, go to the{" "}
                  <strong className="text-foreground">Storage</strong> tab
                </li>
                <li>
                  Click{" "}
                  <strong className="text-foreground">Create Database</strong>{" "}
                  &rarr; Neon Postgres
                </li>
                <li>
                  Vercel automatically adds <code>POSTGRES_URL</code> to your env vars
                </li>
                <li>Redeploy, then click the button below to set up tables</li>
              </ol>

              <div className="mt-4">
                <button
                  onClick={initializeDb}
                  disabled={dbStatus === "loading"}
                  className="inline-flex items-center gap-2 rounded-lg bg-gold px-4 py-2.5 text-sm font-semibold text-black hover:bg-gold-light transition-colors disabled:opacity-50"
                >
                  {dbStatus === "loading" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Database className="w-4 h-4" />
                  )}
                  Initialize Database
                </button>

                {dbStatus === "success" && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    {dbMessage}
                  </div>
                )}
                {dbStatus === "error" && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-loss-red">
                    <AlertTriangle className="w-4 h-4" />
                    {dbMessage}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="text-lg font-semibold mb-3">
            That&apos;s It
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            No eBay API keys, no Chrono24 accounts, no marketplace credentials.
            WatchBags scrapes listings directly from 6 sources: eBay, Chrono24,
            Bob&apos;s Watches, Reddit r/WatchExchange, WatchCharts, and Poshmark.
          </p>

          <div className="space-y-2 font-mono text-sm">
            <div className="flex items-center gap-3 rounded-lg bg-background px-4 py-2.5 border border-border">
              <span className="rounded bg-loss-red/10 px-1.5 py-0.5 text-xs text-loss-red font-sans">
                required
              </span>
              <span className="text-foreground">ANTHROPIC_API_KEY</span>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-background px-4 py-2.5 border border-border">
              <span className="rounded bg-loss-red/10 px-1.5 py-0.5 text-xs text-loss-red font-sans">
                required
              </span>
              <span className="text-foreground">CRON_SECRET</span>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-background px-4 py-2.5 border border-border">
              <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-xs text-amber-400 font-sans">
                recommended
              </span>
              <span className="text-foreground">POSTGRES_URL</span>
              <span className="text-muted-foreground ml-auto font-sans text-xs">
                Auto-set by Vercel Storage
              </span>
            </div>
          </div>

          <div className="mt-4 flex items-start gap-2 rounded-lg border border-loss-red/20 bg-loss-red/5 px-3 py-2.5">
            <Shield className="mt-0.5 h-4 w-4 shrink-0 text-loss-red" />
            <p className="text-loss-red text-xs">
              Never share your API key publicly or commit it to code.
            </p>
          </div>

          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-gold px-4 py-2 text-sm font-medium text-black hover:bg-gold-light transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
