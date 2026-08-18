import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FranchisePickupRequest } from "@/models/data/franchise-pickup.model";
import { format } from "date-fns";
import { Package, Truck } from "lucide-react";
import type { ReactNode } from "react";
import {
  PickupStatusBadge,
  formatPickupItem,
  pickupEmployeeName,
  pickupFranchiseName,
} from "./pickup-status";

interface PickupRequestCardProps {
  request: FranchisePickupRequest;
  showFranchise?: boolean;
  actions?: ReactNode;
}

export function PickupRequestCard({
  request,
  showFranchise = false,
  actions,
}: PickupRequestCardProps) {
  const title = showFranchise
    ? pickupFranchiseName(request)
    : pickupEmployeeName(request);

  return (
    <Card className="p-4 shadow-sm transition-shadow duration-200">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-base font-semibold leading-snug">{title}</p>
          {showFranchise ? (
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <Truck className="h-3.5 w-3.5 shrink-0" aria-hidden />
              <span className="truncate">{pickupEmployeeName(request)}</span>
            </p>
          ) : null}
        </div>
        <PickupStatusBadge status={request.status} className="shrink-0" />
      </div>

      <ul className="mt-3 flex flex-wrap gap-1.5">
        {(request.items ?? []).length === 0 ? (
          <li className="text-sm text-muted-foreground">No items</li>
        ) : (
          (request.items ?? []).map((item) => (
            <li
              key={item.ID}
              className="rounded-md border bg-muted/50 px-2 py-1 text-xs font-medium"
            >
              {formatPickupItem(item)}
            </li>
          ))
        )}
      </ul>

      <div className="mt-3 space-y-1 text-xs text-muted-foreground">
        <span>
          {request.CreatedAt
            ? format(new Date(request.CreatedAt), "MMM d, yyyy")
            : ""}
        </span>
        {request.notes ? (
          <p className="line-clamp-2 break-words">{request.notes}</p>
        ) : null}
      </div>

      {actions ? (
        <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3 sm:flex-row sm:justify-end">
          {actions}
        </div>
      ) : null}
    </Card>
  );
}

export function PickupRequestCardSkeleton() {
  return (
    <Card className="space-y-3 p-4">
      <div className="flex justify-between">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-5 w-16" />
      </div>
      <Skeleton className="h-7 w-3/4" />
      <Skeleton className="h-4 w-24" />
    </Card>
  );
}

export function PickupEmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-card px-4 py-12 text-center">
      <div className="mb-3 rounded-full bg-muted p-3">
        <Package className="h-6 w-6 text-muted-foreground" aria-hidden />
      </div>
      <p className="text-base font-semibold">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
