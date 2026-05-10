import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { type FranchiseSupportChatUIMessage, useFranchiseSupportChat } from "@/hooks/use-franchise-support-chat";
import { useSupportChatIsOwnMessage } from "@/hooks/use-support-chat-viewer";
import { cn } from "@/lib/utils";
import { type RefObject, useEffect, useRef, useState } from "react";

interface Props {
  franchiseId?: number;
  className?: string;
  title?: string;
  /** Omit outer Card chrome for embedding in docks / drawers */
  embedded?: boolean;
}

export default function FranchiseSupportChatPanel({
  franchiseId,
  className,
  title = "Support chat",
  embedded = false,
}: Props) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [draft, setDraft] = useState("");
  const isOwnMessage = useSupportChatIsOwnMessage();
  const { messages, connected, loading, sendBody, loadOlder, refresh } =
    useFranchiseSupportChat({
      franchiseId,
      enabled: franchiseId !== undefined && franchiseId > 0,
    });

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  const onSend = () => {
    if (!draft.trim()) return;
    sendBody(draft);
    setDraft("");
  };

  if (!franchiseId || franchiseId <= 0) {
    return null;
  }

  if (embedded) {
    return (
      <div className={cn("flex h-full min-h-0 flex-1 flex-col", className)}>
        <EmbeddedHeader franchiseId={franchiseId} connected={connected} loading={loading} onRefresh={() => void refresh()} />
        <div className="flex min-h-0 flex-1 flex-col gap-2 p-3 pt-2">
          <Toolbar
            loadOlder={() => void loadOlder()}
            loading={loading}
            scrollRef={scrollRef}
            messages={messages}
            isOwnMessage={isOwnMessage}
            embedded
          />
          <Composer
            draft={draft}
            setDraft={setDraft}
            onSend={onSend}
            rows={2}
            minHClass="min-h-[56px]"
            textareaClass="text-sm"
          />
        </div>
      </div>
    );
  }

  return (
    <Card className={cn("w-full max-w-4xl mx-auto", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>
              Conversation with headquarters for this franchise. Messages are saved.
            </CardDescription>
          </div>
          <div className="flex flex-col items-end gap-2 text-sm">
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-xs font-medium",
                connected ? "bg-emerald-100 text-emerald-800" : "bg-muted text-muted-foreground",
              )}
            >
              {connected ? "Live" : "Reconnecting…"}
            </span>
            <Button variant="outline" size="sm" type="button" onClick={() => void refresh()} disabled={loading}>
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <Toolbar
          loadOlder={() => void loadOlder()}
          loading={loading}
          scrollRef={scrollRef}
          messages={messages}
          isOwnMessage={isOwnMessage}
        />
        <Composer
          draft={draft}
          setDraft={setDraft}
          onSend={onSend}
          rows={3}
          minHClass="min-h-[80px]"
        />
      </CardContent>
    </Card>
  );
}

function EmbeddedHeader({
  franchiseId,
  connected,
  loading,
  onRefresh,
}: {
  franchiseId: number;
  connected: boolean;
  loading: boolean;
  onRefresh: () => void;
}) {
  return (
    <div className="flex shrink-0 items-center justify-between gap-2 border-b px-3 py-2">
      <p className="truncate text-xs font-medium text-muted-foreground">Franchise #{franchiseId}</p>
      <div className="flex shrink-0 items-center gap-2">
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide",
            connected
              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
              : "bg-muted text-muted-foreground",
          )}
        >
          {connected ? "Live" : "…"}
        </span>
        <Button
          variant="outline"
          size="sm"
          type="button"
          className="h-7 px-2 text-xs"
          onClick={onRefresh}
          disabled={loading}
        >
          Refresh
        </Button>
      </div>
    </div>
  );
}

function Toolbar({
  loadOlder,
  loading,
  scrollRef,
  messages,
  isOwnMessage,
  embedded = false,
}: {
  loadOlder: () => void;
  loading: boolean;
  scrollRef: RefObject<HTMLDivElement | null>;
  messages: FranchiseSupportChatUIMessage[];
  isOwnMessage: (m: FranchiseSupportChatUIMessage) => boolean;
  embedded?: boolean;
}) {
  const scrollInner = (
    <div className={cn("flex flex-col gap-3 p-3", embedded && "gap-2.5 p-2.5")}>
      {messages.map((m) => (
        <Bubble key={m.uid} message={m} compact={embedded} isOwn={isOwnMessage(m)} />
      ))}
      <div ref={scrollRef} className="h-px w-full shrink-0" aria-hidden />
    </div>
  );

  if (embedded) {
    return (
      <div className="flex min-h-0 flex-1 flex-col gap-2">
        <div className="flex shrink-0 justify-between gap-2">
          <Button type="button" variant="ghost" size="sm" className="h-8 px-2 text-xs" onClick={loadOlder} disabled={loading}>
            Load older
          </Button>
        </div>
        <ScrollArea className="min-h-0 flex-1 rounded-xl border border-border/60 bg-background/50 [&>div]:h-full">
          {scrollInner}
        </ScrollArea>
      </div>
    );
  }

  return (
    <>
      <div className={cn("flex justify-between gap-2")}>
        <Button type="button" variant="ghost" size="sm" onClick={loadOlder} disabled={loading}>
          Load older
        </Button>
      </div>
      <ScrollArea className={cn("h-80 rounded-xl border border-border/60 bg-background/50")}>
        {scrollInner}
      </ScrollArea>
    </>
  );
}

function Composer({
  draft,
  setDraft,
  onSend,
  rows,
  minHClass,
  textareaClass,
}: {
  draft: string;
  setDraft: (v: string) => void;
  onSend: () => void;
  rows: number;
  minHClass: string;
  textareaClass?: string;
}) {
  return (
    <div className="flex flex-shrink-0 flex-col gap-2 sm:flex-row sm:items-end sm:rounded-2xl sm:border sm:border-border/70 sm:bg-muted/30 sm:p-2">
      <Textarea
        placeholder="Write a message…"
        rows={rows}
        className={cn(
          "resize-none rounded-xl border-transparent bg-background shadow-none focus-visible:ring-2 focus-visible:ring-ring",
          minHClass,
          textareaClass,
        )}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
            e.preventDefault();
            onSend();
          }
        }}
      />
      <Button
        type="button"
        onClick={onSend}
        className={cn(
          "rounded-xl sm:shrink-0",
          rows <= 2 ? "h-9 sm:w-[4.75rem]" : "md:w-32 shrink-0",
        )}
      >
        Send
      </Button>
    </div>
  );
}

function Bubble({
  message,
  compact = false,
  isOwn,
}: {
  message: FranchiseSupportChatUIMessage;
  compact?: boolean;
  isOwn: boolean;
}) {
  const who =
    message.sender_actor === "franchise_administrator"
      ? "Franchise"
      : message.sender_actor === "administrator"
        ? "Admin"
        : "Moderator";

  const when = formatTime(message.created_iso);
  const displayName = message.sender_name?.trim() || message.sender_email || who;

  return (
    <div
      className={cn("flex w-full flex-col", isOwn ? "items-end" : "items-start")}
    >
      {!isOwn ? (
        <div
          className={cn(
            "mb-1 max-w-[min(92%,420px)] px-1 text-muted-foreground",
            compact ? "text-[10px]" : "text-xs",
          )}
        >
          <span className="font-medium text-foreground">{displayName}</span>
          <span className="text-muted-foreground"> · {who}</span>
        </div>
      ) : null}

      <div
        className={cn(
          "max-w-[min(92%,420px)] rounded-2xl px-3.5 py-2.5 shadow-sm",
          compact && "max-w-[min(96%,360px)] px-3 py-2",
          isOwn
            ? "rounded-br-md bg-primary text-primary-foreground"
            : "rounded-bl-md border border-border/70 bg-muted/90 text-foreground dark:bg-muted/50",
        )}
      >
        <p
          className={cn(
            "whitespace-pre-wrap break-words leading-relaxed",
            compact ? "text-xs" : "text-[15px]",
          )}
        >
          {message.body}
        </p>
        <div
          className={cn(
            "mt-1.5 text-[10px] tabular-nums",
            isOwn ? "text-right text-primary-foreground/70" : "text-left text-muted-foreground",
            compact && "mt-1 text-[9px]",
          )}
        >
          {isOwn ? `You · ${when}` : when}
        </div>
      </div>
    </div>
  );
}

function formatTime(iso: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}
