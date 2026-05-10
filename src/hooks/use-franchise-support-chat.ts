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
  const queryClient = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);
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
      return undefined;
    }
    const token = localStorage.getItem("token");
    if (!token) {
      return undefined;
    }

    const scheduleReconnect = () => {
      if (!shouldReconnect.current) return;
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      reconnectRef.current = setTimeout(runConnect, 2500);
    };

    function runConnect() {
      wsRef.current?.close();
      const url = buildSupportChatWebSocketUrl(franchiseId, token);
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        // Avoid full history refetch (GET …?limit=80) on every connect — WS delivers new rows; if we
        // reconnected after missing traffic, pull only messages newer than what we already have.
        void (async () => {
          const prev = queryClient.getQueryData<FranchiseChatMessageRecord[]>(listKey) ?? [];
          const maxId = prev.reduce((m, r) => (r.ID > m ? r.ID : m), 0);
          if (maxId <= 0) return;
          const res = await getFranchiseSupportChatMessages(franchiseId, {
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
        setConnected(false);
        scheduleReconnect();
      };
      ws.onerror = () => {
        ws.close();
      };

      ws.onmessage = (ev) => {
        try {
          const payload = JSON.parse(ev.data as string) as {
            event?: string;
            data?: FranchiseChatMessageEventData;
          };
          if (payload.event === "message" && payload.data) {
            const rec = recordFromWsPayload(payload.data);
            queryClient.setQueryData<FranchiseChatMessageRecord[]>(listKey, (prev) =>
              mergeRecordsByID(prev, [rec]),
            );
          } else if (payload.event === "read_receipt") {
            void queryClient.invalidateQueries({ queryKey: listKey });
            void queryClient.invalidateQueries({ queryKey: ["franchise-support-chat-unread"] });
          }
        } catch {
          /* malformed */
        }
      };
    }

    runConnect();

    return () => {
      shouldReconnect.current = false;
      setConnected(false);
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      if (postSendInvalidateRef.current) clearTimeout(postSendInvalidateRef.current);
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [franchiseId, enabled, listKey, queryClient]);

  const sendBody = useCallback(
    (body: string) => {
      const ws = wsRef.current;
      const trimmed = body.trim();
      if (!ws || ws.readyState !== WebSocket.OPEN || !trimmed) return false;

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