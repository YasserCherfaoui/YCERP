import { RootState } from "@/app/store";
import AddFranchiseSaleDialog from "@/components/feature-specific/franchise-sales/add-franchise-sale-dialog";
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
  getVariantDeposits,
  updateVariantDeposit,
} from "@/services/variant-deposits-service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useSelector } from "react-redux";
import { createFranchiseVariantDepositsColumns } from "./franchise-variant-deposits-columns";

export default function FranchiseVariantDepositsBody() {
  const franchise = useSelector((state: RootState) => state.franchise.franchise);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const limit = 20;

  if (!franchise) return null;

  const { data, isLoading } = useQuery({
    queryKey: ["franchise-variant-deposits", franchise.ID, statusFilter, page, limit],
    queryFn: () =>
      getVariantDeposits({
        status: statusFilter || undefined,
        page,
        limit,
      }),
    enabled: !!franchise,
  });

  const deposits: VariantDepositResponse[] = data?.data?.deposits ?? [];
  const pagination = data?.data?.pagination;

  const [depositForSaleDialog, setDepositForSaleDialog] = useState<VariantDepositResponse | null>(null);

  const { mutate: cancelMutation, isPending: isCancelling } = useMutation({
    mutationFn: ({ id }: { id: number }) =>
      updateVariantDeposit(id, { status: "cancelled" }),
    onSuccess: () => {
      toast({ title: "Cancelled", description: "Deposit cancelled." });
      queryClient.invalidateQueries({ queryKey: ["franchise-variant-deposits"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to cancel deposit",
        variant: "destructive",
      });
    },
  });

  const handleOpenCreateSale = (deposit: VariantDepositResponse) => {
    setDepositForSaleDialog(deposit);
  };

  const handleCancel = (deposit: VariantDepositResponse) => {
    if (
      window.confirm(
        `Cancel this deposit for ${deposit.customer_phone}? This cannot be undone.`
      )
    ) {
      cancelMutation({ id: deposit.id });
    }
  };

  const columns = createFranchiseVariantDepositsColumns({
    onFulfill: handleOpenCreateSale,
    onCancel: handleCancel,
  });

  const pendingCount = deposits.filter((d) => d.status === "pending").length;
  const fulfilledCount = deposits.filter((d) => d.status === "fulfilled").length;

  if (isLoading) {
    return <div className="p-4">Loading variant deposits...</div>;
  }

  return (
    <div className="space-y-4">
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
          <CardTitle>Deposits</CardTitle>
          <CardDescription>
            When a variant is in stock, use &quot;Create sale&quot; to fulfill the deposit and create a sale (amount paid is applied as discount).
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

      <AddFranchiseSaleDialog
        open={!!depositForSaleDialog}
        onOpenChange={(open) => !open && setDepositForSaleDialog(null)}
        initialFromDeposit={
          depositForSaleDialog
            ? { deposit: depositForSaleDialog, depositId: depositForSaleDialog.id }
            : null
        }
        hideTrigger
      />
    </div>
  );
}
