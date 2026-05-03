"use client";

import { useState } from "react";
import { Bookmark, BookmarkCheck, Loader2 } from "lucide-react";

interface WatchlistButtonProps {
  listingId: string;
}

export function WatchlistButton({ listingId }: WatchlistButtonProps) {
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    if (saved || loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId }),
      });
      if (res.ok || res.status === 409) {
        setSaved(true);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading || saved}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border font-medium transition-colors ${
        saved
          ? "border-gold bg-gold/10 text-gold"
          : "border-border text-muted-foreground hover:border-gold/50 hover:text-foreground"
      }`}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : saved ? (
        <BookmarkCheck className="w-4 h-4" />
      ) : (
        <Bookmark className="w-4 h-4" />
      )}
      {saved ? "On Watchlist" : "Add to Watchlist"}
    </button>
  );
}
