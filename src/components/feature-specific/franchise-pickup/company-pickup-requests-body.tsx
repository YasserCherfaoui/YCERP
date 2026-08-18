import { RootState } from "@/app/store";
import { PickupConfirmDialog } from "@/components/feature-specific/franchise-pickup/pickup-confirm-dialog";
import {
  PickupEmptyState,
  PickupRequestCard,
  PickupRequestCardSkeleton,
} from "@/components/feature-specific/franchise-pickup/pickup-request-card";
import { createCompanyPickupColumns } from "@/components/feature-specific/franchise-pickup/pickup-request-columns";
import { PickupRequestSummary } from "@/components/feature-specific/franchise-pickup/pickup-request-summary";
import { PickupStats } from "@/components/feature-specific/franchise-pickup/pickup-stats";
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
import { useToast } from "@/hooks/use-toast";
import { FranchisePickupRequest } from "@/models/data/franchise-pickup.model";
import { PaginationMeta } from "@/models/responses/company-stats.model";
import { getMyCompanyFranchises } from "@/services/franchise-service";
import {
  cancelFranchisePickupRequest,
  getAdminPickupRequests,
} from "@/services/franchise-pickup-service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

interface CompanyPickupRequestsBodyProps {
  onCreate?: () => void;
}

export default function CompanyPickupRequestsBody({
  onCreate,
}: CompanyPickupRequestsBodyProps) {
  let company = useSelector((state: RootState) => state.company.company);
  const { pathname } = useLocation();
  if (pathname.includes("moderator")) {
    company = useSelector((state: RootState) => state.user.company);
  }
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [franchiseId, setFranchiseId] = useState<number | undefined>();
  const [status, setStatus] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(0);
  const [cancelTarget, setCancelTarget] = useState<FranchisePickupRequest | null>(
    null
  );
  const [viewTarget, setViewTarget] = useState<FranchisePickupRequest | null>(
    null
  );
  const pageSize = 10;

  const { data: franchisesData } = useQuery({
    queryKey: ["company-franchises", company?.ID],
    queryFn: () => getMyCompanyFranchises(company!.ID),
    enabled: !!company,
  });

  const { data, isLoading } = useQuery({
    queryKey: [
      "company-pickup-requests",
      company?.ID,
      franchiseId,
      status,
      currentPage,
    ],
    queryFn: () =>
      getAdminPickupRequests({
        company_id: company?.ID,
        franchise_id: franchiseId,
        status: status === "all" ? undefined : status,
        page: currentPage + 1,
        limit: pageSize,
      }),
    enabled: !!company,
  });

  const { mutate: cancelRequest, isPending: isCancelling } = useMutation({
    mutationFn: cancelFranchisePickupRequest,
    onSuccess: () => {
      toast({ title: "Request cancelled" });
      queryClient.invalidateQueries({ queryKey: ["company-pickup-requests"] });
      setCancelTarget(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Could not cancel request",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (!company) return null;

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

  const columns = createCompanyPickupColumns({
    onView: setViewTarget,
    onCancel: setCancelTarget,
  });
  const franchises = franchisesData?.data ?? [];

  const changeStatus = (next: string) => {
    setStatus(next);
    setCurrentPage(0);
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      <PickupStats
        counts={counts}
        activeStatus={status}
        onStatusChange={changeStatus}
        loading={isLoading && !data}
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="pickup-franchise-filter">Franchise</Label>
          <Select
            value={franchiseId?.toString() || "all"}
            onValueChange={(value) => {
              setFranchiseId(value === "all" ? undefined : Number(value));
              setCurrentPage(0);
            }}
          >
            <SelectTrigger id="pickup-franchise-filter" className="w-full">
              <SelectValue placeholder="All franchises" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All franchises</SelectItem>
              {franchises.map((franchise) => (
                <SelectItem key={franchise.ID} value={franchise.ID.toString()}>
                  {franchise.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="pickup-status-filter">Status</Label>
          <Select value={status} onValueChange={changeStatus}>
            <SelectTrigger id="pickup-status-filter" className="w-full">
              <SelectValue placeholder="Status" />
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
            description="Send a courier to collect in-stock variants from a franchise."
            action={
              onCreate ? (
                <Button onClick={onCreate}>Create request</Button>
              ) : undefined
            }
          />
        ) : (
          <div className="space-y-3">
            {requests.map((request) => (
              <PickupRequestCard
                key={request.ID}
                request={request}
                showFranchise
                actions={
                  <>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setViewTarget(request)}
                    >
                      View request
                    </Button>
                    {request.status === "pending" ? (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setCancelTarget(request)}
                      >
                        Cancel request
                      </Button>
                    ) : null}
                  </>
                }
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
            description="Send a courier to collect in-stock variants from a franchise. Stock is deducted only when the franchise marks the request as picked."
            action={
              onCreate ? (
                <Button onClick={onCreate}>Create request</Button>
              ) : undefined
            }
          />
        ) : (
          <DataTable
            data={requests}
            columns={columns}
            searchColumn="franchise"
            searchPlaceholder="Search franchise..."
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
        showFranchise
        onOpenChange={(open) => {
          if (!open) setViewTarget(null);
        }}
        onCancelPending={(request) => {
          setViewTarget(null);
          setCancelTarget(request);
        }}
      />

      <PickupConfirmDialog
        open={Boolean(cancelTarget)}
        title="Cancel pickup request?"
        description="The franchise will no longer see this as pending. Stock is unchanged."
        confirmLabel="Cancel request"
        confirmVariant="destructive"
        pending={isCancelling}
        details={
          cancelTarget ? (
            <PickupRequestSummary request={cancelTarget} showFranchise />
          ) : null
        }
        onOpenChange={(open) => {
          if (!open) setCancelTarget(null);
        }}
        onConfirm={() => {
          if (cancelTarget) cancelRequest(cancelTarget.ID);
        }}
      />
    </div>
  );
}
