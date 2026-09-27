import { RootState } from "@/app/store";
import AdsCredentialsSettings from "@/components/feature-specific/ads-intelligence/ads-credentials-settings";
import AiChatPanel from "@/components/feature-specific/ads-intelligence/ai-chat-panel";
import TrueEconomicsDashboard from "@/components/feature-specific/ads-intelligence/true-economics-dashboard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { AdsModelFunnelRow, AdsTrueEconomicsRow } from "@/models/data/ads-intelligence/chat.model";
import {
  getAdsModelFunnel,
  getAdsTrueEconomics,
  triggerMetaAdsSync,
  triggerTikTokAdsSync,
  waitForAdsSync,
} from "@/services/ads-intelligence-service";
import { cn } from "@/lib/utils";
import { BarChart3, Bot, RefreshCw, Settings2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";

export default function AdsIntelligencePage() {
  const company = useSelector((state: RootState) => state.company.company);
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(
    tabParam === "settings" || tabParam === "chat" ? tabParam : "dashboard",
  );
  const [rows, setRows] = useState<AdsTrueEconomicsRow[]>([]);
  const [funnel, setFunnel] = useState<AdsModelFunnelRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [syncingMeta, setSyncingMeta] = useState(false);
  const [syncingTikTok, setSyncingTikTok] = useState(false);

  useEffect(() => {
    if (tabParam === "settings" || tabParam === "chat" || tabParam === "dashboard") {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const onTabChange = (value: string) => {
    setActiveTab(value);
    if (value === "dashboard") {
      setSearchParams({}, { replace: true });
    } else {
      setSearchParams({ tab: value }, { replace: true });
    }
  };

  const loadEconomics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [economics, models] = await Promise.all([
        getAdsTrueEconomics(),
        getAdsModelFunnel(),
      ]);
      setRows(economics.data ?? []);
      setFunnel(models.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load economics");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadEconomics();
  }, [loadEconomics]);

  const onSyncMeta = async () => {
    if (!company) {
      setError("No company selected");
      return;
    }
    setSyncingMeta(true);
    setError(null);
    setSyncStatus("Meta sync started…");
    try {
      await triggerMetaAdsSync(company.ID);
      setSyncStatus("Meta sync running in background…");
      const snap = await waitForAdsSync(company.ID, "meta");
      if (snap.last_error) {
        setError(snap.last_error);
        setSyncStatus(null);
      } else {
        const r = snap.report;
        setSyncStatus(
          r
            ? `Meta sync done — accounts ${r.Accounts}, campaigns ${r.Campaigns}, ads ${r.Ads}, insights ${r.Insights}`
            : "Meta sync done",
        );
        await loadEconomics();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Meta sync failed");
      setSyncStatus(null);
    } finally {
      setSyncingMeta(false);
    }
  };

  const onSyncTikTok = async () => {
    if (!company) {
      setError("No company selected");
      return;
    }
    setSyncingTikTok(true);
    setError(null);
    setSyncStatus("TikTok sync started…");
    try {
      await triggerTikTokAdsSync(company.ID);
      setSyncStatus("TikTok sync running in background…");
      const snap = await waitForAdsSync(company.ID, "tiktok");
      if (snap.last_error) {
        setError(snap.last_error);
        setSyncStatus(null);
      } else {
        const r = snap.report;
        setSyncStatus(
          r
            ? `TikTok sync done — accounts ${r.Accounts}, campaigns ${r.Campaigns}, ads ${r.Ads}, insights ${r.Insights}`
            : "TikTok sync done",
        );
        await loadEconomics();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "TikTok sync failed");
      setSyncStatus(null);
    } finally {
      setSyncingTikTok(false);
    }
  };

  if (!company) return null;

  const chatOpen = activeTab === "chat";

  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-screen-2xl flex-col",
        chatOpen
          ? "h-[calc(100dvh-2.75rem)] gap-3 overflow-hidden px-3 py-3 md:px-5"
          : "container space-y-6 p-4 md:p-6",
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Ads Intelligence</h1>
          <p className="text-sm text-muted-foreground">
            Campaign spend compared with confirmed, delivered, and returned orders.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => void onSyncMeta()} disabled={syncingMeta}>
            <RefreshCw className={syncingMeta ? "mr-2 h-4 w-4 animate-spin" : "mr-2 h-4 w-4"} />
            {syncingMeta ? "Syncing Meta…" : "Sync Meta"}
          </Button>
          <Button variant="outline" onClick={() => void onSyncTikTok()} disabled={syncingTikTok}>
            <RefreshCw className={syncingTikTok ? "mr-2 h-4 w-4 animate-spin" : "mr-2 h-4 w-4"} />
            {syncingTikTok ? "Syncing TikTok…" : "Sync TikTok"}
          </Button>
        </div>
      </div>

      {syncStatus && (
        <p className="text-sm text-muted-foreground">{syncStatus}</p>
      )}

      <Tabs
        value={activeTab}
        onValueChange={onTabChange}
        className={cn(chatOpen && "flex min-h-0 flex-1 flex-col")}
      >
        <TabsList>
          <TabsTrigger value="dashboard" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="chat" className="gap-2">
            <Bot className="h-4 w-4" />
            Chat
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings2 className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-4">
          <TrueEconomicsDashboard
            rows={rows}
            funnel={funnel}
            loading={loading}
            error={error}
          />
        </TabsContent>

        <TabsContent
          value="chat"
          className="mt-3 min-h-0 flex-1 overflow-hidden focus-visible:ring-0 focus-visible:ring-offset-0"
        >
          <AiChatPanel className="h-full" />
        </TabsContent>

        <TabsContent value="settings" className="mt-4">
          <AdsCredentialsSettings companyId={company.ID} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
