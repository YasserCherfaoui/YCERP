import SqlEvidence from "@/components/feature-specific/ads-intelligence/sql-evidence";
import type { AdsChatUIMessage } from "@/models/data/ads-intelligence/chat.model";
import { cn } from "@/lib/utils";
import { Bot } from "lucide-react";
import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Props {
  message: AdsChatUIMessage;
}

const markdownComponents: Components = {
  p: ({ children }) => <p className="mb-3 leading-7 last:mb-0">{children}</p>,
  ul: ({ children }) => (
    <ul className="mb-3 list-disc space-y-1.5 pl-5 marker:text-muted-foreground last:mb-0">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-3 list-decimal space-y-1.5 pl-5 marker:text-muted-foreground last:mb-0">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-7 [&>p]:mb-1 [&>p:last-child]:mb-0">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  h1: ({ children }) => <h3 className="mb-2 mt-5 text-base font-semibold tracking-tight first:mt-0">{children}</h3>,
  h2: ({ children }) => <h3 className="mb-2 mt-5 text-base font-semibold tracking-tight first:mt-0">{children}</h3>,
  h3: ({ children }) => <h4 className="mb-2 mt-4 text-sm font-semibold tracking-tight first:mt-0">{children}</h4>,
  hr: () => <hr className="my-4 border-border" />,
  a: ({ href, children }) => (
    <a href={href} className="font-medium text-primary underline underline-offset-4" target="_blank" rel="noreferrer">
      {children}
    </a>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-3 border-l-2 border-primary/40 bg-muted/50 px-3 py-2 text-muted-foreground [&>p]:mb-0">
      {children}
    </blockquote>
  ),
  code: ({ className, children }) => {
    if (className) {
      return <code className={cn("font-mono text-[13px]", className)}>{children}</code>;
    }
    return (
      <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[0.8125rem] text-foreground">
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="my-3 overflow-x-auto rounded-lg border bg-muted/60 p-3 font-mono text-[13px] leading-6 last:mb-0">
      {children}
    </pre>
  ),
  table: ({ children }) => (
    <div className="my-3 overflow-x-auto rounded-lg border bg-card last:mb-0">
      <table className="w-full min-w-[28rem] border-collapse text-left text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-muted/80">{children}</thead>,
  th: ({ children }) => (
    <th className="whitespace-nowrap border-b px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border-b px-3 py-2 align-top leading-6 tabular-nums">{children}</td>
  ),
  tr: ({ children }) => <tr className="even:bg-muted/30">{children}</tr>,
};

export default function AiChatMessage({ message }: Props) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[min(100%,34rem)]">
          <p className="mb-1 text-right text-[11px] font-medium uppercase tracking-wide text-muted-foreground">You</p>
          <div className="rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5 text-sm leading-6 text-primary-foreground shadow-sm">
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          </div>
        </div>
      </div>
    );
  }

  const waiting = message.streaming && !message.content;

  return (
    <article className="min-w-0">
      <div className="mb-2 flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Bot className="h-4 w-4" aria-hidden />
        </span>
        <p className="text-sm font-medium">Analyst</p>
      </div>
      <div className="min-w-0 pl-9 text-sm text-foreground">
        {waiting ? (
          <div className="space-y-2 py-1" aria-label="Analyst is writing">
            <div className="h-2.5 w-4/5 rounded-full bg-muted motion-safe:animate-pulse" />
            <div className="h-2.5 w-3/5 rounded-full bg-muted motion-safe:animate-pulse" />
            <div className="h-2.5 w-2/5 rounded-full bg-muted motion-safe:animate-pulse" />
          </div>
        ) : (
          <div className="min-w-0 break-words">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
              {message.content}
            </ReactMarkdown>
            {message.streaming && (
              <span className="ml-0.5 inline-block h-4 w-px translate-y-0.5 bg-foreground motion-safe:animate-pulse" />
            )}
          </div>
        )}
        {message.sqlEvidence && message.sqlEvidence.length > 0 && (
          <div className="mt-3 space-y-2">
            {message.sqlEvidence.map((block, i) => (
              <SqlEvidence key={`${message.id}-sql-${i}`} evidence={block} />
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
