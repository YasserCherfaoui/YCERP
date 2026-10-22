import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  compareMissingLivreReconciliation,
  fixMissingLivreReconciliation,
  MissingLivreRow,
} from "@/services/woocommerce-service";

type Props = {
  open: boolean;
  setOpen: (open: boolean) => void;
  companyId: number;
  start: string;
  end: string;
};

export default function MissingLivreReconciliationDialog({
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
  const [carrier, setCarrier] = useState<"all" | "yalidine" | "noest">("all");

  useEffect(() => {
    setApiPage(0);
  }, [rangeKey, fetchLimit, carrier]);

  const compareQuery = useQuery({
    queryKey: ["missing-livre-reconciliation", rangeKey, carrier, apiPage, fetchLimit],
    queryFn: () =>
      compareMissingLivreReconciliation({
        company_id: companyId,
        start,
        end,
        page: apiPage,
        limit: fetchLimit,
        shipping_provider: carrier === "all" ? undefined : carrier,
      }),
    enabled: open && Boolean(companyId && start && end),
  });

  const rows = (compareQuery.data?.data?.rows || []) as MissingLivreRow[];
  const apiMeta = compareQuery.data?.data?.meta;
  const apiTotalPages = apiMeta?.total_pages ?? 1;
  const apiCurrentPage = apiMeta?.current_page ?? apiPage + 1;
  const fixableCount = useMemo(
    () => rows.filter((r) => r.can_fix).length,
    [rows]
  );

  const { mutate: fixMutate, isPending: isFixing } = useMutation({
    mutationFn: () =>
      fixMissingLivreReconciliation({
        company_id: companyId,
        start,
        end,
        page: apiPage,
        limit: fetchLimit,
        shipping_provider: carrier === "all" ? undefined : carrier,
      }),
    onSuccess: (data) => {
      toast({
        title: "Missing Livré reconciled",
        description: `Checked ${data.data?.checked || 0}, inserted ${data.data?.history_inserted || 0} histories${
          data.data?.skipped_no_live
            ? `, skipped ${data.data.skipped_no_live} with no live carrier status`
            : ""
        }.`,
      });
      queryClient.invalidateQueries({ queryKey: ["missing-livre-reconciliation"] });
      queryClient.invalidateQueries({ queryKey: ["delivered-aggregates"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Reconcile failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>Missing delivered histories</DialogTitle>
          <DialogDescription>
            Delivered orders updated between {start} and {end} that are missing the history analytics
            uses: <span className="font-medium">Livré</span> for Yalidine,{" "}
            <span className="font-medium">order_delivered</span> for NOEST. Reconcile fetches the
            live carrier status and appends that history entry.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Carrier</span>
          <Select
            value={carrier}
            onValueChange={(value) => setCarrier(value as "all" | "yalidine" | "noest")}
            disabled={isFixing}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="yalidine">Yalidine</SelectItem>
              <SelectItem value="noest">NOEST</SelectItem>
            </SelectContent>
          </Select>
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
                <TableHead>Order ID</TableHead>
                <TableHead>Carrier</TableHead>
                <TableHead>Tracking</TableHead>
                <TableHead>ERP Status</TableHead>
                <TableHead>Latest History</TableHead>
                <TableHead>Live carrier</TableHead>
                <TableHead>Updated At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {compareQuery.isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading orders...
                    </div>
                  </TableCell>
                </TableRow>
              ) : compareQuery.isError ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-destructive">
                    Failed to load orders missing a delivered history.
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No delivered Yalidine or NOEST orders are missing a delivered history in this date range.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow key={row.order_id}>
                    <TableCell>{row.order_id}</TableCell>
                    <TableCell>{row.shipping_provider === "noest" ? "NOEST" : "Yalidine"}</TableCell>
                    <TableCell>{row.tracking_number || "-"}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{row.my_erp_status || "-"}</Badge>
                    </TableCell>
                    <TableCell>{row.latest_yalidine_order_history || "-"}</TableCell>
                    <TableCell>
                      {row.yalidine_status || (
                        <span className="text-muted-foreground">No live status</span>
                      )}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{row.updated_at || "-"}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isFixing}>
            Close
          </Button>
          <Button
            className="gap-2"
            onClick={() => fixMutate()}
            disabled={isFixing || fixableCount === 0}
          >
            {isFixing && <Loader2 className="h-4 w-4 animate-spin" />}
            Reconcile batch
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
