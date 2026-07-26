import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import {
  compareDeliveryFeeCorrection,
  correctDeliveryFees,
  DeliveryFeeRow,
} from "@/services/woocommerce-service";

type Props = {
  open: boolean;
  setOpen: (open: boolean) => void;
  companyId: number;
  start: string;
  end: string;
};

export default function DeliveryFeeCorrectionDialog({
  open,
  setOpen,
  companyId,
  start,
  end,
}: Props) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const rangeKey = `${companyId}:${start}:${end}`;

  const [fetchLimit, setFetchLimit] = useState(25);
  const [apiPage, setApiPage] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    setApiPage(0);
    setSelectedIds(new Set());
  }, [rangeKey, fetchLimit]);

  const compareQuery = useQuery({
    queryKey: ["delivery-fee-correction", rangeKey, apiPage, fetchLimit],
    queryFn: () =>
      compareDeliveryFeeCorrection({
        company_id: companyId,
        start,
        end,
        page: apiPage,
        limit: fetchLimit,
      }),
    enabled: open && Boolean(companyId && start && end),
  });

  const rows = (compareQuery.data?.data?.rows || []) as DeliveryFeeRow[];
  const apiMeta = compareQuery.data?.data?.meta;
  const apiTotalPages = apiMeta?.total_pages ?? 1;
  const apiCurrentPage = apiMeta?.current_page ?? apiPage + 1;

  const selectableIds = useMemo(
    () => rows.filter((r) => r.can_correct).map((r) => r.order_id),
    [rows]
  );

  const allSelectableSelected =
    selectableIds.length > 0 && selectableIds.every((id) => selectedIds.has(id));

  const selectAll = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      selectableIds.forEach((id) => next.add(id));
      return next;
    });
  };

  const unselectAll = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      selectableIds.forEach((id) => next.delete(id));
      return next;
    });
  };

  const toggleRow = (orderId: number, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(orderId);
      else next.delete(orderId);
      return next;
    });
  };

  const selectedOnPageCount = selectableIds.filter((id) => selectedIds.has(id)).length;

  const { mutate: correctMutate, isPending: isCorrecting } = useMutation({
    mutationFn: () => {
      const orderIds = Array.from(selectedIds);
      if (orderIds.length === 0) {
        throw new Error("Select at least one order");
      }
      if (orderIds.length > 100) {
        throw new Error("Select at most 100 orders at a time");
      }
      return correctDeliveryFees({
        company_id: companyId,
        order_ids: orderIds,
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Delivery fees corrected",
        description: `Updated ${data.data?.corrected || 0} of ${data.data?.requested || 0} orders.`,
      });
      setSelectedIds(new Set());
      queryClient.invalidateQueries({ queryKey: ["delivery-fee-correction"] });
      queryClient.invalidateQueries({ queryKey: ["delivered-aggregates"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Correction failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const formatFee = (value: number | null | undefined) => {
    if (value == null) return "-";
    return new Intl.NumberFormat("en-DZ", {
      style: "currency",
      currency: "DZD",
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>Correct delivery fees</DialogTitle>
          <DialogDescription>
            Only orders where <span className="font-medium">first_delivery_cost</span> differs from
            Yalidine <span className="font-medium">delivery_fee</span> (Livré date between {start}{" "}
            and {end}). Select rows, then Correct.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={selectAll}
            disabled={selectableIds.length === 0 || isCorrecting}
          >
            Select all
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={unselectAll}
            disabled={selectedOnPageCount === 0 || isCorrecting}
          >
            Unselect all
          </Button>
          <span className="text-sm text-muted-foreground">
            {selectedIds.size} selected
            {selectableIds.length > 0 && allSelectableSelected ? " (all on this page)" : ""}
          </span>
        </div>

        {rows.length > 0 && !compareQuery.isLoading && !compareQuery.isError && (
          <div className="flex flex-col gap-3 rounded-md border p-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">Orders per fetch</span>
              <Select
                value={String(fetchLimit)}
                onValueChange={(v) => {
                  setFetchLimit(Number(v));
                  setApiPage(0);
                }}
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                Batch {apiCurrentPage} of {apiTotalPages}
                {apiMeta != null && (
                  <span className="text-muted-foreground/80"> ({apiMeta.total_items} total)</span>
                )}
              </span>
              <Pagination className="w-auto justify-end mx-0">
                <PaginationContent className="flex-wrap gap-1">
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setApiPage((p) => Math.max(0, p - 1));
                      }}
                      aria-disabled={apiPage <= 0}
                      tabIndex={apiPage <= 0 ? -1 : 0}
                      className={apiPage <= 0 ? "pointer-events-none opacity-50" : undefined}
                    />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setApiPage((p) => Math.min(Math.max(0, apiTotalPages - 1), p + 1));
                      }}
                      aria-disabled={apiPage >= apiTotalPages - 1}
                      tabIndex={apiPage >= apiTotalPages - 1 ? -1 : 0}
                      className={
                        apiPage >= apiTotalPages - 1 ? "pointer-events-none opacity-50" : undefined
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        )}

        <div className="max-h-[60vh] overflow-auto rounded border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10" />
                <TableHead>Order ID</TableHead>
                <TableHead>Tracking Number</TableHead>
                <TableHead>First Delivery Cost</TableHead>
                <TableHead>Yalidine Delivery Fee</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {compareQuery.isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading orders and Yalidine fees...
                    </div>
                  </TableCell>
                </TableRow>
              ) : compareQuery.isError ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-destructive">
                    Failed to load delivery fee comparison.
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No delivery fee differences in this date range.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => {
                  const checked = selectedIds.has(row.order_id);
                  return (
                    <TableRow key={row.order_id}>
                      <TableCell>
                        <Checkbox
                          checked={checked}
                          disabled={!row.can_correct || isCorrecting}
                          onCheckedChange={(v) => toggleRow(row.order_id, v === true)}
                          aria-label={`Select order ${row.order_id}`}
                        />
                      </TableCell>
                      <TableCell>{row.order_id}</TableCell>
                      <TableCell>{row.tracking_number || "-"}</TableCell>
                      <TableCell>{formatFee(row.first_delivery_cost)}</TableCell>
                      <TableCell>
                        {row.yalidine_delivery_fee == null ? (
                          <span className="text-muted-foreground">No live parcel</span>
                        ) : (
                          formatFee(row.yalidine_delivery_fee)
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isCorrecting}>
            Cancel
          </Button>
          <Button
            className="gap-2"
            onClick={() => correctMutate()}
            disabled={isCorrecting || selectedIds.size === 0}
          >
            {isCorrecting && <Loader2 className="h-4 w-4 animate-spin" />}
            Correct
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
