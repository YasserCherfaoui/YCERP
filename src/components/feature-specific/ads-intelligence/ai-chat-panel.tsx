import AiChatMessage from "@/components/feature-specific/ads-intelligence/ai-chat-message";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { useAdsIntelligenceChat } from "@/hooks/use-ads-intelligence-chat";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

interface Props {
  sessionId?: string | null;
  className?: string;
}

export default function AiChatPanel({ sessionId = null, className }: Props) {
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const {
    messages,
    connected,
    loading,
    thinking,
    sendMessage,
    startNewSession,
  } = useAdsIntelligenceChat(sessionId);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, thinking]);

  const onSend = () => {
    if (!draft.trim() || thinking) return;
    sendMessage(draft);
    setDraft("");
  };

  return (
    <div className={cn("flex h-full min-h-[420px] flex-col rounded-lg border", className)}>
      <div className="flex items-center justify-between gap-2 border-b px-3 py-2">
        <div>
          <p className="text-sm font-medium">Ads Analyst</p>
          <p className="text-xs text-muted-foreground">
            Answers use live SQL only — no invented numbers.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide",
              connected
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
                : "bg-muted text-muted-foreground",
            )}
          >
            {connected ? "Live" : "Offline"}
          </span>
          <Button variant="outline" size="sm" type="button" onClick={startNewSession}>
            New chat
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 px-3 py-3">
        <div className="flex flex-col gap-3">
          {loading && (
            <p className="text-xs text-muted-foreground">Loading conversation…</p>
          )}
          {!loading && messages.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Ask about true ROAS, campaign spend, delivery rates, or model funnel performance.
            </p>
          )}
          {messages.map((message) => (
            <AiChatMessage key={message.id} message={message} />
          ))}
          {thinking && (
            <p className="text-xs text-muted-foreground">Querying data…</p>
          )}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      <div className="border-t p-3">
        <div className="flex gap-2">
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="e.g. What is my Meta net profit this week?"
            rows={2}
            className="min-h-[56px] resize-none text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSend();
              }
            }}
          />
          <Button type="button" onClick={onSend} disabled={!connected || thinking || !draft.trim()}>
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}
