import { DeclarationsList } from "@/components/feature-specific/broken-items/declarations-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { BrokenItemListItem, BrokenItemListResponse } from "@/models/data/broken-item.model";
import { getBrokenItems, recoverBrokenItem } from "@/services/broken-items-service";
import { getMyCompanyFranchises } from "@/services/franchise-service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, RefreshCw, RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

interface BrokenItemsDeclarationsPageBodyProps {
  companyId: number;
}

const PAGE_SIZE = 20;

export default function BrokenItemsDeclarationsPageBody({
  companyId,
}: BrokenItemsDeclarationsPageBodyProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [franchiseFilter, setFranchiseFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const transfersPath = location.pathname.includes("/moderator/")
    ? "/moderator/broken-items-transfers"
    : `/company/${companyId}/broken-items-transfers`;

  const { data: franchisesData } = useQuery({
    queryKey: ["company-franchises", companyId],
    queryFn: () => getMyCompanyFranchises(companyId),
    enabled: !!companyId,
  });

  const franchises = franchisesData?.data ?? [];

  const { data, isLoading, refetch } = useQuery({
    queryKey: [
      "broken-items-declarations",
      companyId,
      statusFilter,
      franchiseFilter,
      page,
      PAGE_SIZE,
    ],
    queryFn: async () => {
      const response = await getBrokenItems({
        company_id: companyId,
        location_type: "franchise",
        page,
        limit: PAGE_SIZE,
        recoverable_only: statusFilter === "recoverable",
        ...(franchiseFilter !== "all"
          ? { franchise_id: Number(franchiseFilter) }
          : {}),
        ...(statusFilter !== "all" && statusFilter !== "recoverable"
          ? { status: statusFilter }
          : {}),
      });
      return response.data as BrokenItemListResponse;
    },
    enabled: !!companyId,
  });

  const items = data?.items ?? [];
  const pagination = data?.pagination;
  const statusCounts = data?.status_counts;

  const selectableItems = useMemo(
    () =>
      items.filter(
        (item) => item.recoverable_quantity > 0 && !item.blocked_by_pending_transfer
      ),
    [items]
  );

  const { mutate: bulkRecover, isPending: isBulkRecovering } = useMutation({
    mutationFn: async (targets: BrokenItemListItem[]) => {
      let successCount = 0;
      const errors: string[] = [];

      for (const item of targets) {
        try {
          await recoverBrokenItem({
            inventory_item_id: item.inventory_item_id,
            product_variant_id: item.product_variant_id,
            recovered_quantity: item.recoverable_quantity,
          });
          successCount += 1;
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Unknown error";
          errors.push(message);
        }
      }

      return { successCount, errors };
    },
    onSuccess: ({ successCount, errors }) => {
      setSelectedIds(new Set());
      queryClient.invalidateQueries({ queryKey: ["broken-items-declarations"] });
      queryClient.invalidateQueries({ queryKey: ["broken-items"] });
      queryClient.invalidateQueries({ queryKey: ["franchise-inventory"] });
      queryClient.invalidateQueries({ queryKey: ["company-inventory"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-total-cost"] });

      toast({
        title: "Bulk recovery finished",
        description:
          errors.length > 0
            ? `${successCount} recovered, ${errors.length} failed.`
            : `${successCount} item(s) recovered successfully.`,
        variant: errors.length > 0 ? "destructive" : "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Bulk recovery failed",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    },
  });

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setPage(1);
    setSelectedIds(new Set());
  };

  const handleFranchiseChange = (value: string) => {
    setFranchiseFilter(value);
    setPage(1);
    setSelectedIds(new Set());
  };

  const handleToggleItem = (id: number) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handleToggleAll = () => {
    const allSelected =
      selectableItems.length > 0 &&
      selectableItems.every((item) => selectedIds.has(item.ID));
    if (allSelected) {
      setSelectedIds(new Set());
      return;
    }
    setSelectedIds(new Set(selectableItems.map((item) => item.ID)));
  };

  const handleBulkRecover = () => {
    const targets = items.filter(
      (item) =>
        selectedIds.has(item.ID) &&
        item.recoverable_quantity > 0 &&
        !item.blocked_by_pending_transfer
    );

    if (targets.length === 0) {
      toast({
        title: "No items selected",
        description: "Select at least one recoverable declaration.",
        variant: "destructive",
      });
      return;
    }

    bulkRecover(targets);
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Franchise Declared Quantities</h1>
            <p className="text-muted-foreground">
              Review franchise broken-item declarations and restore quantities to
              sellable inventory
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={franchiseFilter} onValueChange={handleFranchiseChange}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by franchise" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Franchises</SelectItem>
              {franchises.map((franchise) => (
                <SelectItem key={franchise.ID} value={String(franchise.ID)}>
                  {franchise.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="recoverable">Recoverable only</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="partially_recovered">Partially recovered</SelectItem>
              <SelectItem value="fully_recovered">Fully recovered</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="default"
            onClick={handleBulkRecover}
            disabled={selectedIds.size === 0 || isBulkRecovering}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Recover selected ({selectedIds.size})
          </Button>
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-2xl font-bold text-yellow-600">
              {statusCounts?.pending ?? 0}
            </CardDescription>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Partially recovered</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-2xl font-bold text-blue-600">
              {statusCounts?.partially_recovered ?? 0}
            </CardDescription>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Fully recovered</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-2xl font-bold text-green-600">
              {statusCounts?.fully_recovered ?? 0}
            </CardDescription>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Lost</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-2xl font-bold text-red-600">
              {statusCounts?.lost ?? 0}
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Declarations</CardTitle>
          <CardDescription>
            Franchise broken-item declarations
            {pagination ? ` — showing ${items.length} of ${pagination.total}` : null}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DeclarationsList
            items={items}
            isLoading={isLoading}
            pagination={pagination}
            onPageChange={setPage}
            selectedIds={selectedIds}
            onToggleItem={handleToggleItem}
            onToggleAll={handleToggleAll}
            transfersPath={transfersPath}
          />
        </CardContent>
      </Card>
    </div>
  );
}
