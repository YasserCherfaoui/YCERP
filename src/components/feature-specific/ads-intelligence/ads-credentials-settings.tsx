import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
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
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
        <div>
          <CardTitle className="text-base">{title}</CardTitle>
          <CardDescription>
            Multiple connections supported. Leave account IDs empty to sync all accounts visible to the token.
          </CardDescription>
        </div>
        <Button size="sm" variant="outline" onClick={() => startCreate(platform)}>
          <Plus className="mr-1 h-4 w-4" />
          Add
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {list.length === 0 && (
          <p className="text-sm text-muted-foreground">No {platform} credentials yet.</p>
        )}
        {list.map((row) => (
          <div
            key={row.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border px-3 py-2"
          >
            <div className="min-w-0 space-y-0.5">
              <p className="truncate font-medium">
                {row.label || `${row.platform} #${row.id}`}
                {!row.is_active && (
                  <span className="ml-2 text-xs font-normal text-muted-foreground">(inactive)</span>
                )}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                Token: {row.access_token_masked || "—"}
                {row.account_ids?.length
                  ? ` · Accounts: ${row.account_ids.join(", ")}`
                  : " · All accounts"}
              </p>
            </div>
            <div className="flex gap-1">
              <Button size="icon" variant="ghost" onClick={() => startEdit(row)} aria-label="Edit">
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => void onDelete(row.id)}
                aria-label="Delete"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      {loading && (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading credentials…
        </p>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}

      {!loading && (
        <>
          {renderList("Meta", "meta", metaRows)}
          {renderList("TikTok", "tiktok", tiktokRows)}
        </>
      )}

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {editingId == null ? "Add credential" : "Edit credential"} ({form.platform})
            </CardTitle>
            <CardDescription>
              {editingId != null
                ? "Leave token fields blank to keep the stored secrets."
                : "Paste the platform access token for this connection."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => void onSave()} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
                disabled={saving}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
