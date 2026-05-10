import { RootState } from "@/app/store";
import {
  franchiseChatMessageIsFromViewerIdentity,
  resolveFranchiseChatViewerFromBranches,
} from "@/lib/support-chat-viewer";
import type { FranchiseChatViewerIdentity } from "@/lib/support-chat-viewer";
import {
  readSupportChatCursor,
  supportChatCursorKey,
  writeSupportChatCursor,
} from "@/lib/support-chat-read-cursor";
import { getFranchiseSupportChatMessages } from "@/services/support-chat-service";
import { useQueries, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

const MAX_SINCE_FETCH = 100;
/** Rare fallback sync when the panel is closed (no WebSocket); avoids hammering the API. */
const UNREAD_IDLE_REFETCH_MS = 120_000;
const HISTORY_SEED = 80;

export const franchiseSupportChatUnreadRootKey = "franchise-support-chat-unread" as const;

export async function fetchSupportChatUnreadCount(
  franchiseId: number,
  viewer: FranchiseChatViewerIdentity,
): Promise<number> {
  const key = supportChatCursorKey(franchiseId, viewer);
  const cursor = readSupportChatCursor(key);

  if (cursor === undefined) {
    const seed = await getFranchiseSupportChatMessages(franchiseId, { limit: HISTORY_SEED });
    const rows = seed.data ?? [];
    const maxId = rows.reduce((m, r) => (r.ID > m ? r.ID : m), 0);
    writeSupportChatCursor(key, maxId > 0 ? maxId : 0);
    return 0;
  }

  const res = await getFranchiseSupportChatMessages(franchiseId, {
    since_id: cursor,
    limit: MAX_SINCE_FETCH,
  });
  const incoming = res.data ?? [];
  let n = 0;
  for (const r of incoming) {
    if (!franchiseChatMessageIsFromViewerIdentity(r, viewer)) n += 1;
  }
  if (incoming.length >= MAX_SINCE_FETCH) {
    return Math.max(n, MAX_SINCE_FETCH);
  }
  return n;
}

/**
 * Messages from others after local read cursor. First visit seeds cursor to latest id (no backlog badge).
 */
export function useFranchiseSupportChatUnread(
  franchiseId: number | undefined,
  opts: { pollingEnabled: boolean },
) {
  const { pathname } = useLocation();
  const franchiseUser = useSelector((s: RootState) => s.franchise.user);
  const user = useSelector((s: RootState) => s.user.user);
  const administrator = useSelector((s: RootState) => s.auth.user);
  const viewer = useMemo(
    () =>
      resolveFranchiseChatViewerFromBranches(pathname, {
        franchiseUser,
        user,
        administrator,
      }),
    [pathname, franchiseUser?.ID, user?.ID, administrator?.ID],
  );
  const viewerTag = viewer ? `${viewer.role}:${viewer.id}` : "";

  const query = useQuery({
    queryKey:
      franchiseId != null && franchiseId > 0 && viewer
        ? [franchiseSupportChatUnreadRootKey, franchiseId, viewerTag]
        : [franchiseSupportChatUnreadRootKey, "off"],
    queryFn: () => fetchSupportChatUnreadCount(franchiseId!, viewer!),
    enabled: Boolean(franchiseId && franchiseId > 0 && viewer),
    staleTime: 60_000,
    refetchInterval: opts.pollingEnabled ? UNREAD_IDLE_REFETCH_MS : false,
    refetchOnWindowFocus: true,
    placeholderData: 0,
  });

  const raw = query.data ?? 0;
  return {
    unreadCount: raw,
    showFloodedBadge: raw >= MAX_SINCE_FETCH,
  };
}

/**
 * Sum of unread across franchise threads (company / moderator dock FAB).
 * Keeps a slow periodic refetch (since-cursor only, not full history) so sidebar badges stay fresh
 * while one thread is open — cheap compared to the main chat WebSocket fetch.
 */
export function useAggregateFranchiseSupportChatUnread(franchiseIds: number[]) {
  const { pathname } = useLocation();
  const franchiseUser = useSelector((s: RootState) => s.franchise.user);
  const user = useSelector((s: RootState) => s.user.user);
  const administrator = useSelector((s: RootState) => s.auth.user);
  const viewer = useMemo(
    () =>
      resolveFranchiseChatViewerFromBranches(pathname, {
        franchiseUser,
        user,
        administrator,
      }),
    [pathname, franchiseUser?.ID, user?.ID, administrator?.ID],
  );
  const viewerTag = viewer ? `${viewer.role}:${viewer.id}` : "";

  const uniqueSorted = useMemo(
    () => [...new Set(franchiseIds.filter((id) => id > 0))].sort((a, b) => a - b),
    [franchiseIds],
  );

  const queries = useQueries({
    queries: uniqueSorted.map((fid) => ({
      queryKey: [franchiseSupportChatUnreadRootKey, fid, viewerTag],
      queryFn: () =>
        viewer ? fetchSupportChatUnreadCount(fid, viewer) : Promise.resolve(0),
      enabled: Boolean(viewer && uniqueSorted.length > 0),
      staleTime: 60_000,
      refetchInterval: UNREAD_IDLE_REFETCH_MS,
      refetchOnWindowFocus: true,
      placeholderData: 0,
    })),
  });

  const total = queries.reduce((s, q) => s + (q.data ?? 0), 0);
  const anyFlooded = queries.some((q) => (q.data ?? 0) >= MAX_SINCE_FETCH);

  const unreadByFranchiseId = useMemo(() => {
    const m: Record<number, number> = {};
    uniqueSorted.forEach((fid, i) => {
      m[fid] = queries[i]?.data ?? 0;
    });
    return m;
  }, [uniqueSorted, queries]);

  return {
    unreadCount: total,
    showFloodedBadge: anyFlooded || total >= MAX_SINCE_FETCH,
    unreadByFranchiseId,
  };
}
