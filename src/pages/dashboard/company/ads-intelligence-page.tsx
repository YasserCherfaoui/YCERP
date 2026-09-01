import AiChatPanel from "@/components/feature-specific/ads-intelligence/ai-chat-panel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { AdsTrueEconomicsRow } from "@/models/data/ads-intelligence/chat.model";
import {
  getAdsTrueEconomics,
  triggerMetaAdsSync,
} from "@/services/ads-intelligence-service";
import { BarChart3, Bot, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

function formatMoney(value: number) {
  return new Intl.NumberFormat("fr-DZ", {
    maximumFractionDigits: 0,
  }).format(value);
}

export default function AdsIntelligencePage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [rows, setRows] = useState<AdsTrueEconomicsRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  const loadEconomics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAdsTrueEconomics();
      setRows(res.data ?? []);
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
    setSyncing(true);
    try {
      await triggerMetaAdsSync();
      await loadEconomics();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Meta sync failed");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="container mx-auto space-y-6 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Ads Intelligence</h1>
          <p className="text-sm text-muted-foreground">
            True delivered economics and AI analyst chat over live data.
          </p>
        </div>
        <Button variant="outline" onClick={() => void onSyncMeta()} disabled={syncing}>
          <RefreshCw className={syncing ? "mr-2 h-4 w-4 animate-spin" : "mr-2 h-4 w-4"} />
          Sync Meta
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="dashboard" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="chat" className="gap-2">
            <Bot className="h-4 w-4" />
            Chat
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>True economics by campaign</CardTitle>
            </CardHeader>
            <CardContent>
              {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
              {error && <p className="text-sm text-destructive">{error}</p>}
              {!loading && !error && rows.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No attributed campaigns yet. Run Meta sync and ensure orders have UTM content.
                </p>
              )}
              {!loading && rows.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-muted-foreground">
                        <th className="px-2 py-2">Campaign</th>
                        <th className="px-2 py-2">Platform</th>
                        <th className="px-2 py-2">Spend</th>
                        <th className="px-2 py-2">Delivered</th>
                        <th className="px-2 py-2">Collected</th>
                        <th className="px-2 py-2">Net profit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row) => (
                        <tr key={`${row.platform}-${row.campaign_id}`} className="border-b">
                          <td className="px-2 py-2">#{row.campaign_id}</td>
                          <td className="px-2 py-2">{row.platform}</td>
                          <td className="px-2 py-2">{formatMoney(row.spend)}</td>
                          <td className="px-2 py-2">{row.delivered}</td>
                          <td className="px-2 py-2">{formatMoney(row.collected_cash)}</td>
                          <td className="px-2 py-2 font-medium">{formatMoney(row.net_profit)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chat" className="mt-4">
          <AiChatPanel className="min-h-[70vh]" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
