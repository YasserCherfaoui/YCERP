import TrendTrackSettings from "@/components/feature-specific/ads-intelligence/trendtrack-settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  TrendTrackAd,
  TrendTrackBrandtracker,
  TrendTrackProduct,
  TrendTrackShop,
  TrendTrackSyncStatus,
} from "@/models/data/ads-intelligence/trendtrack.model";
import {
  listTrendTrackAds,
  listTrendTrackBrandtrackers,
  listTrendTrackProducts,
  listTrendTrackShops,
  lookupTrendTrack,
  triggerTrendTrackSync,
  waitForTrendTrackSync,
} from "@/services/ads-intelligence-service";
import { cn } from "@/lib/utils";
import { ExternalLink, RefreshCw, Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

function formatCount(value: number) {
  return new Intl.NumberFormat().format(value);
}

function Empty({ children }: { children: string }) {
  return <p className="px-4 py-10 text-center text-sm text-muted-foreground">{children}</p>;
}

function AdCard({ ad }: { ad: TrendTrackAd }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-xl border bg-background">
      {ad.creative_thumbnail ? (
        <img src={ad.creative_thumbnail} alt="" className="h-36 w-full object-cover" />
      ) : (
        <div className="flex h-36 items-center justify-center bg-muted text-xs text-muted-foreground">
          No thumbnail
        </div>
      )}
      <div className="flex flex-1 flex-col gap-2 p-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-medium leading-snug">{ad.headline || ad.advertiser_name || ad.external_id}</h3>
          <span className="shrink-0 text-xs text-muted-foreground">{formatCount(ad.reach)} reach</span>
        </div>
        {ad.ad_body && <p className="line-clamp-3 text-xs text-muted-foreground">{ad.ad_body}</p>}
        <p className="mt-auto text-xs text-muted-foreground">
          {[ad.advertiser_name, ad.status, ad.days_running ? `${ad.days_running}d` : ""]
            .filter(Boolean)
            .join(" · ")}
        </p>
        {ad.landing_url && (
          <a
            href={ad.landing_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            Landing page
            <ExternalLink className="h-3 w-3" aria-hidden />
          </a>
        )}
      </div>
    </article>
  );
}

function syncSummary(status: TrendTrackSyncStatus | null) {
  if (!status?.report) return null;
  const report = status.report;
  const parts = [
    `${report.ads} ads`,
    `${report.shops} shops`,
    `${report.products} products`,
    `${report.brandtrackers} brand trackers`,
  ];
  if (report.credits_remaining != null) {
    parts.push(`${formatCount(report.credits_remaining)} credits left`);
  }
  if (report.stopped_reason) {
    parts.push(report.stopped_reason);
  }
  return parts.join(" · ");
}

export default function TrendTrackPanel({ companyId }: { companyId: number }) {
  const [view, setView] = useState("ads");
  const [ads, setAds] = useState<TrendTrackAd[]>([]);
  const [shops, setShops] = useState<TrendTrackShop[]>([]);
  const [products, setProducts] = useState<TrendTrackProduct[]>([]);
  const [brands, setBrands] = useState<TrendTrackBrandtracker[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [lookupResult, setLookupResult] = useState<string | null>(null);
  const [lookingUp, setLookingUp] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncNote, setSyncNote] = useState<string | null>(null);

  const load = useCallback(async (nextView: string) => {
    if (nextView === "settings") return;
    setLoading(true);
    setError(null);
    try {
      if (nextView === "ads") {
        const res = await listTrendTrackAds();
        setAds(res.data ?? []);
      } else if (nextView === "shops") {
        const res = await listTrendTrackShops();
        setShops(res.data ?? []);
      } else if (nextView === "products") {
        const res = await listTrendTrackProducts();
        setProducts(res.data ?? []);
      } else if (nextView === "brands") {
        const res = await listTrendTrackBrandtrackers();
        setBrands(res.data ?? []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load TrendTrack data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(view);
  }, [load, view]);

  const onLookup = async () => {
    const q = query.trim();
    if (!q) return;
    setLookingUp(true);
    setError(null);
    try {
      const res = await lookupTrendTrack(companyId, q);
      setLookupResult(JSON.stringify(res.data, null, 2));
    } catch (err) {
      setLookupResult(null);
      setError(err instanceof Error ? err.message : "Lookup failed");
    } finally {
      setLookingUp(false);
    }
  };

  const onSync = async () => {
    setSyncing(true);
    setError(null);
    setSyncNote("TrendTrack sync started…");
    try {
      await triggerTrendTrackSync(companyId);
      const snap = await waitForTrendTrackSync(companyId);
      if (snap.last_error) {
        setError(snap.last_error);
        setSyncNote(null);
      } else {
        setSyncNote(syncSummary(snap) ?? "TrendTrack sync done");
        await load(view);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "TrendTrack sync failed");
      setSyncNote(null);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 flex-wrap items-end justify-between gap-3 border-b px-4 py-3">
        <form
          className="flex min-w-[16rem] flex-1 gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            void onLookup();
          }}
        >
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Look up a brand, domain, or page"
            aria-label="TrendTrack lookup"
          />
          <Button type="submit" variant="outline" disabled={lookingUp || !query.trim()}>
            <Search className={cn("h-4 w-4", lookingUp && "animate-pulse")} />
            Lookup
          </Button>
        </form>
        <Button type="button" size="sm" onClick={() => void onSync()} disabled={syncing}>
          <RefreshCw className={cn("h-4 w-4", syncing && "animate-spin")} />
          {syncing ? "Syncing…" : "Sync"}
        </Button>
      </div>
      {(syncNote || error || lookupResult) && (
        <div className="shrink-0 space-y-2 border-b px-4 py-3">
          {syncNote && <p className="text-sm text-muted-foreground">{syncNote}</p>}
          {error && <p className="text-sm text-destructive">{error}</p>}
          {lookupResult && (
            <pre className="max-h-40 overflow-auto rounded-md bg-muted p-3 text-xs">{lookupResult}</pre>
          )}
        </div>
      )}

      <Tabs value={view} onValueChange={setView} className="flex min-h-0 flex-1 flex-col">
        <TabsList className="mx-4 mt-3 w-fit shrink-0">
          <TabsTrigger value="ads">Ads</TabsTrigger>
          <TabsTrigger value="shops">Shops</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="brands">Brands</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {loading && view !== "settings" && (
            <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3" aria-label="Loading TrendTrack">
              <Skeleton className="h-48 rounded-xl" />
              <Skeleton className="h-48 rounded-xl" />
              <Skeleton className="h-48 rounded-xl" />
            </div>
          )}

          <TabsContent value="ads" className="mt-0 focus-visible:ring-0">
            {!loading && ads.length === 0 && (
              <Empty>No cached ads yet. Save an API key in Settings, then run Sync.</Empty>
            )}
            {!loading && ads.length > 0 && (
              <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
                {ads.map((ad) => (
                  <AdCard key={ad.external_id} ad={ad} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="shops" className="mt-0 focus-visible:ring-0">
            {!loading && shops.length === 0 && (
              <Empty>No cached shops. Add shop keywords in Settings before the next sync.</Empty>
            )}
            {!loading && shops.length > 0 && (
              <ul className="divide-y px-4">
                {shops.map((shop) => (
                  <li key={shop.external_id} className="flex flex-wrap items-baseline justify-between gap-2 py-3">
                    <div>
                      <p className="text-sm font-medium">{shop.name || shop.domain || shop.external_id}</p>
                      <p className="text-xs text-muted-foreground">{shop.domain}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatCount(shop.monthly_visits)} visits · {shop.active_ads} active ads
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>

          <TabsContent value="products" className="mt-0 focus-visible:ring-0">
            {!loading && products.length === 0 && (
              <Empty>No cached products. Products are pulled from shops found in the latest sync.</Empty>
            )}
            {!loading && products.length > 0 && (
              <ul className="divide-y px-4">
                {products.map((product) => (
                  <li key={`${product.shop_external_id}:${product.external_id}`} className="flex items-center gap-3 py-3">
                    {product.image_url ? (
                      <img src={product.image_url} alt="" className="h-12 w-12 rounded-md object-cover" />
                    ) : (
                      <div className="h-12 w-12 rounded-md bg-muted" />
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{product.title || product.external_id}</p>
                      <p className="text-xs text-muted-foreground">
                        {product.price ? `${product.price} ${product.currency}` : "Price unavailable"}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>

          <TabsContent value="brands" className="mt-0 focus-visible:ring-0">
            {!loading && brands.length === 0 && (
              <Empty>No brand trackers cached yet. Sync pulls the trackers already in your TrendTrack workspace.</Empty>
            )}
            {!loading && brands.length > 0 && (
              <ul className="divide-y px-4">
                {brands.map((brand) => (
                  <li key={brand.external_id} className="py-3">
                    <p className="text-sm font-medium">{brand.name || brand.external_id}</p>
                    <p className="text-xs text-muted-foreground">{brand.external_id}</p>
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>

          <TabsContent value="settings" className="mt-0 focus-visible:ring-0">
            <TrendTrackSettings companyId={companyId} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
