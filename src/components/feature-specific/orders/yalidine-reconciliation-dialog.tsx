import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, CircleHelp, Loader2, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  compareYalidineReconciliation,
  fixYalidineReconciliation,
  YalidineReconciliationFilters,
  YalidineReconciliationRow,
} from "@/services/woocommerce-service";
import { useToast } from "@/hooks/use-toast";

type Props = {
  open: boolean;
  setOpen: (open: boolean) => void;
  filters: YalidineReconciliationFilters;
};

export default function YalidineReconciliationDialog({
  open,
  setOpen,
  filters,
}: Props) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const filtersKey = useMemo(() => JSON.stringify(filters), [filters]);

  /** How many orders the backend loads per request (independent from the orders table page size). */
  const [fetchLimit, setFetchLimit] = useState(25);
  /** 0-based batch page over the filtered result set. */
  const [apiPage, setApiPage] = useState(0);

  useEffect(() => {
    setApiPage(0);
  }, [filtersKey, fetchLimit]);

  const compareQuery = useQuery({
    queryKey: ["yalidine-reconciliation", filtersKey, apiPage, fetchLimit],
    queryFn: () =>
      compareYalidineReconciliation({
        filters,
        page: apiPage,
        limit: fetchLimit,
      }),
    enabled: open && Boolean(filters.company_id),
  });

  const rows = (compareQuery.data?.data?.rows || []) as YalidineReconciliationRow[];
  const apiMeta = compareQuery.data?.data?.meta;

  const [tablePageSize, setTablePageSize] = useState(10);
  const [tablePageIndex, setTablePageIndex] = useState(0);

  const tableTotalPages = Math.max(1, Math.ceil(rows.length / tablePageSize) || 1);

  useEffect(() => {
    setTablePageIndex(0);
  }, [filtersKey, apiPage, fetchLimit, rows.length]);

  useEffect(() => {
    setTablePageIndex((i) => Math.min(i, Math.max(0, tableTotalPages - 1)));
  }, [rows.length, tablePageSize, tableTotalPages]);

  const paginatedRows = useMemo(() => {
    const start = tablePageIndex * tablePageSize;
    return rows.slice(start, start + tablePageSize);
  }, [rows, tablePageIndex, tablePageSize]);

  const { mutate: fixMutate, isPending: isFixing } = useMutation({
    mutationFn: () =>
      fixYalidineReconciliation({
        filters,
        page: apiPage,
        limit: fetchLimit,
      }),
    onSuccess: (data) => {
      toast({
        title: "Discrepancies fixed",
        description: `Checked ${data.data?.checked || 0}, fixed ${data.data?.fixed || 0}.`,
      });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["yalidine-reconciliation"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to fix discrepancies",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const apiTotalPages = apiMeta?.total_pages ?? 1;
  const apiCurrentPage = apiMeta?.current_page ?? apiPage + 1;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-6xl">
        <DialogHeader>
          <DialogTitle>Yalidine Reconciliation</DialogTitle>
          <DialogDescription>
            Loads orders from the API using the same filters as this list, then compares live Yalidine parcel
            status to the latest saved Yalidine history. Batch size and batch page are independent of the
            orders table page size. A neutral icon in the Match column means there is no parcel from Yalidine
            and no saved history yet—nothing to compare yet.
          </DialogDescription>
        </DialogHeader>

        {rows.length > 0 && !compareQuery.isLoading && !compareQuery.isError && (
          <div className="flex flex-col gap-4">
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

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-muted-foreground">Rows per page</span>
                <Select
                  value={String(tablePageSize)}
                  onValueChange={(v) => {
                    setTablePageSize(Number(v));
                    setTablePageIndex(0);
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
                  Page {Math.min(tablePageIndex + 1, tableTotalPages)} of {tableTotalPages}
                  <span className="text-muted-foreground/80"> ({rows.length} in batch)</span>
                </span>
                <Pagination className="w-auto justify-end mx-0">
                  <PaginationContent className="flex-wrap gap-1">
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setTablePageIndex((i) => Math.max(0, i - 1));
                        }}
                        aria-disabled={tablePageIndex <= 0}
                        tabIndex={tablePageIndex <= 0 ? -1 : 0}
                        className={tablePageIndex <= 0 ? "pointer-events-none opacity-50" : undefined}
                      />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setTablePageIndex((i) => Math.min(tableTotalPages - 1, i + 1));
                        }}
                        aria-disabled={tablePageIndex >= tableTotalPages - 1}
                        tabIndex={tablePageIndex >= tableTotalPages - 1 ? -1 : 0}
                        className={
                          tablePageIndex >= tableTotalPages - 1
                            ? "pointer-events-none opacity-50"
                            : undefined
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </div>
          </div>
        )}

        <div className="max-h-[60vh] overflow-auto rounded border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Tracking Number</TableHead>
                <TableHead>My ERP Status</TableHead>
                <TableHead>Latest Yalidine Order Histories</TableHead>
                <TableHead>Yalidine Status</TableHead>
                <TableHead className="whitespace-nowrap">Match</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {compareQuery.isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading reconciliation rows...
                    </div>
                  </TableCell>
                </TableRow>
              ) : compareQuery.isError ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-destructive">
                    Failed to load reconciliation data.
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No orders in this batch for the current filters.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedRows.map((row) => (
                  <TableRow key={row.order_id}>
                    <TableCell>{row.order_id}</TableCell>
                    <TableCell>{row.tracking_number || "-"}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{row.my_erp_status || "-"}</Badge>
                    </TableCell>
                    <TableCell>{row.latest_yalidine_order_history || "-"}</TableCell>
                    <TableCell>{row.yalidine_status || "-"}</TableCell>
                    <TableCell>
                      {(() => {
                        const state = row.match_state ?? (row.is_match ? "match" : "mismatch");
                        if (state === "match") {
                          return (
                            <CheckCircle2
                              className="h-5 w-5 text-green-600"
                              aria-label="DB history matches live Yalidine status"
                            />
                          );
                        }
                        if (state === "incomplete") {
                          return (
                            <CircleHelp
                              className="h-5 w-5 text-muted-foreground"
                              aria-label="No saved history and no Yalidine parcel yet—nothing to compare"
                            />
                          );
                        }
                        return (
                          <XCircle
                            className="h-5 w-5 text-red-600"
                            aria-label="Mismatch: history and live status differ, or only one side has data"
                          />
                        );
                      })()}
                    </TableCell>
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
            disabled={isFixing || rows.length === 0}
          >
            {isFixing && <Loader2 className="h-4 w-4 animate-spin" />}
            Fix discrepancies
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
