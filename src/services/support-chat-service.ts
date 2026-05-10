import { getBaseUrl } from "@/app/constants";
import type { FranchiseChatMessageRecord } from "@/models/data/franchise-chat-message.model";
import type { APIResponse } from "@/models/responses/api-response.model";

const authHeaders = (): HeadersInit => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token") ?? ""}`,
});

export async function getFranchiseSupportChatMessages(
  franchiseId: number,
  opts?: { limit?: number; before_id?: number; since_id?: number },
): Promise<APIResponse<FranchiseChatMessageRecord[]>> {
  const qs = new URLSearchParams();
  if (opts?.limit != null) qs.set("limit", String(opts.limit));
  if (opts?.before_id != null) qs.set("before_id", String(opts.before_id));
  if (opts?.since_id != null) qs.set("since_id", String(opts.since_id));
  const suffix = qs.toString() ? `?${qs.toString()}` : "";

  const res = await fetch(
    `${getBaseUrl()}/support/chat/franchises/${franchiseId}/messages${suffix}`,
    {
      method: "GET",
      headers: authHeaders(),
    },
  );

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message ?? "Failed to load support chat.");
  }
  return data as APIResponse<FranchiseChatMessageRecord[]>;
}

export function buildSupportChatWebSocketUrl(
  franchiseId: number,
  token: string,
): string {
  const apiUrl = getBaseUrl();
  const proto = apiUrl.startsWith("https") ? "wss" : "ws";
  const host = apiUrl.replace(/^https?:\/\//, "");
  const enc = encodeURIComponent(token);
  return `${proto}://${host}/support/chat/ws?franchise_id=${franchiseId}&token=${enc}`;
}
