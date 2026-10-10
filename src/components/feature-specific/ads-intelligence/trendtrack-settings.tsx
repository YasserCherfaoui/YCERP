import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import type {
  TrendTrackKeywordGroup,
  TrendTrackSettings,
} from "@/models/data/ads-intelligence/trendtrack.model";
import {
  getTrendTrackSettings,
  updateTrendTrackSettings,
} from "@/services/ads-intelligence-service";
import { Loader2, Plus, RotateCcw, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

function sameKeyword(a: string, b: string) {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

function withoutKeyword(list: string[], keyword: string) {
  return list.filter((item) => !sameKeyword(item, keyword));
}

function withKeyword(list: string[], keyword: string) {
  const next = keyword.trim();
  if (!next || list.some((item) => sameKeyword(item, next))) {
    return list;
  }
  return [...list, next];
}

function KeywordField({
  id,
  label,
  hint,
  keywords,
  onChange,
  groups,
}: {
  id: string;
  label: string;
  hint: string;
  keywords: string[];
  onChange: (next: string[]) => void;
  groups?: TrendTrackKeywordGroup[];
}) {
  const [draft, setDraft] = useState("");

  const addDraft = () => {
    onChange(withKeyword(keywords, draft));
    setDraft("");
  };

  const grouped = (groups ?? []).map((group) => ({
    ...group,
    present: keywords.filter((keyword) =>
      group.keywords.some((candidate) => sameKeyword(candidate, keyword)),
    ),
  }));
  const groupedKeys = new Set(
    grouped.flatMap((group) => group.present.map((keyword) => keyword.toLowerCase())),
  );
  const added = keywords.filter((keyword) => !groupedKeys.has(keyword.toLowerCase()));

  const chips = (items: string[]) => (
    <div className="flex flex-wrap gap-1.5">
      {items.map((keyword) => (
        <button
          key={keyword}
          type="button"
          className="inline-flex items-center gap-1 rounded-md border bg-background px-2 py-1 text-xs hover:bg-muted"
          onClick={() => onChange(withoutKeyword(keywords, keyword))}
          aria-label={`Remove ${keyword}`}
        >
          {keyword}
          <X className="h-3 w-3 text-muted-foreground" aria-hidden />
        </button>
      ))}
    </div>
  );

  return (
    <div className="space-y-3">
      <div>
        <Label htmlFor={id}>{label}</Label>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
      {grouped.map((group) => (
        <div key={group.id} className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">{group.label}</p>
          {group.present.length > 0 ? (
            chips(group.present)
          ) : (
            <p className="text-xs text-muted-foreground">None selected.</p>
          )}
        </div>
      ))}
      {(groups?.length ?? 0) > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">Added</p>
          {added.length > 0 ? chips(added) : <p className="text-xs text-muted-foreground">No extra keywords yet.</p>}
        </div>
      )}
      {(groups?.length ?? 0) === 0 && (keywords.length > 0 ? chips(keywords) : (
        <p className="text-xs text-muted-foreground">No keywords yet.</p>
      ))}
      <div className="flex gap-2">
        <Input
          id={id}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addDraft();
            }
          }}
          placeholder="Add a keyword"
        />
        <Button type="button" variant="outline" onClick={addDraft} disabled={!draft.trim()}>
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </div>
    </div>
  );
}

export default function TrendTrackSettings({ companyId }: { companyId: number }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [settings, setSettings] = useState<TrendTrackSettings | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [adKeywords, setAdKeywords] = useState<string[]>([]);
  const [shopKeywords, setShopKeywords] = useState<string[]>([]);
  const [pageLimit, setPageLimit] = useState("25");
  const [creditFloor, setCreditFloor] = useState("500");
  const [isActive, setIsActive] = useState(true);

  const apply = useCallback((row: TrendTrackSettings) => {
    setSettings(row);
    setAdKeywords(row.ad_keywords ?? []);
    setShopKeywords(row.shop_keywords ?? []);
    setPageLimit(String(row.page_limit));
    setCreditFloor(String(row.credit_floor));
    setIsActive(row.is_active);
    setApiKey("");
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getTrendTrackSettings(companyId);
      if (res.data) apply(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load TrendTrack settings");
    } finally {
      setLoading(false);
    }
  }, [apply, companyId]);

  useEffect(() => {
    void load();
  }, [load]);

  const restoreSuggested = () => {
    const groups = settings?.default_ad_keyword_groups ?? [];
    const next: string[] = [];
    for (const group of groups) {
      for (const keyword of group.keywords) {
        if (!next.some((item) => sameKeyword(item, keyword))) {
          next.push(keyword);
        }
      }
    }
    setAdKeywords(next);
  };

  const onSave = async () => {
    const limit = Number(pageLimit);
    const floor = Number(creditFloor);
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
      setError("Page limit must be a whole number from 1 to 100.");
      return;
    }
    if (!Number.isInteger(floor) || floor < 0) {
      setError("Credit floor must be a whole number of 0 or more.");
      return;
    }
    setSaving(true);
    setError(null);
    setSaved(null);
    try {
      const res = await updateTrendTrackSettings(companyId, {
        ...(apiKey.trim() ? { api_key: apiKey.trim() } : {}),
        ad_keywords: adKeywords,
        shop_keywords: shopKeywords,
        page_limit: limit,
        credit_floor: floor,
        is_active: isActive,
      });
      if (res.data) apply(res.data);
      setSaved("Settings saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3 px-4 py-5" aria-label="Loading TrendTrack settings">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-24 rounded-lg" />
        <Skeleton className="h-24 rounded-lg" />
      </div>
    );
  }

  return (
    <section className="space-y-6 px-4 py-5 sm:px-6">
      <div>
        <h2 className="text-sm font-semibold tracking-tight">TrendTrack</h2>
        <p className="text-xs text-muted-foreground">
          API key, keywords, and sync limits are stored for this company. Ad search starts with shoe terms for Algeria, Africa, and international markets.
        </p>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {saved && <p className="text-sm text-muted-foreground">{saved}</p>}

      <div className="space-y-2">
        <Label htmlFor="trendtrack-api-key">API key</Label>
        <Input
          id="trendtrack-api-key"
          type="password"
          autoComplete="off"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder={settings?.has_api_key ? "Leave blank to keep the saved key" : "Workspace API key"}
        />
        {settings?.has_api_key && (
          <p className="text-xs text-muted-foreground">
            Saved key <span className="font-mono">{settings.api_key_masked}</span>
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="trendtrack-page-limit">Rows per request</Label>
          <Input
            id="trendtrack-page-limit"
            inputMode="numeric"
            value={pageLimit}
            onChange={(e) => setPageLimit(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">Each returned row costs one credit. Maximum 100.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="trendtrack-credit-floor">Credit floor</Label>
          <Input
            id="trendtrack-credit-floor"
            inputMode="numeric"
            value={creditFloor}
            onChange={(e) => setCreditFloor(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">Sync stops when remaining credits fall below this number.</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Switch id="trendtrack-active" checked={isActive} onCheckedChange={setIsActive} />
        <Label htmlFor="trendtrack-active">Active for the daily sync</Label>
      </div>

      <div className="space-y-3 rounded-xl border p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Badge variant="secondary">Ad keywords</Badge>
          <Button type="button" variant="ghost" size="sm" onClick={restoreSuggested}>
            <RotateCcw className="h-4 w-4" />
            Restore suggested
          </Button>
        </div>
        <KeywordField
          id="trendtrack-ad-keyword"
          label="Search terms"
          hint="Remove a chip to drop it from the next sync. Added terms stay until you remove them."
          keywords={adKeywords}
          onChange={setAdKeywords}
          groups={settings?.default_ad_keyword_groups}
        />
      </div>

      <div className="space-y-3 rounded-xl border p-4">
        <Badge variant="secondary">Shop keywords</Badge>
        <KeywordField
          id="trendtrack-shop-keyword"
          label="Shop search"
          hint="Shop and product sync runs only when this list has at least one keyword."
          keywords={shopKeywords}
          onChange={setShopKeywords}
        />
      </div>

      <div className="flex justify-end">
        <Button type="button" onClick={() => void onSave()} disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          Save TrendTrack settings
        </Button>
      </div>
    </section>
  );
}
