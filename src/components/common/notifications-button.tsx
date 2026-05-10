import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { StockAlertNotification } from "@/models/data/stock-alert.model";
import {
  getNotifications,
  getUnreadCount,
  markNotificationAsRead,
} from "@/services/stock-alerts-service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Bell, Loader2 } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

function resolveStockAlertsNotificationsPath(pathname: string): string | null {
  const companyMatch = /^\/company\/(\d+)/.exec(pathname);
  if (companyMatch) {
    return `/company/${companyMatch[1]}/stock-alerts/notifications`;
  }
  if (pathname.startsWith("/moderator")) {
    return "/moderator/stock-alerts/notifications";
  }
  if (pathname.startsWith("/myFranchise")) {
    return "/myFranchise/stock-alerts/notifications";
  }
  return null;
}

function notificationTitle(n: StockAlertNotification): string {
  const product = n.stock_alert?.inventory_item?.product?.name;
  const raw = n.stock_alert?.alert_type ?? "stock_alert";
  const kind = raw.replace(/_/g, " ");
  return product ? `${kind}: ${product}` : kind;
}

function notificationSubtitle(n: StockAlertNotification): string {
  const qty = n.stock_alert?.current_quantity;
  const threshold = n.stock_alert?.threshold;
  if (qty !== undefined && threshold !== undefined) {
    return `Qty ${qty}, threshold ${threshold}`;
  }
  return n.notification_type === "in_app" ? "In-app alert" : "";
}

export default function NotificationButton() {
  const { pathname } = useLocation();
  const queryClient = useQueryClient();
  const notificationsPath = resolveStockAlertsNotificationsPath(pathname);

  const [open, setOpen] = useState(false);

  const { data: unreadEnvelope } = useQuery({
    queryKey: ["stock-alerts-unread-count"],
    queryFn: () => getUnreadCount(),
    enabled: Boolean(notificationsPath),
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
    retry: 1,
  });

  const unreadCount = unreadEnvelope?.data?.unread_count ?? 0;

  const { data: listEnvelope, isLoading: listLoading } = useQuery({
    queryKey: ["stock-alert-notifications-preview"],
    queryFn: () => getNotifications({ limit: 15, offset: 0 }),
    enabled: open && Boolean(notificationsPath),
  });

  const preview = listEnvelope?.data ?? [];

  const markOne = useMutation({
    mutationFn: (id: number) => markNotificationAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock-alerts-unread-count"] });
      queryClient.invalidateQueries({ queryKey: ["stock-alert-notifications-preview"] });
      queryClient.invalidateQueries({ queryKey: ["stock-alert-notifications"] });
    },
  });

  const markAll = useMutation({
    mutationFn: async () => {
      await Promise.all(preview.map((n) => markNotificationAsRead(n.id)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock-alerts-unread-count"] });
      queryClient.invalidateQueries({ queryKey: ["stock-alert-notifications-preview"] });
      queryClient.invalidateQueries({ queryKey: ["stock-alert-notifications"] });
    },
  });

  if (!notificationsPath) {
    return null;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="relative shrink-0"
          aria-label="Stock alert notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center p-0 px-1 text-xs"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[min(22rem,calc(100vw-2rem))] p-0" align="end">
        <Card className="border-0 shadow-none">
          <CardHeader className="flex flex-row items-start justify-between gap-2 pb-3 pt-4">
            <div className="min-w-0 flex-1 space-y-1 px-1">
              <CardTitle className="text-lg">Notifications</CardTitle>
              <CardDescription className="truncate">
                {unreadCount > 0
                  ? `${unreadCount} unread stock alert${unreadCount === 1 ? "" : "s"}`
                  : "You're up to date"}
              </CardDescription>
            </div>
            {preview.length > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 shrink-0 text-xs"
                disabled={markAll.isPending}
                onClick={() => markAll.mutate()}
              >
                {markAll.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  "Mark all read"
                )}
              </Button>
            )}
          </CardHeader>
          <CardContent className="p-0 px-1 pb-3">
            <ScrollArea className="h-[min(18rem,45vh)]">
              {listLoading ? (
                <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading…
                </div>
              ) : preview.length > 0 ? (
                <div className="flex flex-col">
                  {preview.map((n) => (
                    <button
                      key={n.id}
                      type="button"
                      className="flex w-full cursor-pointer gap-2 border-b px-3 py-3 text-left last:border-b-0 hover:bg-muted/50"
                      onClick={() => markOne.mutate(n.id)}
                      disabled={markOne.isPending}
                    >
                      <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" aria-hidden />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium leading-snug">{notificationTitle(n)}</p>
                        {notificationSubtitle(n) ? (
                          <p className="mt-1 text-xs text-muted-foreground">
                            {notificationSubtitle(n)}
                          </p>
                        ) : null}
                        <p className="mt-1 text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="px-3 py-8 text-center text-sm text-muted-foreground">
                  No unread stock alerts
                </div>
              )}
            </ScrollArea>
            <div className="border-t px-3 pt-3">
              <Button variant="secondary" className="w-full" size="sm" asChild>
                <Link to={notificationsPath} onClick={() => setOpen(false)}>
                  View all
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}
