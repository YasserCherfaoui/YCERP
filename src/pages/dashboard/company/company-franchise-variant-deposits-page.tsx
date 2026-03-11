import { RootState } from "@/app/store";
import AppBarBackButton from "@/components/common/app-bar-back-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { VariantDepositResponse } from "@/models/data/variant-deposit.model";
import { PaginationMeta } from "@/models/responses/company-stats.model";
import {
  getVariantDepositsCompany,
  updateVariantDepositCompany,
  fulfillVariantDepositCompany,
} from "@/services/variant-deposits-service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useSelector } from "react-redux";
import { createFranchiseVariantDepositsColumns } from "@/components/feature-specific/franchise-variant-deposits/franchise-variant-deposits-columns";

export default function CompanyFranchiseVariantDepositsPage() {
  const company = useSelector((state: RootState) => state.company.company);
  const franchise = useSelector((state: RootState) => state.franchise.franchise);
  const franchiseId = franchise?.ID;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading } = useQuery({
    queryKey: ["company-franchise-variant-deposits", franchiseId, statusFilter, page, limit],
    queryFn: () =>
      getVariantDepositsCompany(franchiseId!, {
        status: statusFilter || undefined,
        page,
        limit,
      }),
    enabled: !!franchiseId,
  });

  const deposits: VariantDepositResponse[] = data?.data?.deposits ?? [];
  const pagination = data?.data?.pagination;

  const { mutate: cancelMutation } = useMutation({
    mutationFn: ({ depositId }: { depositId: number }) =>
      updateVariantDepositCompany(franchiseId!, depositId, { status: "cancelled" }),
    onSuccess: () => {
      toast({ title: "Cancelled", description: "Deposit cancelled." });
      queryClient.invalidateQueries({
        queryKey: ["company-franchise-variant-deposits", franchiseId],
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to cancel deposit",
        variant: "destructive",
      });
    },
  });

  const { mutate: fulfillMutation } = useMutation({
    mutationFn: ({ depositId }: { depositId: number }) =>
      fulfillVariantDepositCompany(franchiseId!, depositId),
    onSuccess: () => {
      toast({ title: "Fulfilled", description: "Deposit fulfilled and sale created." });
      queryClient.invalidateQueries({
        queryKey: ["company-franchise-variant-deposits", franchiseId],
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to fulfill deposit",
        variant: "destructive",
      });
    },
  });

  const handleOpenCreateSale = (deposit: VariantDepositResponse) => {
    if (deposit.status !== "pending") return;
    fulfillMutation({ depositId: deposit.id });
  };

  const handleCancel = (deposit: VariantDepositResponse) => {
    if (
      window.confirm(
        `Cancel this deposit for ${deposit.customer_phone}? This cannot be undone.`
      )
    ) {
      cancelMutation({ depositId: deposit.id });
    }
  };

  const columns = createFranchiseVariantDepositsColumns({
    onFulfill: handleOpenCreateSale,
    onCancel: handleCancel,
  });

  const pendingCount = deposits.filter((d) => d.status === "pending").length;
  const fulfilledCount = deposits.filter((d) => d.status === "fulfilled").length;

  if (!company || !franchise) {
    return <div>No company or franchise selected</div>;
  }

  if (isLoading) {
    return <div className="p-4">Loading variant deposits...</div>;
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex gap-2 items-center mb-4">
        <AppBarBackButton destination="Franchise" />
        <span>
          {company.company_name} &gt; Franchises &gt; {franchise.name} &gt; Variant deposits
        </span>
      </div>

      <div className="flex items-center gap-4">
        <Select
          value={statusFilter || "all"}
          onValueChange={(v) => {
            setStatusFilter(v === "all" ? "" : v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="fulfilled">Fulfilled</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">
          Pending: {pendingCount} · Fulfilled: {fulfilledCount}
        </span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Variant deposits (advance orders)</CardTitle>
          <CardDescription>
            Fulfill pending deposits by clicking &quot;Create sale&quot; (creates a sale and applies amount as discount).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={deposits}
            searchColumn="customer_phone"
            paginationMeta={
              pagination
                ? ({
                    total_items: pagination.total,
                    total_pages: pagination.total_pages,
                    current_page: pagination.page,
                    per_page: pagination.limit,
                  } as PaginationMeta)
                : undefined
            }
            onPageChange={(p) => setPage(p + 1)}
            currentPage={page - 1}
          />
        </CardContent>
      </Card>
    </div>
  );
}
