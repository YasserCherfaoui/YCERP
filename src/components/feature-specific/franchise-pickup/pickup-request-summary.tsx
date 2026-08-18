import { PickupStatusBadge, formatPickupItem, pickupEmployeeName, pickupFranchiseName } from "@/components/feature-specific/franchise-pickup/pickup-status";
import { FranchisePickupRequest } from "@/models/data/franchise-pickup.model";
import { format } from "date-fns";
import { Calendar, Store, Truck } from "lucide-react";

export function PickupRequestSummary({
  request,
  showFranchise = false,
  showItemStatus = true,
}: {
  request: FranchisePickupRequest;
  showFranchise?: boolean;
  showItemStatus?: boolean;
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <PickupStatusBadge status={request.status} />
        <span className="text-sm text-muted-foreground">#{request.ID}</span>
      </div>
      <dl className="grid gap-2 text-sm">
        {showFranchise ? (
          <div className="flex items-start gap-2">
            <Store className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
            <div>
              <dt className="text-muted-foreground">Franchise</dt>
              <dd className="font-medium">{pickupFranchiseName(request)}</dd>
            </div>
          </div>
        ) : null}
        <div className="flex items-start gap-2">
          <Truck className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
          <div>
            <dt className="text-muted-foreground">Courier</dt>
            <dd className="font-medium">{pickupEmployeeName(request)}</dd>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
          <div>
            <dt className="text-muted-foreground">Created</dt>
            <dd className="font-medium">
              {request.CreatedAt
                ? format(new Date(request.CreatedAt), "MMM d, yyyy · HH:mm")
                : "—"}
            </dd>
          </div>
        </div>
      </dl>
      {request.notes ? (
        <p className="rounded-md bg-muted/50 px-3 py-2 text-sm">{request.notes}</p>
      ) : null}
      <ul className="space-y-2">
        {(request.items ?? []).map((item) => (
          <li
            key={item.ID}
            className="flex items-center justify-between gap-2 rounded-lg border bg-card px-3 py-2 text-sm"
          >
            <span className="min-w-0 break-words font-medium">
              {formatPickupItem(item)}
            </span>
            {showItemStatus && item.status && item.status !== "pending" ? (
              <PickupStatusBadge status={item.status} className="shrink-0" />
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
