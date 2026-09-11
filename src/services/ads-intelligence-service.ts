import { getBaseUrl } from "@/app/constants";
import type {
  AdsChatMessageRecord,
  AdsChatSessionRecord,
  AdsTrueEconomicsRow,
} from "@/models/data/ads-intelligence/chat.model";
import type {
  AdsPlatformCredential,
  AdsPlatformCredentialCreate,
  AdsPlatformCredentialUpdate,
} from "@/models/data/ads-intelligence/credentials.model";
import type { APIResponse } from "@/models/responses/api-response.model";

const authHeaders = (): HeadersInit => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token") ?? ""}`,
});

export function buildAdsChatWebSocketUrl(token: string): string {
  const apiUrl = getBaseUrl();
  const proto = apiUrl.startsWith("https") ? "wss" : "ws";
  const host = apiUrl.replace(/^https?:\/\//, "");
  const enc = encodeURIComponent(token);
  return `${proto}://${host}/adsintel/chat/ws?token=${enc}`;
}

export async function getAdsChatSessions(): Promise<
  APIResponse<AdsChatSessionRecord[]>
> {
  const res = await fetch(`${getBaseUrl()}/adsintel/chat/sessions`, {
    method: "GET",
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message ?? "Failed to load chat sessions.");
  }
  return data as APIResponse<AdsChatSessionRecord[]>;
}

export async function getAdsChatMessages(
  sessionId: string,
): Promise<APIResponse<AdsChatMessageRecord[]>> {
  const res = await fetch(
    `${getBaseUrl()}/adsintel/chat/sessions/${encodeURIComponent(sessionId)}/messages`,
    {
      method: "GET",
      headers: authHeaders(),
    },
  );
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message ?? "Failed to load chat messages.");
  }
  return data as APIResponse<AdsChatMessageRecord[]>;
}

export async function getAdsTrueEconomics(
  platform?: string,
): Promise<APIResponse<AdsTrueEconomicsRow[]>> {
  const qs = platform ? `?platform=${encodeURIComponent(platform)}` : "";
  const res = await fetch(`${getBaseUrl()}/adsintel/economics/true${qs}`, {
    method: "GET",
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message ?? "Failed to load true economics.");
  }
  return data as APIResponse<AdsTrueEconomicsRow[]>;
}

export async function triggerMetaAdsSync(
  companyId: number,
): Promise<APIResponse<{ company_id: number; running: boolean }>> {
  const res = await fetch(
    `${getBaseUrl()}/adsintel/companies/${companyId}/sync/meta`,
    {
      method: "POST",
      headers: authHeaders(),
    },
  );
  const data = await res.json();
  // 202 Accepted = started in background; 409 = already running
  if (!res.ok && res.status !== 409) {
    throw new Error(
      data.error?.description ?? data.message ?? "Meta sync failed.",
    );
  }
  return data as APIResponse<{ company_id: number; running: boolean }>;
}

export async function triggerTikTokAdsSync(
  companyId: number,
): Promise<APIResponse<{ company_id: number; running: boolean }>> {
  const res = await fetch(
    `${getBaseUrl()}/adsintel/companies/${companyId}/sync/tiktok`,
    {
      method: "POST",
      headers: authHeaders(),
    },
  );
  const data = await res.json();
  if (!res.ok && res.status !== 409) {
    throw new Error(
      data.error?.description ?? data.message ?? "TikTok sync failed.",
    );
  }
  return data as APIResponse<{ company_id: number; running: boolean }>;
}

export interface AdsSyncPlatformStatus {
  running: boolean;
  last_run_at?: string;
  last_error?: string;
  report?: {
    Accounts: number;
    Campaigns: number;
    AdSets: number;
    Ads: number;
    Insights: number;
    Errors?: string[] | null;
  };
}

export async function getAdsCompanySyncStatus(
  companyId: number,
): Promise<
  APIResponse<{
    company_id: number;
    meta: AdsSyncPlatformStatus;
    tiktok: AdsSyncPlatformStatus;
  }>
> {
  const res = await fetch(
    `${getBaseUrl()}/adsintel/companies/${companyId}/sync/status`,
    {
      method: "GET",
      headers: authHeaders(),
    },
  );
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message ?? "Failed to load sync status.");
  }
  return data as APIResponse<{
    company_id: number;
    meta: AdsSyncPlatformStatus;
    tiktok: AdsSyncPlatformStatus;
  }>;
}

/** Poll until the platform sync finishes (or timeout). */
export async function waitForAdsSync(
  companyId: number,
  platform: "meta" | "tiktok",
  opts?: { intervalMs?: number; timeoutMs?: number },
): Promise<AdsSyncPlatformStatus> {
  const intervalMs = opts?.intervalMs ?? 2500;
  const timeoutMs = opts?.timeoutMs ?? 45 * 60 * 1000;
  const started = Date.now();

  // Brief delay so the worker can flip running=true before first poll.
  await new Promise((r) => setTimeout(r, 400));

  for (;;) {
    const res = await getAdsCompanySyncStatus(companyId);
    const snap = platform === "meta" ? res.data?.meta : res.data?.tiktok;
    if (!snap) {
      throw new Error("Sync status missing");
    }
    if (!snap.running) {
      return snap;
    }
    if (Date.now() - started > timeoutMs) {
      throw new Error("Timed out waiting for sync to finish");
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
}

export async function listAdsPlatformCredentials(
  companyId: number,
): Promise<APIResponse<AdsPlatformCredential[]>> {
  const res = await fetch(
    `${getBaseUrl()}/adsintel/companies/${companyId}/credentials`,
    {
      method: "GET",
      headers: authHeaders(),
    },
  );
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message ?? "Failed to load credentials.");
  }
  return data as APIResponse<AdsPlatformCredential[]>;
}

export async function createAdsPlatformCredential(
  companyId: number,
  body: AdsPlatformCredentialCreate,
): Promise<APIResponse<AdsPlatformCredential>> {
  const res = await fetch(
    `${getBaseUrl()}/adsintel/companies/${companyId}/credentials`,
    {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(body),
    },
  );
  const data = await res.json();
  if (!res.ok) {
    throw new Error(
      data.error?.description ?? data.message ?? "Failed to create credential.",
    );
  }
  return data as APIResponse<AdsPlatformCredential>;
}

export async function updateAdsPlatformCredential(
  companyId: number,
  id: number,
  body: AdsPlatformCredentialUpdate,
): Promise<APIResponse<AdsPlatformCredential>> {
  const res = await fetch(
    `${getBaseUrl()}/adsintel/companies/${companyId}/credentials/${id}`,
    {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(body),
    },
  );
  const data = await res.json();
  if (!res.ok) {
    throw new Error(
      data.error?.description ?? data.message ?? "Failed to update credential.",
    );
  }
  return data as APIResponse<AdsPlatformCredential>;
}

export async function deleteAdsPlatformCredential(
  companyId: number,
  id: number,
): Promise<APIResponse<unknown>> {
  const res = await fetch(
    `${getBaseUrl()}/adsintel/companies/${companyId}/credentials/${id}`,
    {
      method: "DELETE",
      headers: authHeaders(),
    },
  );
  const data = await res.json();
  if (!res.ok) {
    throw new Error(
      data.error?.description ?? data.message ?? "Failed to delete credential.",
    );
  }
  return data as APIResponse<unknown>;
}
