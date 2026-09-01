import type {
  AdsChatUIMessage,
  AdsSQLEvidence,
} from "@/models/data/ads-intelligence/chat.model";
import {
  buildAdsChatWebSocketUrl,
  getAdsChatMessages,
} from "@/services/ads-intelligence-service";
import { useCallback, useEffect, useRef, useState } from "react";

function parseEvidence(raw: unknown): AdsSQLEvidence[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw as AdsSQLEvidence[];
  return [raw as AdsSQLEvidence];
}

function recordsToUI(
  rows: Awaited<ReturnType<typeof getAdsChatMessages>>["data"],
): AdsChatUIMessage[] {
  return (rows ?? []).map((row) => ({
    id: String(row.id),
    role: row.role === "assistant" ? "assistant" : "user",
    content: row.content,
    sqlEvidence: parseEvidence(row.sql_evidence),
    createdAt: row.created_at,
  }));
}

export function useAdsIntelligenceChat(sessionId: string | null) {
  const [messages, setMessages] = useState<AdsChatUIMessage[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(sessionId);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [thinking, setThinking] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const streamIdRef = useRef<string | null>(null);
  const evidenceRef = useRef<AdsSQLEvidence[]>([]);

  useEffect(() => {
    setActiveSessionId(sessionId);
  }, [sessionId]);

  useEffect(() => {
    if (!activeSessionId) {
      setMessages([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    void getAdsChatMessages(activeSessionId)
      .then((res) => {
        if (!cancelled) setMessages(recordsToUI(res.data));
      })
      .catch(() => {
        if (!cancelled) setMessages([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeSessionId]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return undefined;

    const ws = new WebSocket(buildAdsChatWebSocketUrl(token));
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onerror = () => setConnected(false);

    ws.onmessage = (evt) => {
      try {
        const frame = JSON.parse(evt.data as string) as {
          event?: string;
          data?: unknown;
          code?: string;
        };

        if (frame.event === "session") {
          const sid = (frame.data as { session_id?: string })?.session_id;
          if (sid) setActiveSessionId(sid);
          return;
        }

        if (frame.event === "token") {
          const chunk = String(frame.data ?? "");
          const streamId = streamIdRef.current;
          if (!streamId) return;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === streamId ? { ...m, content: m.content + chunk } : m,
            ),
          );
          return;
        }

        if (frame.event === "sql_evidence") {
          evidenceRef.current = [...evidenceRef.current, frame.data as AdsSQLEvidence];
          const streamId = streamIdRef.current;
          if (!streamId) return;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === streamId
                ? { ...m, sqlEvidence: [...evidenceRef.current] }
                : m,
            ),
          );
          return;
        }

        if (frame.event === "done") {
          const payload = frame.data as {
            content?: string;
            sql_evidence?: AdsSQLEvidence[];
          };
          const streamId = streamIdRef.current;
          if (streamId) {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === streamId
                  ? {
                      ...m,
                      content: payload.content ?? m.content,
                      sqlEvidence:
                        payload.sql_evidence?.length
                          ? payload.sql_evidence
                          : m.sqlEvidence,
                      streaming: false,
                    }
                  : m,
              ),
            );
          }
          streamIdRef.current = null;
          evidenceRef.current = [];
          setThinking(false);
          return;
        }

        if (frame.event === "error") {
          streamIdRef.current = null;
          evidenceRef.current = [];
          setThinking(false);
        }
      } catch {
        /* ignore malformed frames */
      }
    };

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, []);

  const sendMessage = useCallback(
    (body: string) => {
      const trimmed = body.trim();
      if (!trimmed || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        return;
      }

      const userId = `local-user-${Date.now()}`;
      const assistantId = `local-assistant-${Date.now()}`;
      streamIdRef.current = assistantId;
      evidenceRef.current = [];

      setMessages((prev) => [
        ...prev,
        { id: userId, role: "user", content: trimmed },
        {
          id: assistantId,
          role: "assistant",
          content: "",
          streaming: true,
          sqlEvidence: [],
        },
      ]);
      setThinking(true);

      wsRef.current.send(
        JSON.stringify({
          type: "message",
          body: trimmed,
          session_id: activeSessionId ?? "",
        }),
      );
    },
    [activeSessionId],
  );

  const startNewSession = useCallback(() => {
    setActiveSessionId(null);
    setMessages([]);
  }, []);

  return {
    messages,
    connected,
    loading,
    thinking,
    activeSessionId,
    sendMessage,
    startNewSession,
    setActiveSessionId,
  };
}
