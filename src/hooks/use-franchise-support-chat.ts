import { store } from "@/app/store";
import { franchiseSupportChatUnreadRootKey } from "@/hooks/use-franchise-support-chat-unread";
import {
  isFranchiseChatMessageFromViewer,
  resolveFranchiseChatViewerFromBranches,
} from "@/lib/support-chat-viewer";
import type {
  FranchiseChatMessageEventData,
  FranchiseChatMessageRecord,
  FranchiseChatSenderActor,
} from "@/models/data/franchise-chat-message.model";
import {
  buildSupportChatWebSocketUrl,
  getFranchiseSupportChatMessages,
} from "@/services/support-chat-service";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

export interface FranchiseSupportChatUIMessage {
  uid: number;
  franchise_id: number;
  sender_actor: FranchiseChatSenderActor;
  sender_actor_id: number;
  sender_name: string;
  sender_email: string;
  body: string;
  sortTime: number;
  created_iso: string;
  /** ISO time when counterparty first read this message (outgoing read receipt). */
  seen_iso?: string | null;
}

function mergeRecordsByID(
  prev: FranchiseChatMessageRecord[] | undefined,
  incoming: FranchiseChatMessageRecord[],
): FranchiseChatMessageRecord[] {
  const byId = new Map<number, FranchiseChatMessageRecord>();
  (prev ?? []).forEach((r) => byId.set(r.ID, r));
  incoming.forEach((r) => {
    if (!r.ID) return;
    byId.set(r.ID, r);
  });
  return [...byId.values()].sort((a, b) => a.ID - b.ID);
}

/** WebSocket `gin.H` uses snake_case; normalize to the same shape as REST rows. */
function recordFromWsPayload(d: FranchiseChatMessageEventData): FranchiseChatMessageRecord {
  return {
    ID: d.id,
    CreatedAt: d.created_at,
    UpdatedAt: d.created_at,
    DeletedAt: null,
    franchise_id: d.franchise_id,
    sender_actor: d.sender_actor,
    sender_actor_id: d.sender_actor_id,
    sender_name: d.sender_name,
    sender_email: d.sender_email,
    body: d.body,
    seen_at: null,
  };
}

function normalizeFromRecord(row: FranchiseChatMessageRecord): FranchiseSupportChatUIMessage {
  const t = Date.parse(row.CreatedAt);
  return {
    uid: row.ID,
    franchise_id: row.franchise_id,
    sender_actor: row.sender_actor,
    sender_actor_id: row.sender_actor_id,
    sender_name: row.sender_name,
    sender_email: row.sender_email,
    body: row.body,
    sortTime: Number.isFinite(t) ? t : 0,
    created_iso: row.CreatedAt,
    seen_iso: row.seen_at ?? null,
  };
}

interface UseFranchiseSupportChatOptions {
  franchiseId?: number;
  enabled?: boolean;
}

export function useFranchiseSupportChat({
  franchiseId,
  enabled = true,
}: UseFranchiseSupportChatOptions) {
  const { pathname } = useLocation();
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;
  const queryClient = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);
  /** Franchise id for the socket in wsRef; guards sendBody when switching threads. */
  const wsFranchiseIdRef = useRef<number | null>(null);
  const connectionGenRef = useRef(0);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const postSendInvalidateRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shouldReconnect = useRef(true);
  const [connected, setConnected] = useState(false);

  const listKey = useMemo(() => ["franchise-support-chat", franchiseId] as const, [franchiseId]);

  const listQuery = useQuery({
    queryKey: listKey,
    queryFn: async () => {
      if (!franchiseId) return [];
      const res = await getFranchiseSupportChatMessages(franchiseId, { limit: 80 });
      return res.data ?? [];
    },
    enabled: !!franchiseId && enabled,
    staleTime: 20_000,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    shouldReconnect.current = true;
    if (!franchiseId || !enabled) {
      wsFranchiseIdRef.current = null;
      return undefined;
    }
    const token = localStorage.getItem("token");
    if (!token) {
      wsFranchiseIdRef.current = null;
      return undefined;
    }

    const connectionGen = ++connectionGenRef.current;
    const roomFranchiseId = franchiseId;

    /** After onclose, next onopen should catch up via GET since_id; first onopen of this effect has no prior close. */
    let resumeSyncAfterDisconnect = false;

    const isActiveConnection = () => connectionGenRef.current === connectionGen;

    const detachSocket = (ws: WebSocket) => {
      ws.onopen = null;
      ws.onclose = null;
      ws.onerror = null;
      ws.onmessage = null;
    };

    const scheduleReconnect = () => {
      if (!shouldReconnect.current || !isActiveConnection()) return;
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      reconnectRef.current = setTimeout(runConnect, 2500);
    };

    function runConnect() {
      if (!isActiveConnection()) return;

      const prev = wsRef.current;
      if (prev) {
        detachSocket(prev);
        prev.close();
      }

      const url = buildSupportChatWebSocketUrl(roomFranchiseId, token);
      const ws = new WebSocket(url);
      wsRef.current = ws;
      wsFranchiseIdRef.current = roomFranchiseId;

      ws.onopen = () => {
        if (!isActiveConnection() || wsRef.current !== ws) return;
        setConnected(true);
        if (!resumeSyncAfterDisconnect) {
          return;
        }
        resumeSyncAfterDisconnect = false;
        void (async () => {
          const prev = queryClient.getQueryData<FranchiseChatMessageRecord[]>(listKey) ?? [];
          const maxId = prev.reduce((m, r) => (r.ID > m ? r.ID : m), 0);
          if (maxId <= 0) return;
          const res = await getFranchiseSupportChatMessages(roomFranchiseId, {
            since_id: maxId,
            limit: 100,
          });
          const incoming = res.data ?? [];
          if (!incoming.length) return;
          queryClient.setQueryData<FranchiseChatMessageRecord[]>(listKey, (p) =>
            mergeRecordsByID(p ?? [], incoming),
          );
        })();
      };
      ws.onclose = () => {
        if (!isActiveConnection() || wsRef.current !== ws) return;
        wsFranchiseIdRef.current = null;
        resumeSyncAfterDisconnect = true;
        setConnected(false);
        scheduleReconnect();
      };
      ws.onerror = () => {
        if (!isActiveConnection() || wsRef.current !== ws) return;
        ws.close();
      };

      ws.onmessage = (ev) => {
        if (!isActiveConnection() || wsRef.current !== ws) return;
        try {
          const payload = JSON.parse(ev.data as string) as {
            event?: string;
            data?: FranchiseChatMessageEventData | Record<string, unknown>;
          };
          if (payload.event === "message" && payload.data && "id" in (payload.data as object)) {
            const rec = recordFromWsPayload(payload.data as FranchiseChatMessageEventData);
            queryClient.setQueryData<FranchiseChatMessageRecord[]>(listKey, (prev) =>
              mergeRecordsByID(prev, [rec]),
            );
          } else if (payload.event === "read_receipt" && payload.data && roomFranchiseId) {
            const d = payload.data as {
              franchise_id?: number;
              last_read_message_id?: number;
              reader_actor?: string;
              reader_id?: number;
            };
            if (d.franchise_id !== roomFranchiseId) return;

            const state = store.getState();
            const viewer = resolveFranchiseChatViewerFromBranches(pathnameRef.current, {
              franchiseUser: state.franchise.user,
              user: state.user.user,
              administrator: state.auth.user,
            });
            const isSelfReceipt =
              viewer != null &&
              d.reader_actor === viewer.role &&
              d.reader_id === viewer.id;

            const unreadKey = [franchiseSupportChatUnreadRootKey, roomFranchiseId] as const;

            if (isSelfReceipt) {
              void queryClient.invalidateQueries({ queryKey: unreadKey });
              return;
            }

            const upTo = d.last_read_message_id ?? 0;
            if (upTo > 0) {
              const nowIso = new Date().toISOString();
              queryClient.setQueryData<FranchiseChatMessageRecord[]>(listKey, (prev) => {
                if (!prev?.length) return prev;
                return prev.map((m) => {
                  if (m.ID > upTo || m.seen_at) return m;
                  const mine = isFranchiseChatMessageFromViewer(
                    {
                      sender_actor: m.sender_actor,
                      sender_actor_id: m.sender_actor_id,
                    },
                    pathnameRef.current,
                    state,
                  );
                  if (!mine) return m;
                  return { ...m, seen_at: nowIso };
                });
              });
            }
            void queryClient.invalidateQueries({ queryKey: unreadKey });
          }
        } catch {
          /* malformed */
        }
      };
    }

    runConnect();

    return () => {
      connectionGenRef.current += 1;
      shouldReconnect.current = false;
      setConnected(false);
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      if (postSendInvalidateRef.current) clearTimeout(postSendInvalidateRef.current);
      const ws = wsRef.current;
      if (ws && wsFranchiseIdRef.current === roomFranchiseId) {
        detachSocket(ws);
        ws.close();
        wsRef.current = null;
        wsFranchiseIdRef.current = null;
      }
    };
    // Intentionally omit `pathname`: including it tore down the socket on every route change and
    // caused reconnect storms + repeating GET …/messages?since_id=… + Live/… flicker.
  }, [franchiseId, enabled, listKey, queryClient]);

  const sendBody = useCallback(
    (body: string) => {
      const ws = wsRef.current;
      const trimmed = body.trim();
      if (
        !franchiseId ||
        wsFranchiseIdRef.current !== franchiseId ||
        !ws ||
        ws.readyState !== WebSocket.OPEN ||
        !trimmed
      ) {
        return false;
      }

      ws.send(JSON.stringify({ type: "message", body: trimmed }));
      /* Don't invalidate + refetch full page; broadcast (or incremental sync) updates the thread. */
      if (postSendInvalidateRef.current) clearTimeout(postSendInvalidateRef.current);
      postSendInvalidateRef.current = setTimeout(() => {
        void (async () => {
          const prev = queryClient.getQueryData<FranchiseChatMessageRecord[]>(listKey) ?? [];
          const maxId = prev.reduce((m, r) => (r.ID > m ? r.ID : m), 0);
          const res = await getFranchiseSupportChatMessages(franchiseId, {
            since_id: maxId,
            limit: 20,
          });
          const incoming = res.data ?? [];
          if (!incoming.length) return;
          queryClient.setQueryData<FranchiseChatMessageRecord[]>(listKey, (p) =>
            mergeRecordsByID(p ?? [], incoming),
          );
        })();
      }, 500);
      return true;
    },
    [listKey, queryClient, franchiseId],
  );

  const loadOlder = useCallback(async () => {
    if (!franchiseId) return;
    const curr = queryClient.getQueryData<FranchiseChatMessageRecord[]>(listKey);
    if (!curr?.length) return;
    const asc = [...curr].sort((a, b) => a.ID - b.ID);
    const earliest = asc[0];
    const res = await getFranchiseSupportChatMessages(franchiseId, {
      limit: 80,
      before_id: earliest.ID,
    });
    const incoming = res.data ?? [];
    if (!incoming.length) return;
    queryClient.setQueryData<FranchiseChatMessageRecord[]>(listKey, (prev) =>
      mergeRecordsByID(prev, incoming),
    );
  }, [franchiseId, listKey, queryClient]);

  const messages = useMemo(() => {
    const rows = listQuery.data ?? [];
    return rows.map(normalizeFromRecord).sort((a, b) => a.sortTime - b.sortTime);
  }, [listQuery.data]);

  const refresh = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: listKey });
  }, [listKey, queryClient]);

  return {
    messages,
    connected,
    loading: listQuery.isLoading,
    sendBody,
    refresh,
    loadOlder,
  };
}