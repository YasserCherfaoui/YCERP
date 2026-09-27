import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type {
  AdsPlatform,
  AdsPlatformCredential,
} from "@/models/data/ads-intelligence/credentials.model";
import {
  createAdsPlatformCredential,
  deleteAdsPlatformCredential,
  listAdsPlatformCredentials,
  updateAdsPlatformCredential,
} from "@/services/ads-intelligence-service";
import { KeyRound, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

type FormState = {
  platform: AdsPlatform;
  label: string;
  accessToken: string;
  refreshToken: string;
  appId: string;
  appSecret: string;
  accountIds: string;
  apiVersion: string;
  isActive: boolean;
};

const emptyForm = (platform: AdsPlatform = "meta"): FormState => ({
  platform,
  label: "",
  accessToken: "",
  refreshToken: "",
  appId: "",
  appSecret: "",
  accountIds: "",
  apiVersion: "",
  isActive: true,
});

function parseAccountIds(raw: string): string[] {
  return raw
    .split(/[,\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function AdsCredentialsSettings({ companyId }: { companyId: number }) {
  const [rows, setRows] = useState<AdsPlatformCredential[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listAdsPlatformCredentials(companyId);
      setRows(res.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load credentials");
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    void load();
  }, [load]);

  const metaRows = useMemo(() => rows.filter((r) => r.platform === "meta"), [rows]);
  const tiktokRows = useMemo(() => rows.filter((r) => r.platform === "tiktok"), [rows]);

  const startCreate = (platform: AdsPlatform) => {
    setEditingId(null);
    setForm(emptyForm(platform));
    setShowForm(true);
  };

  const startEdit = (row: AdsPlatformCredential) => {
    setEditingId(row.id);
    setForm({
      platform: row.platform,
      label: row.label,
      accessToken: "",
      refreshToken: "",
      appId: row.app_id,
      appSecret: "",
      accountIds: (row.account_ids ?? []).join(", "),
      apiVersion: row.api_version,
      isActive: row.is_active,
    });
    setShowForm(true);
  };

  const onSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const accountIds = parseAccountIds(form.accountIds);
      if (editingId == null) {
        await createAdsPlatformCredential(companyId, {
          platform: form.platform,
          label: form.label,
          access_token: form.accessToken || undefined,
          refresh_token: form.refreshToken || undefined,
          app_id: form.appId || undefined,
          app_secret: form.appSecret || undefined,
          account_ids: accountIds,
          api_version: form.apiVersion || undefined,
          is_active: form.isActive,
        });
      } else {
        await updateAdsPlatformCredential(companyId, editingId, {
          label: form.label,
          access_token: form.accessToken || undefined,
          refresh_token: form.refreshToken || undefined,
          app_id: form.appId,
          app_secret: form.appSecret || undefined,
          account_ids: accountIds,
          api_version: form.apiVersion,
          is_active: form.isActive,
        });
      }
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm());
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id: number) => {
    if (!window.confirm("Delete this credential set?")) return;
    setError(null);
    try {
      await deleteAdsPlatformCredential(companyId, id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  };

  const renderList = (title: string, platform: AdsPlatform, list: AdsPlatformCredential[]) => (
    <section className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <KeyRound className="h-4 w-4" aria-hidden />
          </span>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
            <p className="text-xs text-muted-foreground">
              Several connections are fine. Leave account IDs empty to sync every account the token can see.
            </p>
          </div>
        </div>
        <Button size="sm" variant="outline" className="bg-background" onClick={() => startCreate(platform)}>
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </div>
      {list.length === 0 && (
        <p className="rounded-lg border border-dashed px-3 py-6 text-sm leading-6 text-muted-foreground">
          No {platform} credentials yet.
        </p>
      )}
      {list.length > 0 && (
        <div className="overflow-hidden rounded-lg border bg-background">
          {list.map((row) => (
            <div
              key={row.id}
              className="flex items-center justify-between gap-3 border-b px-3 py-2.5 last:border-b-0"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{row.label || `${row.platform} #${row.id}`}</p>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span
                    className={cn(
                      "h-2 w-2 shrink-0 rounded-full",
                      row.is_active ? "bg-emerald-500" : "bg-muted-foreground/50",
                    )}
                    aria-hidden
                  />
                  {row.is_active ? "Active" : "Inactive"}
                  <span aria-hidden>·</span>
                  <span className="truncate">Token {row.access_token_masked || "—"}</span>
                  <span aria-hidden>·</span>
                  <span className="truncate">
                    {row.account_ids?.length ? row.account_ids.join(", ") : "All accounts"}
                  </span>
                </p>
              </div>
              <div className="flex shrink-0 gap-1">
                <Button size="icon" variant="ghost" onClick={() => startEdit(row)} aria-label={`Edit ${row.label || title}`}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => void onDelete(row.id)}
                  aria-label={`Delete ${row.label || title}`}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );

  return (
    <div className="space-y-8 px-4 py-5 sm:px-6">
      {loading && (
        <div className="space-y-3" aria-label="Loading credentials">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-16 rounded-lg" />
          <Skeleton className="h-16 rounded-lg" />
        </div>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}

      {!loading && (
        <>
          {renderList("Meta", "meta", metaRows)}
          {renderList("TikTok", "tiktok", tiktokRows)}
        </>
      )}

      {showForm && (
        <section className="rounded-xl border bg-background shadow-sm">
          <div className="border-b px-4 py-3">
            <h2 className="text-sm font-semibold tracking-tight">
              {editingId == null ? "Add credential" : "Edit credential"} · {form.platform}
            </h2>
            <p className="text-xs text-muted-foreground">
              {editingId != null
                ? "Leave token fields blank to keep the stored secrets."
                : "Paste the platform access token for this connection."}
            </p>
          </div>
          <div className="space-y-4 px-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cred-label">Label</Label>
              <Input
                id="cred-label"
                value={form.label}
                onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                placeholder="e.g. Main BM / Agency A"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cred-token">Access token</Label>
              <Input
                id="cred-token"
                type="password"
                autoComplete="off"
                value={form.accessToken}
                onChange={(e) => setForm((f) => ({ ...f, accessToken: e.target.value }))}
                placeholder={editingId != null ? "Leave blank to keep" : "Required for Meta"}
              />
            </div>
            {form.platform === "tiktok" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="cred-refresh">Refresh token</Label>
                  <Input
                    id="cred-refresh"
                    type="password"
                    autoComplete="off"
                    value={form.refreshToken}
                    onChange={(e) => setForm((f) => ({ ...f, refreshToken: e.target.value }))}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="cred-app-id">App ID</Label>
                    <Input
                      id="cred-app-id"
                      value={form.appId}
                      onChange={(e) => setForm((f) => ({ ...f, appId: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cred-app-secret">App secret</Label>
                    <Input
                      id="cred-app-secret"
                      type="password"
                      autoComplete="off"
                      value={form.appSecret}
                      onChange={(e) => setForm((f) => ({ ...f, appSecret: e.target.value }))}
                      placeholder={editingId != null ? "Leave blank to keep" : undefined}
                    />
                  </div>
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label htmlFor="cred-accounts">
                Account IDs (optional, comma-separated)
              </Label>
              <Input
                id="cred-accounts"
                value={form.accountIds}
                onChange={(e) => setForm((f) => ({ ...f, accountIds: e.target.value }))}
                placeholder={
                  form.platform === "meta" ? "act_123, act_456" : "advertiser ids"
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cred-version">API version (optional)</Label>
              <Input
                id="cred-version"
                value={form.apiVersion}
                onChange={(e) => setForm((f) => ({ ...f, apiVersion: e.target.value }))}
                placeholder={form.platform === "meta" ? "v25.0" : "v1.3"}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="cred-active"
                checked={form.isActive}
                onCheckedChange={(checked) => setForm((f) => ({ ...f, isActive: checked }))}
              />
              <Label htmlFor="cred-active">Active</Label>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2 border-t px-4 py-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
              }}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="button" onClick={() => void onSave()} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Save
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}
