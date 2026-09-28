import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AdsTrueEconomicsRow, AdsUndeliveredOrder } from "@/models/data/ads-intelligence/chat.model";
import { getUndeliveredConfirmedOrders } from "@/services/ads-intelligence-service";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

const STATUS_LABELS: Record<string, string> = {
  packing: "Packing",
  dispaching: "Dispatching",
  deliviring: "Delivering",
  delivered: "Delivered",
  returning: "Returning",
  returned: "Returned",
  cancelled: "Cancelled",
  relaunched: "Relaunched",
  orphaned: "Orphaned",
  unconfirmed: "Unconfirmed",
};

function statusLabel(status: string) {
  return STATUS_LABELS[status] ?? status.replaceAll("_", " ");
}

function formatWhen(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("fr-DZ", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default function UndeliveredOrdersDialog({
  campaign,
  dateFrom,
  dateTo,
  onClose,
}: {
  campaign: AdsTrueEconomicsRow | null;
  dateFrom?: string;
  dateTo?: string;
  onClose: () => void;
}) {
  const { companyID } = useParams();
  const [orders, setOrders] = useState<AdsUndeliveredOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!campaign) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setOrders([]);
    void getUndeliveredConfirmedOrders(campaign.campaign_id, { from: dateFrom, to: dateTo })
      .then((res) => {
        if (!cancelled) setOrders(res.data ?? []);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load orders");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [campaign, dateFrom, dateTo]);

  const title = campaign?.campaign_name?.trim() || (campaign ? `Campaign #${campaign.campaign_id}` : "");

  return (
    <Dialog open={campaign != null} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>Confirmed, not delivered</DialogTitle>
          <DialogDescription>
            {title}
            {campaign ? ` · ${campaign.confirmed} confirmed, ${campaign.delivered} delivered` : ""}
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="space-y-2" aria-label="Loading orders">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}

        {!loading && !error && orders.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Every confirmed order in this campaign is already delivered.
          </p>
        )}

        {!loading && orders.length > 0 && (
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader className="bg-muted/80">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-xs uppercase tracking-wide">Order</TableHead>
                  <TableHead className="text-xs uppercase tracking-wide">Customer</TableHead>
                  <TableHead className="text-xs uppercase tracking-wide">Status</TableHead>
                  <TableHead className="text-xs uppercase tracking-wide">Why it is still open</TableHead>
                  <TableHead className="text-xs uppercase tracking-wide">Tracking</TableHead>
                  <TableHead className="text-xs uppercase tracking-wide">Wilaya</TableHead>
                  <TableHead className="text-xs uppercase tracking-wide">Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.woo_order_id} className="even:bg-muted/30">
                    <TableCell>
                      <Link
                        to={
                          companyID
                            ? `/company/${companyID}/orders/${order.woo_order_id}`
                            : `/moderator/orders/${order.woo_order_id}`
                        }
                        className="font-medium text-primary underline-offset-2 hover:underline"
                      >
                        {order.order_number || `#${order.woo_order_id}`}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{order.customer_name || "—"}</p>
                      {order.customer_phone && (
                        <p className="text-xs text-muted-foreground">{order.customer_phone}</p>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{statusLabel(order.order_status)}</Badge>
                    </TableCell>
                    <TableCell className="max-w-sm">
                      <p className="text-sm leading-6">{order.why}</p>
                      {order.comments.trim() && (
                        <p className="mt-1 text-xs leading-5 text-muted-foreground">Note: {order.comments}</p>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{order.tracking_number || "—"}</TableCell>
                    <TableCell>{order.wilaya_name || "—"}</TableCell>
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                      {formatWhen(order.created_at)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
