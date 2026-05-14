import { RootState } from "@/app/store";
import { resolveFranchiseChatViewerFromBranches } from "@/lib/support-chat-viewer";
import { getFranchiseSupportChatUnreadCount } from "@/services/support-chat-service";
import { useQueries, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

const MAX_CAP = 100;
/** Rare fallback when the messages panel is closed (no WebSocket). */
const UNREAD_IDLE_REFETCH_MS = 120_000;

export const franchiseSupportChatUnreadRootKey = "franchise-support-chat-unread" as const;

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
    queryFn: async () => {
      const res = await getFranchiseSupportChatUnreadCount(franchiseId!);
      return res.data?.unread_count ?? 0;
    },
    enabled: Boolean(franchiseId && franchiseId > 0 && viewer),
    staleTime: 60_000,
    refetchInterval: opts.pollingEnabled ? UNREAD_IDLE_REFETCH_MS : false,
    refetchOnWindowFocus: true,
    placeholderData: 0,
  });

  const raw = query.data ?? 0;
  return {
    unreadCount: raw,
    showFloodedBadge: raw >= MAX_CAP,
  };
}

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
      queryFn: async () => {
        const res = await getFranchiseSupportChatUnreadCount(fid);
        return res.data?.unread_count ?? 0;
      },
      enabled: Boolean(viewer && uniqueSorted.length > 0),
      staleTime: 60_000,
      refetchInterval: UNREAD_IDLE_REFETCH_MS,
      refetchOnWindowFocus: true,
      placeholderData: 0,
    })),
  });

  const total = queries.reduce((s, q) => s + (q.data ?? 0), 0);
  const anyFlooded = queries.some((q) => (q.data ?? 0) >= MAX_CAP);

  const unreadByFranchiseId = useMemo(() => {
    const m: Record<number, number> = {};
    uniqueSorted.forEach((fid, i) => {
      m[fid] = queries[i]?.data ?? 0;
    });
    return m;
  }, [uniqueSorted, queries]);

  return {
    unreadCount: total,
    showFloodedBadge: anyFlooded || total >= MAX_CAP,
    unreadByFranchiseId,
  };
}
