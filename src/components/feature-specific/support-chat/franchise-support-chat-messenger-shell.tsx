import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Expand, Maximize2, Minimize2, Shrink, X } from "lucide-react";
import * as React from "react";

export type SupportChatMessengerDockSize = "default" | "expanded" | "fullscreen";

type Props = {
  title?: string;
  subtitle?: string;
  /** Left column; omit for single-franchise / full-width chat */
  sidebar?: React.ReactNode;
  children: React.ReactNode;
  /** FAB dock: add pointer-events on card. Page: in-flow sizing */
  position?: "fixed" | "inline";
  open?: boolean;
  onClose?: () => void;
  /** Inline page defaults to expanded height to match a typical open company dock */
  defaultSize?: SupportChatMessengerDockSize;
};

/**
 * Shared chrome for franchise support chat: same card, header, and resize controls
 * as the company/moderator messenger dock. Parent supplies fixed positioning for the FAB.
 */
export default function FranchiseSupportChatMessengerShell({
  title = "Messages",
  subtitle,
  sidebar,
  children,
  position = "fixed",
  open = true,
  onClose,
  defaultSize = "default",
}: Props) {
  const [dockSize, setDockSize] = React.useState<SupportChatMessengerDockSize>(defaultSize);

  React.useEffect(() => {
    if (!open) setDockSize(defaultSize);
  }, [open, defaultSize]);

  const showClose = Boolean(onClose);

  const sizeClasses =
    position === "fixed"
      ? cn(
          dockSize === "default" &&
            "h-[min(520px,calc(100vh-5rem))] w-[calc(100vw-2rem)] max-w-[420px]",
          dockSize === "expanded" &&
            "h-[min(88vh,calc(100vh-2.5rem))] w-[calc(100vw-1rem)] max-w-[min(96vw,840px)]",
          dockSize === "fullscreen" &&
            "fixed left-2 right-2 top-16 z-[55] mx-auto h-[calc(100vh-5rem)] max-h-[920px] w-auto max-w-6xl sm:left-4 sm:right-4 sm:top-20",
        )
      : cn(
          "mx-auto w-full",
          dockSize === "default" &&
            "min-h-[520px] h-[min(72vh,calc(100vh-10rem))] max-w-[420px]",
          dockSize === "expanded" &&
            "h-[min(88vh,calc(100vh-6rem))] max-w-[min(96vw,840px)]",
          dockSize === "fullscreen" &&
            "fixed inset-x-2 top-16 z-[55] mx-auto h-[calc(100vh-5rem)] max-h-[920px] w-auto max-w-6xl sm:inset-x-4 sm:top-20",
        );

  return (
    <Card
      className={cn(
        "flex flex-col overflow-hidden shadow-2xl transition-[width,height,max-width,max-height] duration-300 ease-out",
        position === "fixed" && "pointer-events-auto",
        sizeClasses,
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b px-3 py-2 sm:px-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold">{title}</p>
          {subtitle ? <p className="text-xs text-muted-foreground">{subtitle}</p> : null}
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          {dockSize === "fullscreen" ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              aria-label="Exit full screen"
              title="Exit full screen"
              onClick={() => setDockSize("expanded")}
            >
              <Shrink className="size-4" />
            </Button>
          ) : (
            <>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                aria-label={dockSize === "default" ? "Larger panel" : "Smaller panel"}
                title={dockSize === "default" ? "Larger panel" : "Smaller panel"}
                onClick={() => setDockSize((s) => (s === "default" ? "expanded" : "default"))}
              >
                {dockSize === "default" ? <Maximize2 className="size-4" /> : <Minimize2 className="size-4" />}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                aria-label="Full screen"
                title="Full screen"
                onClick={() => setDockSize("fullscreen")}
              >
                <Expand className="size-4" />
              </Button>
            </>
          )}
          {showClose ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              aria-label="Close chats"
              onClick={onClose}
            >
              <X className="size-4" />
            </Button>
          ) : null}
        </div>
      </div>
      <div
        className={cn(
          "flex min-h-0 flex-1 overflow-hidden",
          sidebar != null && "divide-x divide-border",
        )}
      >
        {sidebar != null ? (
          <aside
            className={cn(
              "overflow-y-auto overscroll-contain bg-muted/30 py-2",
              dockSize === "default" && "w-[38%] min-w-[136px] max-w-[180px]",
              dockSize === "expanded" && "w-[32%] min-w-[168px] max-w-[240px]",
              dockSize === "fullscreen" && "w-[260px] min-w-[220px] max-w-[300px] shrink-0",
            )}
          >
            {sidebar}
          </aside>
        ) : null}
        <section
          className={cn(
            "flex min-h-0 min-w-0 flex-1 flex-col bg-background",
            sidebar == null && "w-full",
          )}
        >
          {children}
        </section>
      </div>
    </Card>
  );
}
