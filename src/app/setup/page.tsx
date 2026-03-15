import {
  CheckCircle2,
  Circle,
  ExternalLink,
  Key,
  Server,
  Database,
  RefreshCw,
  Shield,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";

interface StepProps {
  number: number;
  title: string;
  children: React.ReactNode;
  status?: "required" | "optional";
}

function Step({ number, title, children, status = "required" }: StepProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold/10 text-gold font-bold text-sm">
          {number}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-lg font-semibold">{title}</h3>
            <span
              className={
                status === "required"
                  ? "rounded-md bg-loss-red/10 px-2 py-0.5 text-xs font-medium text-loss-red"
                  : "rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400"
              }
            >
              {status === "required" ? "Required" : "Optional"}
            </span>
          </div>
          <div className="mt-3 space-y-3 text-sm text-muted-foreground leading-relaxed">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function CodeBlock({ children }: { children: string }) {
  return (
    <div className="rounded-lg border border-border bg-background px-4 py-3 font-mono text-sm text-foreground overflow-x-auto">
      {children}
    </div>
  );
}

function ExtLink({ href, children }: { href: string; children: React.ReactNode }) {
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

export default function SetupPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Setup Guide</h1>
        <p className="mt-2 text-muted-foreground">
          Follow these steps to connect real data sources and get your resale
          marketplace fully operational.
        </p>
      </div>

      {/* Current Status */}
      <div className="mb-8 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
          <div>
            <h3 className="font-semibold text-amber-400">
              Currently Using Sample Data
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              All listings, prices, and AI analyses you see right now are fake
              demo data. Follow the steps below to connect real data sources.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Step 1: Claude API */}
        <Step number={1} title="Add Your Claude API Key">
          <p>
            The Claude API powers the AI pricing analysis, authenticity checks,
            and market insights for each listing.
          </p>

          <div className="rounded-lg border border-border bg-background p-4 space-y-3">
            <p className="font-medium text-foreground">How to get your key:</p>
            <ol className="list-decimal list-inside space-y-2">
              <li>
                Go to{" "}
                <ExtLink href="https://console.anthropic.com">
                  console.anthropic.com
                </ExtLink>
              </li>
              <li>Sign in or create an account</li>
              <li>
                Click <strong className="text-foreground">Settings</strong> in
                the left sidebar
              </li>
              <li>
                Click <strong className="text-foreground">API Keys</strong>
              </li>
              <li>
                Click <strong className="text-foreground">Create Key</strong>,
                name it something like &quot;WatchBags&quot;
              </li>
              <li>Copy the key (starts with <code>sk-ant-</code>)</li>
            </ol>
          </div>

          <div className="rounded-lg border border-border bg-background p-4 space-y-3">
            <p className="font-medium text-foreground">
              How to add it to Vercel:
            </p>
            <ol className="list-decimal list-inside space-y-2">
              <li>
                Go to your project on{" "}
                <ExtLink href="https://vercel.com/dashboard">
                  vercel.com/dashboard
                </ExtLink>
              </li>
              <li>Click on your WatchBags project</li>
              <li>
                Click <strong className="text-foreground">Settings</strong> tab
                at the top
              </li>
              <li>
                Click{" "}
                <strong className="text-foreground">
                  Environment Variables
                </strong>{" "}
                in the left sidebar
              </li>
              <li>
                Add a new variable:
                <div className="mt-2 space-y-1">
                  <CodeBlock>Name: ANTHROPIC_API_KEY</CodeBlock>
                  <CodeBlock>Value: sk-ant-api03-your-key-here</CodeBlock>
                </div>
              </li>
              <li>
                Make sure all environments are checked (Production, Preview,
                Development)
              </li>
              <li>
                Click <strong className="text-foreground">Save</strong>
              </li>
            </ol>
          </div>

          <div className="flex items-start gap-2 rounded-lg border border-loss-red/20 bg-loss-red/5 px-3 py-2.5">
            <Shield className="mt-0.5 h-4 w-4 shrink-0 text-loss-red" />
            <p className="text-loss-red text-xs">
              <strong>Never</strong> share your API key publicly, paste it in
              chat, or commit it to code. If you accidentally expose it, revoke
              it immediately at{" "}
              <ExtLink href="https://console.anthropic.com/settings/keys">
                console.anthropic.com/settings/keys
              </ExtLink>{" "}
              and create a new one.
            </p>
          </div>
        </Step>

        {/* Step 2: Cron Secret */}
        <Step number={2} title="Set Up Cron Secret">
          <p>
            The cron secret protects your auto-update endpoint so only Vercel
            can trigger it, not random people on the internet.
          </p>

          <div className="rounded-lg border border-border bg-background p-4 space-y-3">
            <p className="font-medium text-foreground">How to set it up:</p>
            <ol className="list-decimal list-inside space-y-2">
              <li>Make up a random string (any password-like text works)</li>
              <li>
                In your Vercel project, go to{" "}
                <strong className="text-foreground">Settings</strong> &rarr;{" "}
                <strong className="text-foreground">
                  Environment Variables
                </strong>
              </li>
              <li>
                Add a new variable:
                <div className="mt-2 space-y-1">
                  <CodeBlock>Name: CRON_SECRET</CodeBlock>
                  <CodeBlock>Value: any-random-string-you-make-up</CodeBlock>
                </div>
              </li>
              <li>Save and redeploy</li>
            </ol>
          </div>

          <p>
            This is used by the auto-update system that refreshes pricing data
            every 6 hours.
          </p>
        </Step>

        {/* Step 3: Vercel Postgres */}
        <Step number={3} title="Connect Vercel Postgres Database" status="optional">
          <p>
            Right now the app uses in-memory seed data. To store real listings
            and track prices over time, you need a database.
          </p>

          <div className="rounded-lg border border-border bg-background p-4 space-y-3">
            <p className="font-medium text-foreground">How to set it up:</p>
            <ol className="list-decimal list-inside space-y-2">
              <li>
                Go to{" "}
                <ExtLink href="https://vercel.com/dashboard">
                  vercel.com/dashboard
                </ExtLink>
              </li>
              <li>Click on your WatchBags project</li>
              <li>
                Click <strong className="text-foreground">Storage</strong> tab
                at the top
              </li>
              <li>
                Click{" "}
                <strong className="text-foreground">
                  Create Database
                </strong>{" "}
                &rarr; <strong className="text-foreground">Postgres</strong>
              </li>
              <li>Choose a name and region (pick one close to you)</li>
              <li>
                Vercel automatically adds the{" "}
                <code>POSTGRES_URL</code> environment variable to your project
              </li>
              <li>Redeploy for it to take effect</li>
            </ol>
          </div>

          <p>
            The free tier gives you 256 MB storage which is plenty for this app.
          </p>
        </Step>

        {/* Step 4: Data Sources */}
        <Step number={4} title="Connect Real Listing Sources" status="optional">
          <p>
            To pull real listings instead of sample data, you can connect these
            marketplace APIs. Each one is independent &mdash; add whichever ones
            you want.
          </p>

          {/* eBay */}
          <div className="rounded-lg border border-border bg-background p-4 space-y-2">
            <p className="font-medium text-foreground">eBay Browse API</p>
            <p>Best for: completed sales data, active listings for both watches and handbags</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>
                Go to{" "}
                <ExtLink href="https://developer.ebay.com">
                  developer.ebay.com
                </ExtLink>
              </li>
              <li>Create a developer account (free)</li>
              <li>
                Click <strong className="text-foreground">My Account</strong>{" "}
                &rarr;{" "}
                <strong className="text-foreground">Application Keys</strong>
              </li>
              <li>Create a new app (choose Production keys)</li>
              <li>
                Add to Vercel env vars:
                <div className="mt-2 space-y-1">
                  <CodeBlock>Name: EBAY_APP_ID</CodeBlock>
                  <CodeBlock>Name: EBAY_CERT_ID</CodeBlock>
                </div>
              </li>
            </ol>
          </div>

          {/* Chrono24 */}
          <div className="rounded-lg border border-border bg-background p-4 space-y-2">
            <p className="font-medium text-foreground">Chrono24 (Watches)</p>
            <p>Best for: watch market data, dealer listings, price comparisons</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>
                Go to{" "}
                <ExtLink href="https://www.chrono24.com/info/api.htm">
                  chrono24.com/info/api.htm
                </ExtLink>
              </li>
              <li>
                Apply for API access (requires a dealer account &mdash; they
                review applications)
              </li>
              <li>
                Once approved, add to Vercel:
                <div className="mt-2">
                  <CodeBlock>Name: CHRONO24_API_KEY</CodeBlock>
                </div>
              </li>
            </ol>
            <p className="text-xs text-amber-400">
              Note: Chrono24 API access is restricted to approved dealers. You
              may need to apply as a business.
            </p>
          </div>

          {/* StockX */}
          <div className="rounded-lg border border-border bg-background p-4 space-y-2">
            <p className="font-medium text-foreground">StockX</p>
            <p>Best for: sneaker-style market data on watches and some handbags</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>
                Go to{" "}
                <ExtLink href="https://developer.stockx.com">
                  developer.stockx.com
                </ExtLink>
              </li>
              <li>Sign up for API access</li>
              <li>
                Create an application to get your credentials
              </li>
              <li>
                Add to Vercel:
                <div className="mt-2 space-y-1">
                  <CodeBlock>Name: STOCKX_API_KEY</CodeBlock>
                </div>
              </li>
            </ol>
          </div>

          {/* Vestiaire */}
          <div className="rounded-lg border border-border bg-background p-4 space-y-2">
            <p className="font-medium text-foreground">
              Vestiaire Collective (Handbags)
            </p>
            <p>Best for: luxury handbag listings, Hermes/Chanel/LV market data</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>
                Go to{" "}
                <ExtLink href="https://www.vestiairecollective.com">
                  vestiairecollective.com
                </ExtLink>
              </li>
              <li>
                Vestiaire does not offer a public API &mdash; you would need to
                reach out to their partnerships team or use their affiliate
                program
              </li>
              <li>
                If approved, add to Vercel:
                <div className="mt-2">
                  <CodeBlock>Name: VESTIAIRE_API_KEY</CodeBlock>
                </div>
              </li>
            </ol>
          </div>

          {/* WatchCharts */}
          <div className="rounded-lg border border-border bg-background p-4 space-y-2">
            <p className="font-medium text-foreground">
              WatchCharts (Market Analytics)
            </p>
            <p>Best for: watch price trends, market indices, historical data</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>
                Go to{" "}
                <ExtLink href="https://watchcharts.com/api">
                  watchcharts.com/api
                </ExtLink>
              </li>
              <li>Sign up for an API plan (has free and paid tiers)</li>
              <li>
                Add to Vercel:
                <div className="mt-2">
                  <CodeBlock>Name: WATCHCHARTS_API_KEY</CodeBlock>
                </div>
              </li>
            </ol>
          </div>
        </Step>

        {/* Step 5: Redeploy */}
        <Step number={5} title="Redeploy After Adding Variables">
          <p>
            After adding any environment variables, you need to redeploy for
            them to take effect.
          </p>

          <div className="rounded-lg border border-border bg-background p-4 space-y-3">
            <p className="font-medium text-foreground">How to redeploy:</p>
            <ol className="list-decimal list-inside space-y-2">
              <li>Go to your project on Vercel</li>
              <li>
                Click <strong className="text-foreground">Deployments</strong>{" "}
                tab
              </li>
              <li>
                Click the <strong className="text-foreground">...</strong> menu
                on the latest deployment
              </li>
              <li>
                Click{" "}
                <strong className="text-foreground">Redeploy</strong>
              </li>
              <li>Wait about 1 minute for it to finish</li>
            </ol>
          </div>
        </Step>

        {/* Summary Checklist */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4">
            Environment Variables Summary
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            All of these go in Vercel &rarr; Settings &rarr; Environment
            Variables:
          </p>
          <div className="space-y-2 font-mono text-sm">
            <div className="flex items-center gap-3 rounded-lg bg-background px-4 py-2.5 border border-border">
              <span className="rounded bg-loss-red/10 px-1.5 py-0.5 text-xs text-loss-red font-sans">
                required
              </span>
              <span className="text-foreground">ANTHROPIC_API_KEY</span>
              <span className="text-muted-foreground ml-auto font-sans text-xs">
                Claude AI analysis
              </span>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-background px-4 py-2.5 border border-border">
              <span className="rounded bg-loss-red/10 px-1.5 py-0.5 text-xs text-loss-red font-sans">
                required
              </span>
              <span className="text-foreground">CRON_SECRET</span>
              <span className="text-muted-foreground ml-auto font-sans text-xs">
                Auto-update security
              </span>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-background px-4 py-2.5 border border-border">
              <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-xs text-emerald-400 font-sans">
                optional
              </span>
              <span className="text-foreground">POSTGRES_URL</span>
              <span className="text-muted-foreground ml-auto font-sans text-xs">
                Auto-added by Vercel Storage
              </span>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-background px-4 py-2.5 border border-border">
              <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-xs text-emerald-400 font-sans">
                optional
              </span>
              <span className="text-foreground">EBAY_APP_ID</span>
              <span className="text-muted-foreground ml-auto font-sans text-xs">
                eBay listings
              </span>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-background px-4 py-2.5 border border-border">
              <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-xs text-emerald-400 font-sans">
                optional
              </span>
              <span className="text-foreground">EBAY_CERT_ID</span>
              <span className="text-muted-foreground ml-auto font-sans text-xs">
                eBay auth
              </span>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-background px-4 py-2.5 border border-border">
              <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-xs text-emerald-400 font-sans">
                optional
              </span>
              <span className="text-foreground">CHRONO24_API_KEY</span>
              <span className="text-muted-foreground ml-auto font-sans text-xs">
                Watch listings
              </span>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-background px-4 py-2.5 border border-border">
              <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-xs text-emerald-400 font-sans">
                optional
              </span>
              <span className="text-foreground">STOCKX_API_KEY</span>
              <span className="text-muted-foreground ml-auto font-sans text-xs">
                StockX market data
              </span>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-background px-4 py-2.5 border border-border">
              <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-xs text-emerald-400 font-sans">
                optional
              </span>
              <span className="text-foreground">VESTIAIRE_API_KEY</span>
              <span className="text-muted-foreground ml-auto font-sans text-xs">
                Handbag listings
              </span>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-background px-4 py-2.5 border border-border">
              <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-xs text-emerald-400 font-sans">
                optional
              </span>
              <span className="text-foreground">WATCHCHARTS_API_KEY</span>
              <span className="text-muted-foreground ml-auto font-sans text-xs">
                Watch price trends
              </span>
            </div>
          </div>
        </div>

        {/* Help */}
        <div className="rounded-2xl border border-border bg-card p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Need help? Start with just the <strong className="text-foreground">ANTHROPIC_API_KEY</strong> and{" "}
            <strong className="text-foreground">CRON_SECRET</strong> &mdash;
            those are the only two required ones. The data source APIs are
            optional and can be added later as you get access to them.
          </p>
          <Link
            href="/"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-gold px-4 py-2 text-sm font-medium text-black hover:bg-gold-light transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
