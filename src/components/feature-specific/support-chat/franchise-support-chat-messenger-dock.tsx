import { RootState } from "@/app/store";
import FranchiseSupportChatMessengerShell from "@/components/feature-specific/support-chat/franchise-support-chat-messenger-shell";
import FranchiseSupportChatPanel from "@/components/feature-specific/support-chat/franchise-support-chat-panel";
import { Button } from "@/components/ui/button";
import {
  useAggregateFranchiseSupportChatUnread,
  useFranchiseSupportChatUnread,
} from "@/hooks/use-franchise-support-chat-unread";
import { cn } from "@/lib/utils";
import { getMyCompanyFranchises } from "@/services/franchise-service";
import { useQuery } from "@tanstack/react-query";
import { MessageCircle } from "lucide-react";
import * as React from "react";
import { useSelector } from "react-redux";
import { useLocation, useParams } from "react-router-dom";

type Props = {
  /** Set when rendering under `/company/:companyID/…` */
  companyId?: number | null;
};

function SupportChatMessagesFab({
  ariaLabelBase,
  unreadCount,
  showFloodedBadge,
  onClick,
}: {
  ariaLabelBase: string;
  unreadCount: number;
  showFloodedBadge: boolean;
  onClick: () => void;
}) {
  const showBadge = unreadCount > 0;
  const badgeText = showFloodedBadge || unreadCount >= 100 ? "99+" : String(unreadCount);
  const ariaLabel = showBadge
    ? `${ariaLabelBase} (${showFloodedBadge || unreadCount >= 100 ? "many" : unreadCount} unread)`
    : ariaLabelBase;

  return (
    <div className="pointer-events-auto relative">
      <Button
        type="button"
        size="lg"
        className="h-14 w-14 rounded-full shadow-lg"
        aria-label={ariaLabel}
        onClick={onClick}
      >
        <MessageCircle className="size-7" aria-hidden />
      </Button>
      {showBadge ? (
        <span
          className="absolute -right-0.5 -top-0.5 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold leading-none tabular-nums text-destructive-foreground shadow-md ring-2 ring-background"
          aria-hidden
        >
          {badgeText}
        </span>
      ) : null}
    </div>
  );
}

/**
 * Same FAB + expandable Messages panel as {@link FranchiseSupportChatMessengerDock}, but for the franchise portal:
 * single thread with HQ (no franchise list sidebar).
 */
export function FranchiseSupportChatMessengerDockFranchiseApp() {
  const franchise = useSelector((s: RootState) => s.franchise.franchise);
  const franchiseId = franchise?.ID;
  const [open, setOpen] = React.useState(false);
  const { unreadCount, showFloodedBadge } = useFranchiseSupportChatUnread(franchiseId, {
    pollingEnabled: !open,
  });

  if (!franchiseId || franchiseId <= 0) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3 md:bottom-6 md:right-6">
      {!open ? (
        <SupportChatMessagesFab
          ariaLabelBase="Open messages with headquarters"
          unreadCount={unreadCount}
          showFloodedBadge={showFloodedBadge}
          onClick={() => setOpen(true)}
        />
      ) : (
        <FranchiseSupportChatMessengerShell
          position="fixed"
          open={open}
          onClose={() => setOpen(false)}
          subtitle="Chat with headquarters"
        >
          <FranchiseSupportChatPanel franchiseId={franchiseId} />
        </FranchiseSupportChatMessengerShell>
      )}
    </div>
  );
}

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
  const [open, setOpen] = React.useState(false);
  const [selectedFranchiseId, setSelectedFranchiseId] = React.useState<number | null>(null);

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

  const franchiseIds = React.useMemo(() => franchises.map((f) => f.ID), [franchises]);
  const { unreadCount, showFloodedBadge, unreadByFranchiseId } =
    useAggregateFranchiseSupportChatUnread(franchiseIds);

  const sidebar =
    franchises.length === 0 ? (
      <p className="px-2 text-center text-xs text-muted-foreground">No franchises</p>
    ) : (
      <ul className="flex flex-col gap-px">
        {franchises.map((f) => {
          const rowUnread = unreadByFranchiseId[f.ID] ?? 0;
          const rowBadge = rowUnread >= 100 ? "99+" : rowUnread > 0 ? String(rowUnread) : null;
          return (
            <li key={f.ID}>
              <button
                type="button"
                className={cn(
                  "flex w-full items-start justify-between gap-2 px-2 py-2 text-left text-xs transition-colors hover:bg-muted",
                  selectedFranchiseId === f.ID &&
                    "border-l-2 border-primary bg-primary/10 font-medium text-primary",
                )}
                aria-label={
                  rowUnread > 0
                    ? `${f.name ?? `Franchise #${f.ID}`} — ${rowUnread >= 100 ? "many" : rowUnread} unread messages`
                    : undefined
                }
                onClick={() => setSelectedFranchiseId(f.ID)}
              >
                <span className="line-clamp-2 min-w-0 flex-1 pr-1">
                  {f.name ?? `Franchise #${f.ID}`}
                </span>
                {rowBadge ? (
                  <span
                    className="mt-0.5 shrink-0 rounded-full bg-destructive px-1.5 py-0.5 text-[10px] font-semibold leading-none tabular-nums text-destructive-foreground"
                    aria-hidden
                  >
                    {rowBadge}
                  </span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
    );

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3 md:bottom-6 md:right-6">
      {!open ? (
        <SupportChatMessagesFab
          ariaLabelBase="Open franchise support chats"
          unreadCount={unreadCount}
          showFloodedBadge={showFloodedBadge}
          onClick={() => setOpen(true)}
        />
      ) : (
        <FranchiseSupportChatMessengerShell
          position="fixed"
          open={open}
          onClose={() => setOpen(false)}
          subtitle="Chat with franchises"
          sidebar={sidebar}
        >
          {selectedFranchiseId ? (
            <FranchiseSupportChatPanel franchiseId={selectedFranchiseId} />
          ) : (
            <div className="flex h-full items-center justify-center p-6 text-center text-sm text-muted-foreground">
              Select a franchise to open its chat.
            </div>
          )}
        </FranchiseSupportChatMessengerShell>
      )}
    </div>
  );
}
