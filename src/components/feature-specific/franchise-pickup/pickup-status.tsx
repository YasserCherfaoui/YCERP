import { Badge } from "@/components/ui/badge";
import {
  FranchisePickupItemStatus,
  FranchisePickupRequest,
  FranchisePickupStatus,
} from "@/models/data/franchise-pickup.model";
import { cn } from "@/lib/utils";

export const PICKUP_STATUS_LABEL: Record<FranchisePickupStatus, string> = {
  pending: "Pending",
  picked: "Picked",
  not_available: "Not available",
  partial: "Partial",
  cancelled: "Cancelled",
};

const STATUS_CLASS: Record<FranchisePickupStatus, string> = {
  pending:
    "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300",
  picked:
    "border-emerald-600/30 bg-emerald-600/10 text-emerald-800 dark:text-emerald-300",
  not_available: "border-border bg-muted text-muted-foreground",
  partial:
    "border-sky-500/30 bg-sky-500/10 text-sky-800 dark:text-sky-300",
  cancelled: "border-destructive/30 bg-destructive/10 text-destructive",
};

export function PickupStatusBadge({
  status,
  className,
}: {
  status: FranchisePickupStatus | FranchisePickupItemStatus;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn("font-medium shadow-none", STATUS_CLASS[status] ?? STATUS_CLASS.pending, className)}
    >
      {PICKUP_STATUS_LABEL[status] ?? status}
    </Badge>
  );
}

export function pickupEmployeeName(request: FranchisePickupRequest) {
  return request.delivery_employee?.name ?? `Employee #${request.delivery_employee_id}`;
}

export function pickupFranchiseName(request: FranchisePickupRequest) {
  return request.franchise?.name ?? `Franchise #${request.franchise_id}`;
}

export function formatPickupItem(item: FranchisePickupRequest["items"][number]) {
  const variant = item.product_variant;
  const name =
    variant?.product?.name ?? variant?.qr_code ?? `#${item.product_variant_id}`;
  const color = variant?.color ? ` ${variant.color}` : "";
  return `${name}${color} × ${item.quantity}`;
}

export function formatPickupItems(request: FranchisePickupRequest) {
  return (request.items ?? []).map(formatPickupItem).join(", ");
}
