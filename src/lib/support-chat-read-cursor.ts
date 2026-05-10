import {
  type FranchiseChatViewerIdentity,
  franchiseChatViewerStorageTag,
} from "@/lib/support-chat-viewer";

const PREFIX = "erp_fc_read:v1";

export function supportChatCursorKey(
  franchiseId: number,
  viewer: FranchiseChatViewerIdentity,
): string {
  const tag = franchiseChatViewerStorageTag(viewer);
  return `${PREFIX}:${tag}:${franchiseId}`;
}

/** `undefined` = never seeded in this browser; needs one-time backlog seed (`0` = synced empty thread). */
export function readSupportChatCursor(storageKey: string): number | undefined {
  try {
    const raw = localStorage.getItem(storageKey);
    if (raw == null || raw === "") return undefined;
    const n = Number(raw);
    return Number.isFinite(n) ? n : undefined;
  } catch {
    return undefined;
  }
}

export function writeSupportChatCursor(storageKey: string, messageId: number): void {
  try {
    if (!Number.isFinite(messageId) || messageId < 0) return;
    const floored = Math.floor(messageId);
    const prev = readSupportChatCursor(storageKey);
    const next = prev != null ? Math.max(prev, floored) : floored;
    localStorage.setItem(storageKey, String(next));
  } catch {
    /* private mode etc. */
  }
}
