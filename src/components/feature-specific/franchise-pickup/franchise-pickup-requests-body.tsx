import { RootState } from "@/app/store";
import {
  PickupEmptyState,
  PickupRequestCard,
  PickupRequestCardSkeleton,
} from "@/components/feature-specific/franchise-pickup/pickup-request-card";
import { createFranchisePickupColumns } from "@/components/feature-specific/franchise-pickup/pickup-request-columns";
import { PickupStats } from "@/components/feature-specific/franchise-pickup/pickup-stats";
import { ResolvePickupRequestDialog } from "@/components/feature-specific/franchise-pickup/resolve-pickup-request-dialog";
import { ViewPickupRequestDialog } from "@/components/feature-specific/franchise-pickup/view-pickup-request-dialog";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FranchisePickupRequest } from "@/models/data/franchise-pickup.model";
import { PaginationMeta } from "@/models/responses/company-stats.model";
import { getFranchisePickupRequests } from "@/services/franchise-pickup-service";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useSelector } from "react-redux";

export default function FranchisePickupRequestsBody() {
  const franchise = useSelector((state: RootState) => state.franchise.franchise);
  const [currentPage, setCurrentPage] = useState(0);
  const [status, setStatus] = useState("all");
  const [viewTarget, setViewTarget] = useState<FranchisePickupRequest | null>(null);
  const [resolveTarget, setResolveTarget] = useState<FranchisePickupRequest | null>(
    null
  );
  const pageSize = 10;

  const { data, isLoading } = useQuery({
    queryKey: ["franchise-pickup-requests", franchise?.ID, currentPage, status],
    queryFn: () =>
      getFranchisePickupRequests({
        page: currentPage + 1,
        limit: pageSize,
        status: status === "all" ? undefined : status,
      }),
    enabled: !!franchise,
  });

  if (!franchise) return null;

  const requests = data?.data?.requests ?? [];
  const counts = data?.data?.status_counts;
  const paginationMeta: PaginationMeta | undefined = data?.data?.pagination
    ? {
        total_items: data.data.pagination.total,
        total_pages: data.data.pagination.total_pages,
        current_page: data.data.pagination.page,
        per_page: data.data.pagination.limit,
      }
    : undefined;

  const columns = createFranchisePickupColumns({
    onView: setViewTarget,
    onRespond: setResolveTarget,
  });

  const changeStatus = (next: string) => {
    setStatus(next);
    setCurrentPage(0);
  };

  const requestActions = (request: FranchisePickupRequest) => (
    <>
      <Button
        variant="outline"
        className="w-full sm:w-auto"
        onClick={() => setViewTarget(request)}
      >
        View request
      </Button>
      {request.status === "pending" ? (
        <Button
          className="w-full sm:w-auto"
          onClick={() => setResolveTarget(request)}
        >
          Respond
        </Button>
      ) : null}
    </>
  );

  return (
    <div className="space-y-4 sm:space-y-5">
      <PickupStats
        counts={counts}
        activeStatus={status}
        onStatusChange={changeStatus}
        loading={isLoading && !data}
      />

      <div className="space-y-1.5">
        <Label htmlFor="franchise-pickup-status">Status</Label>
        <Select value={status} onValueChange={changeStatus}>
          <SelectTrigger id="franchise-pickup-status" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="picked">Picked</SelectItem>
            <SelectItem value="partial">Partial</SelectItem>
            <SelectItem value="not_available">Not available</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="md:hidden">
        {isLoading ? (
          <div className="space-y-3">
            <PickupRequestCardSkeleton />
            <PickupRequestCardSkeleton />
          </div>
        ) : requests.length === 0 ? (
          <PickupEmptyState
            title="No pickup requests"
            description="When the company sends a courier, requests to collect stock will show up here."
          />
        ) : (
          <div className="space-y-3">
            {requests.map((request) => (
              <PickupRequestCard
                key={request.ID}
                request={request}
                actions={requestActions(request)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="hidden md:block">
        {isLoading ? (
          <PickupRequestCardSkeleton />
        ) : requests.length === 0 ? (
          <PickupEmptyState
            title="No pickup requests"
            description="Open a request to review items, then mark each as picked or not available."
          />
        ) : (
          <DataTable
            data={requests}
            columns={columns}
            searchColumn="employee"
            searchPlaceholder="Search courier..."
            paginationMeta={paginationMeta}
            onPageChange={setCurrentPage}
            currentPage={currentPage}
          />
        )}
      </div>

      {!isLoading && requests.length > 0 && paginationMeta && paginationMeta.total_pages > 1 ? (
        <div className="flex items-center justify-between gap-2 md:hidden">
          <Button
            variant="outline"
            className="flex-1"
            disabled={currentPage <= 0}
            onClick={() => setCurrentPage((page) => Math.max(0, page - 1))}
          >
            Previous
          </Button>
          <span className="shrink-0 text-sm text-muted-foreground">
            {currentPage + 1} / {paginationMeta.total_pages}
          </span>
          <Button
            variant="outline"
            className="flex-1"
            disabled={currentPage + 1 >= paginationMeta.total_pages}
            onClick={() => setCurrentPage((page) => page + 1)}
          >
            Next
          </Button>
        </div>
      ) : null}

      <ViewPickupRequestDialog
        request={viewTarget}
        open={Boolean(viewTarget)}
        onOpenChange={(open) => {
          if (!open) setViewTarget(null);
        }}
        onRespondPending={(request) => {
          setViewTarget(null);
          setResolveTarget(request);
        }}
      />

      <ResolvePickupRequestDialog
        request={resolveTarget}
        open={Boolean(resolveTarget)}
        onOpenChange={(open) => {
          if (!open) setResolveTarget(null);
        }}
      />
    </div>
  );
}
