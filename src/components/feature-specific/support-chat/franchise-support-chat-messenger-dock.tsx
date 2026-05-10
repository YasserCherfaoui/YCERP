import { RootState } from "@/app/store";
import FranchiseSupportChatPanel from "@/components/feature-specific/support-chat/franchise-support-chat-panel";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getMyCompanyFranchises } from "@/services/franchise-service";
import { useQuery } from "@tanstack/react-query";
import { Expand, Maximize2, MessageCircle, Minimize2, Shrink, X } from "lucide-react";
import * as React from "react";
import { useSelector } from "react-redux";
import { useLocation, useParams } from "react-router-dom";

type Props = {
  /** Set when rendering under `/company/:companyID/…` */
  companyId?: number | null;
};

/**
 * Floating Messenger-style launcher: FAB opens a panel listing company franchises with per-franchise support chat.
 * Used under moderator routes (no URL company id — reads Redux company) and company admin layout (explicit company id).
 */
export default function FranchiseSupportChatMessengerDock({ companyId: companyIdFromRoute }: Props) {
  const location = useLocation();
  const params = useParams();
  const isModeratorShell = location.pathname.startsWith("/moderator");
  const user = useSelector((s: RootState) => s.user.user);

  const companyIdFromModerator =
    user?.company?.ID ?? (user?.company_id != null ? Number(user.company_id) : NaN);

  const effectiveCompanyId =
    isModeratorShell && Number.isFinite(companyIdFromModerator)
      ? companyIdFromModerator
      : companyIdFromRoute ?? NaN;

  if (
    isModeratorShell &&
    user &&
    (user.role === "orders_manager" || user.role === "franchise_moderator")
  ) {
    return null;
  }

  if (!Number.isFinite(effectiveCompanyId) || effectiveCompanyId <= 0) {
    return null;
  }

  return (
    <MessengerDockInner
      companyId={effectiveCompanyId}
      routeFranchiseId={
        params.franchiseID && !Number.isNaN(Number(params.franchiseID))
          ? Number(params.franchiseID)
          : undefined
      }
    />
  );
}

function MessengerDockInner({
  companyId,
  routeFranchiseId,
}: {
  companyId: number;
  routeFranchiseId?: number;
}) {
  type DockSize = "default" | "expanded" | "fullscreen";
  const [open, setOpen] = React.useState(false);
  const [dockSize, setDockSize] = React.useState<DockSize>("default");
  const [selectedFranchiseId, setSelectedFranchiseId] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (!open) setDockSize("default");
  }, [open]);

  const { data: franchiseRes } = useQuery({
    queryKey: ["support-chat-franchises", companyId],
    queryFn: () => getMyCompanyFranchises(companyId),
    enabled: companyId > 0,
    staleTime: 60 * 1000,
  });

  const franchises = React.useMemo(() => {
    const list = franchiseRes?.data ?? [];
    return [...list].sort((a, b) =>
      String(a?.name ?? "").localeCompare(String(b?.name ?? ""), undefined, { sensitivity: "base" }),
    );
  }, [franchiseRes?.data]);

  React.useEffect(() => {
    if (!routeFranchiseId || franchises.length === 0) return;
    if (franchises.some((f) => f.ID === routeFranchiseId)) {
      setSelectedFranchiseId(routeFranchiseId);
    }
  }, [routeFranchiseId, franchises]);

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3 md:bottom-6 md:right-6">
      {!open ? (
        <Button
          type="button"
          size="lg"
          className="pointer-events-auto h-14 w-14 rounded-full shadow-lg"
          aria-label="Open franchise support chats"
          onClick={() => setOpen(true)}
        >
          <MessageCircle className="size-7" aria-hidden />
        </Button>
      ) : (
        <Card
          className={cn(
            "pointer-events-auto flex flex-col overflow-hidden shadow-2xl transition-[width,height,max-width,max-height] duration-300 ease-out",
            dockSize === "default" &&
              "h-[min(520px,calc(100vh-5rem))] w-[calc(100vw-2rem)] max-w-[420px]",
            dockSize === "expanded" &&
              "h-[min(88vh,calc(100vh-2.5rem))] w-[calc(100vw-1rem)] max-w-[min(96vw,840px)]",
            dockSize === "fullscreen" &&
              "fixed left-2 right-2 top-16 z-[55] mx-auto h-[calc(100vh-5rem)] max-h-[920px] w-auto max-w-6xl sm:left-4 sm:right-4 sm:top-20",
          )}
        >
          <div className="flex items-center justify-between gap-2 border-b px-3 py-2 sm:px-4">
            <div className="min-w-0">
              <p className="text-sm font-semibold">Messages</p>
              <p className="text-xs text-muted-foreground">Chat with franchises</p>
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
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                aria-label="Close chats"
                onClick={() => setOpen(false)}
              >
                <X className="size-4" />
              </Button>
            </div>
          </div>
          <div className="flex min-h-0 flex-1 divide-x overflow-hidden">
            <aside
              className={cn(
                "overflow-y-auto overscroll-contain bg-muted/30 py-2",
                dockSize === "default" && "w-[38%] min-w-[136px] max-w-[180px]",
                dockSize === "expanded" && "w-[32%] min-w-[168px] max-w-[240px]",
                dockSize === "fullscreen" && "w-[260px] min-w-[220px] max-w-[300px] shrink-0",
              )}
            >
              {franchises.length === 0 ? (
                <p className="px-2 text-center text-xs text-muted-foreground">No franchises</p>
              ) : (
                <ul className="flex flex-col gap-px">
                  {franchises.map((f) => (
                    <li key={f.ID}>
                      <button
                        type="button"
                        className={cn(
                          "w-full px-2 py-2 text-left text-xs transition-colors hover:bg-muted",
                          selectedFranchiseId === f.ID &&
                            "bg-primary/10 font-medium text-primary border-l-2 border-primary",
                        )}
                        onClick={() => setSelectedFranchiseId(f.ID)}
                      >
                        <span className="line-clamp-2">{f.name ?? `Franchise #${f.ID}`}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </aside>
            <section className="flex min-h-0 min-w-0 flex-1 flex-col bg-background">
              {selectedFranchiseId ? (
                <FranchiseSupportChatPanel franchiseId={selectedFranchiseId} embedded />
              ) : (
                <div className="flex h-full items-center justify-center p-6 text-center text-sm text-muted-foreground">
                  Select a franchise to open its chat.
                </div>
              )}
            </section>
          </div>
        </Card>
      )}
    </div>
  );
}
