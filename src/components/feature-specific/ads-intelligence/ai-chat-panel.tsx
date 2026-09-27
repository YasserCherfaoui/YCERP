import AiChatMessage from "@/components/feature-specific/ads-intelligence/ai-chat-message";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useAdsIntelligenceChat } from "@/hooks/use-ads-intelligence-chat";
import { cn } from "@/lib/utils";
import type { AdsChatSessionRecord } from "@/models/data/ads-intelligence/chat.model";
import { Bot, MessageSquarePlus, PanelLeft, Send, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Props {
  sessionId?: string | null;
  className?: string;
}

const SUGGESTIONS_KEY = "adsintel-chat-show-suggestions";

const questionSnippets = [
  "Which campaigns lost money after delivery?",
  "Compare Meta and TikTok net profit.",
  "Which campaigns have the highest return rate?",
  "What is the cost per delivered order, and in which currency is the spend?",
  "Which product models have the lowest confirm-to-deliver rate?",
  "Show campaigns that spent money but delivered no orders.",
];

function formatWhen(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function SessionList({
  sessions,
  loading,
  activeSessionId,
  disabled,
  onSelect,
  onNew,
}: {
  sessions: AdsChatSessionRecord[];
  loading: boolean;
  activeSessionId: string | null;
  disabled: boolean;
  onSelect: (id: string) => void;
  onNew: () => void;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col bg-muted/30">
      <div className="flex items-center justify-between gap-2 px-3 py-3">
        <p className="text-sm font-semibold tracking-tight">Chats</p>
        <Button type="button" size="sm" variant="outline" className="bg-background" onClick={onNew} disabled={disabled}>
          <MessageSquarePlus className="h-4 w-4" />
          New
        </Button>
      </div>
      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-1 px-2 pb-3">
          {loading &&
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="space-y-2 rounded-lg px-3 py-2.5">
                <Skeleton className="h-3.5 w-4/5" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            ))}
          {!loading && sessions.length === 0 && (
            <p className="px-3 py-6 text-sm leading-6 text-muted-foreground">
              Saved conversations appear here after you send a question.
            </p>
          )}
          {sessions.map((session) => {
            const active = session.id === activeSessionId;
            return (
              <button
                key={session.id}
                type="button"
                disabled={disabled}
                aria-current={active ? "true" : undefined}
                onClick={() => onSelect(session.id)}
                className={cn(
                  "cursor-pointer rounded-lg px-3 py-2.5 text-left transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                  active ? "bg-background text-foreground shadow-sm" : "hover:bg-background/70",
                )}
              >
                <p className="line-clamp-2 text-sm font-medium leading-5">{session.title || "Untitled chat"}</p>
                <p className="mt-1 text-xs text-muted-foreground">{formatWhen(session.updated_at)}</p>
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}

export default function AiChatPanel({ sessionId = null, className }: Props) {
  const [draft, setDraft] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(() => {
    return localStorage.getItem(SUGGESTIONS_KEY) !== "0";
  });
  const [historyOpen, setHistoryOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const {
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
  } = useAdsIntelligenceChat(sessionId);

  const streamedLength = messages.reduce((total, message) => total + message.content.length, 0);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, streamedLength, thinking, activity]);

  const toggleSuggestions = () => {
    setShowSuggestions((current) => {
      const next = !current;
      localStorage.setItem(SUGGESTIONS_KEY, next ? "1" : "0");
      return next;
    });
  };

  const onSend = () => {
    if (!draft.trim() || thinking) return;
    sendMessage(draft);
    setDraft("");
  };

  const askSnippet = (question: string) => {
    if (thinking) return;
    if (!connected) {
      setDraft(question);
      return;
    }
    sendMessage(question);
  };

  const openSession = (id: string) => {
    selectSession(id);
    setHistoryOpen(false);
  };

  const sessionList = (
    <SessionList
      sessions={sessions}
      loading={sessionsLoading}
      activeSessionId={activeSessionId}
      disabled={thinking}
      onSelect={openSession}
      onNew={() => {
        startNewSession();
        setHistoryOpen(false);
      }}
    />
  );

  return (
    <div
      className={cn(
        "grid h-full min-h-[32rem] overflow-hidden rounded-xl border bg-card shadow-sm lg:grid-cols-[17rem_minmax(0,1fr)]",
        className,
      )}
    >
      <aside className="hidden min-h-0 border-r lg:block">{sessionList}</aside>

      <div className="flex min-h-0 min-w-0 flex-col bg-background">
        <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <Sheet open={historyOpen} onOpenChange={setHistoryOpen}>
              <SheetTrigger asChild>
                <Button type="button" size="icon" variant="outline" className="lg:hidden" aria-label="Previous chats">
                  <PanelLeft className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[min(100%,20rem)] p-0">
                <SheetHeader className="sr-only">
                  <SheetTitle>Previous chats</SheetTitle>
                </SheetHeader>
                {sessionList}
              </SheetContent>
            </Sheet>
            <span className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary sm:flex">
              <Bot className="h-4 w-4" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold tracking-tight">Ads Analyst</p>
              <p className="truncate text-xs text-muted-foreground">Live queries only. Each answer can show its SQL.</p>
            </div>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <span
              className={cn("h-2 w-2 rounded-full", connected ? "bg-emerald-500" : "bg-muted-foreground/50")}
              aria-hidden
            />
            {connected ? "Live" : "Offline"}
          </span>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-6 sm:px-6">
            {loading && (
              <div className="space-y-3" aria-label="Loading conversation">
                <Skeleton className="ml-auto h-12 w-2/3 rounded-2xl" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-5/6" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            )}
            {!loading && messages.length === 0 && (
              <div className="flex flex-col items-start gap-5 py-8 sm:py-14">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Bot className="h-5 w-5" aria-hidden />
                </span>
                <div className="max-w-lg space-y-2">
                  <h2 className="text-xl font-semibold tracking-tight">Ask about delivered profit</h2>
                  <p className="text-sm leading-7 text-muted-foreground">
                    Campaign spend, confirmation, delivery, and product models. Numbers come from the database, not from guesses.
                  </p>
                </div>
                {showSuggestions && (
                  <div className="grid w-full gap-2 sm:grid-cols-2">
                    {questionSnippets.map((question) => (
                      <button
                        key={question}
                        type="button"
                        disabled={thinking}
                        onClick={() => askSnippet(question)}
                        className="cursor-pointer rounded-lg border bg-card px-3 py-3 text-left text-sm leading-6 transition-colors duration-200 hover:border-primary/40 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            {messages.map((message) => (
              <AiChatMessage key={message.id} message={message} />
            ))}
            <div ref={bottomRef} />
          </div>
        </div>

        <div className="border-t bg-card/60 px-3 py-3 sm:px-4" aria-live="polite">
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-2">
            {thinking && (
              <p className="flex items-center gap-2 px-1 text-sm text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-primary motion-safe:animate-pulse" aria-hidden />
                {activity ?? "The analyst is working on your question…"}
              </p>
            )}
            {showSuggestions && messages.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {questionSnippets.map((question) => (
                  <button
                    key={question}
                    type="button"
                    disabled={thinking}
                    onClick={() => askSnippet(question)}
                    className="shrink-0 cursor-pointer rounded-full border bg-background px-3 py-1.5 text-left text-xs leading-5 transition-colors duration-200 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {question}
                  </button>
                ))}
              </div>
            )}
            <form
              className="rounded-xl border bg-background shadow-sm transition-shadow duration-200 focus-within:ring-2 focus-within:ring-ring"
              onSubmit={(event) => {
                event.preventDefault();
                onSend();
              }}
            >
              <label htmlFor="ads-analyst-message" className="sr-only">
                Message the ads analyst
              </label>
              <Textarea
                id="ads-analyst-message"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Ask about a campaign, a return rate, or a product model"
                rows={2}
                className="min-h-[52px] resize-none border-0 bg-transparent px-3 py-3 text-sm shadow-none focus-visible:ring-0"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    onSend();
                  }
                }}
              />
              <div className="flex items-center justify-between gap-2 px-2 pb-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  aria-pressed={showSuggestions}
                  onClick={toggleSuggestions}
                >
                  <Sparkles className="h-4 w-4" />
                  {showSuggestions ? "Hide suggestions" : "Show suggestions"}
                </Button>
                <Button type="submit" size="icon" disabled={!connected || thinking || !draft.trim()} aria-label="Send message">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
