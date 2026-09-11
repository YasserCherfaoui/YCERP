import SqlEvidence from "@/components/feature-specific/ads-intelligence/sql-evidence";
import type { AdsChatUIMessage } from "@/models/data/ads-intelligence/chat.model";
import { cn } from "@/lib/utils";

interface Props {
  message: AdsChatUIMessage;
}

export default function AiChatMessage({ message }: Props) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex w-full",
        isUser ? "justify-end" : "justify-start",
      )}
    >
      <div
        className={cn(
          "max-w-[92%] rounded-2xl px-3 py-2 text-sm shadow-sm sm:max-w-[80%]",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-foreground",
        )}
      >
        <p className="whitespace-pre-wrap break-words">{message.content || (message.streaming ? "…" : "")}</p>
        {!isUser && message.sqlEvidence && message.sqlEvidence.length > 0 && (
          <div className="mt-2 space-y-2">
            {message.sqlEvidence.map((block, i) => (
              <SqlEvidence key={`${message.id}-sql-${i}`} evidence={block} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
