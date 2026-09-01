import { getBaseUrl } from "@/app/constants";
import type {
  AdsChatMessageRecord,
  AdsChatSessionRecord,
  AdsTrueEconomicsRow,
} from "@/models/data/ads-intelligence/chat.model";
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

export async function triggerMetaAdsSync(): Promise<APIResponse<unknown>> {
  const res = await fetch(`${getBaseUrl()}/adsintel/sync/meta`, {
    method: "POST",
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message ?? "Meta sync failed.");
  }
  return data as APIResponse<unknown>;
}

export async function triggerTikTokAdsSync(): Promise<APIResponse<unknown>> {
  const res = await fetch(`${getBaseUrl()}/adsintel/sync/tiktok`, {
    method: "POST",
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message ?? "TikTok sync failed.");
  }
  return data as APIResponse<unknown>;
}
