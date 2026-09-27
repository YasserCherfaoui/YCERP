import type {
  AdsChatSessionRecord,
  AdsChatUIMessage,
  AdsSQLEvidence,
} from "@/models/data/ads-intelligence/chat.model";
import {
  buildAdsChatWebSocketUrl,
  getAdsChatMessages,
  getAdsChatSessions,
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
  const [activity, setActivity] = useState<string | null>(null);
  const [sessions, setSessions] = useState<AdsChatSessionRecord[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const refreshSessionsRef = useRef<() => void>(() => {});
  const streamIdRef = useRef<string | null>(null);
  const evidenceRef = useRef<AdsSQLEvidence[]>([]);
  const streamingRef = useRef(false);

  const refreshSessions = useCallback(() => {
    setSessionsLoading(true);
    void getAdsChatSessions()
      .then((res) => setSessions(res.data ?? []))
      .catch(() => setSessions([]))
      .finally(() => setSessionsLoading(false));
  }, []);

  useEffect(() => {
    refreshSessionsRef.current = refreshSessions;
  }, [refreshSessions]);

  useEffect(() => {
    refreshSessions();
  }, [refreshSessions]);

  useEffect(() => {
    setActiveSessionId(sessionId);
  }, [sessionId]);

  useEffect(() => {
    if (!activeSessionId) {
      if (!streamingRef.current) setMessages([]);
      return;
    }
    if (streamingRef.current) return;
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
          refreshSessionsRef.current();
          return;
        }

        if (frame.event === "status") {
          setActivity(frameText(frame.data) || "Working…");
          return;
        }

        if (frame.event === "token") {
          const chunk = frameText(frame.data);
          const streamId = streamIdRef.current;
          if (!streamId || !chunk) return;
          setActivity("Writing the answer…");
          setMessages((prev) =>
            prev.map((m) =>
              m.id === streamId ? { ...m, content: m.content + chunk } : m,
            ),
          );
          return;
        }

        if (frame.event === "sql_evidence") {
          setActivity("Reading the query results…");
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
          streamingRef.current = false;
          setActivity(null);
          setThinking(false);
          return;
        }

        if (frame.event === "error") {
          const streamId = streamIdRef.current;
          const detail = frameText(frame.data) || frame.code || "The analyst could not answer.";
          if (streamId) {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === streamId
                  ? { ...m, content: m.content || detail, streaming: false }
                  : m,
              ),
            );
          }
          streamIdRef.current = null;
          evidenceRef.current = [];
          streamingRef.current = false;
          setActivity(null);
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
      streamingRef.current = true;
      setActivity("Sending your question…");

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
    streamingRef.current = false;
    setActivity(null);
    setThinking(false);
    setActiveSessionId(null);
    setMessages([]);
  }, []);

  const selectSession = useCallback((id: string) => {
    if (streamingRef.current) return;
    setActivity(null);
    setThinking(false);
    setActiveSessionId(id);
  }, []);

  return {
    messages,
    sessions,
    sessionsLoading,
    connected,
    loading,
    thinking,
    activity,
    activeSessionId,
    sendMessage,
    startNewSession,
    selectSession,
    refreshSessions,
    setActiveSessionId,
  };
}

function frameText(data: unknown): string {
  if (typeof data === "string") return data;
  if (data && typeof data === "object" && "message" in data) {
    const message = (data as { message?: unknown }).message;
    if (typeof message === "string") return message;
  }
  return "";
}
