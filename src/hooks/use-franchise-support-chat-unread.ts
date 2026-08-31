import { RootState } from "@/app/store";
import {
  franchiseChatViewerStorageTag,
  resolveFranchiseChatViewerFromBranches,
} from "@/lib/support-chat-viewer";
import { useQueries, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

const MAX_CAP = 100;

export const franchiseSupportChatUnreadRootKey = "franchise-support-chat-unread" as const;

/** Cache-only unread count; populated by {@link useSupportChatInbox} push events. */
export function useFranchiseSupportChatUnread(franchiseId: number | undefined) {
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
  const viewerTag = viewer ? franchiseChatViewerStorageTag(viewer) : "";

  const query = useQuery({
    queryKey:
      franchiseId != null && franchiseId > 0 && viewer
        ? [franchiseSupportChatUnreadRootKey, franchiseId, viewerTag]
        : [franchiseSupportChatUnreadRootKey, "off"],
    queryFn: () => 0,
    enabled: false,
    staleTime: Number.POSITIVE_INFINITY,
    initialData: 0,
  });

  const raw = query.data ?? 0;
  return {
    unreadCount: raw,
    showFloodedBadge: raw >= MAX_CAP,
  };
}

/** Aggregate unread from push-populated cache (one entry per franchise). */
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
  const viewerTag = viewer ? franchiseChatViewerStorageTag(viewer) : "";

  const uniqueSorted = useMemo(
    () => [...new Set(franchiseIds.filter((id) => id > 0))].sort((a, b) => a - b),
    [franchiseIds],
  );

  const queries = useQueries({
    queries: uniqueSorted.map((fid) => ({
      queryKey: [franchiseSupportChatUnreadRootKey, fid, viewerTag],
      queryFn: () => 0,
      enabled: false,
      staleTime: Number.POSITIVE_INFINITY,
      initialData: 0,
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
