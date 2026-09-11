import { RootState } from "@/app/store";
import { franchiseSupportChatUnreadRootKey } from "@/hooks/use-franchise-support-chat-unread";
import {
  franchiseChatViewerStorageTag,
  resolveFranchiseChatViewerFromBranches,
} from "@/lib/support-chat-viewer";
import { buildSupportChatInboxWebSocketUrl } from "@/services/support-chat-service";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

const RECONNECT_MS = 2500;

interface InboxWsPayload {
  event?: string;
  data?: Record<string, unknown>;
}

function unreadQueryKey(franchiseId: number, viewerTag: string) {
  return [franchiseSupportChatUnreadRootKey, franchiseId, viewerTag] as const;
}

function applySnapshot(
  queryClient: ReturnType<typeof useQueryClient>,
  viewerTag: string,
  counts: Record<string, unknown> | undefined,
) {
  if (!counts) return;
  for (const [key, raw] of Object.entries(counts)) {
    const franchiseId = Number(key);
    const count = Number(raw);
    if (!Number.isFinite(franchiseId) || franchiseId <= 0 || !Number.isFinite(count)) {
      continue;
    }
    queryClient.setQueryData(unreadQueryKey(franchiseId, viewerTag), count);
  }
}

function applyUpdate(
  queryClient: ReturnType<typeof useQueryClient>,
  viewerTag: string,
  data: Record<string, unknown> | undefined,
) {
  if (!data) return;
  const franchiseId = Number(data.franchise_id);
  const count = Number(data.unread_count);
  if (!Number.isFinite(franchiseId) || franchiseId <= 0 || !Number.isFinite(count)) {
    return;
  }
  queryClient.setQueryData(unreadQueryKey(franchiseId, viewerTag), count);
}

interface Options {
  enabled?: boolean;
  companyId?: number;
}

/**
 * Maintains one inbox WebSocket per app shell; seeds and updates unread badge cache via push events.
 */
export function useSupportChatInbox({ enabled = true, companyId }: Options) {
  const { pathname } = useLocation();
  const queryClient = useQueryClient();
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

  const connectionGenRef = useRef(0);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shouldReconnectRef = useRef(true);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    shouldReconnectRef.current = true;
    if (!enabled || !viewer || !viewerTag) {
      return undefined;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      return undefined;
    }

    const connectionGen = ++connectionGenRef.current;
    const isActive = () => connectionGenRef.current === connectionGen;

    const scheduleReconnect = () => {
      if (!shouldReconnectRef.current || !isActive()) return;
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      reconnectRef.current = setTimeout(connect, RECONNECT_MS);
    };

    const detach = (ws: WebSocket) => {
      ws.onopen = null;
      ws.onclose = null;
      ws.onerror = null;
      ws.onmessage = null;
    };

    function connect() {
      if (!isActive()) return;

      const prev = wsRef.current;
      if (prev) {
        detach(prev);
        prev.close();
      }

      const url = buildSupportChatInboxWebSocketUrl(token, companyId);
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!isActive()) return;
      };

      ws.onmessage = (ev) => {
        if (!isActive()) return;
        try {
          const payload = JSON.parse(ev.data as string) as InboxWsPayload;
          if (payload.event === "unread_snapshot") {
            const counts = (payload.data?.counts ?? undefined) as
              | Record<string, unknown>
              | undefined;
            applySnapshot(queryClient, viewerTag, counts);
          } else if (payload.event === "unread_update") {
            applyUpdate(queryClient, viewerTag, payload.data);
          }
        } catch {
          /* malformed */
        }
      };

      ws.onerror = () => {
        if (!isActive()) return;
        ws.close();
      };

      ws.onclose = () => {
        if (!isActive()) return;
        scheduleReconnect();
      };
    }

    connect();

    return () => {
      connectionGenRef.current += 1;
      shouldReconnectRef.current = false;
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      const ws = wsRef.current;
      if (ws) {
        detach(ws);
        ws.close();
        wsRef.current = null;
      }
    };
  }, [enabled, companyId, viewer, viewerTag, queryClient]);
}
