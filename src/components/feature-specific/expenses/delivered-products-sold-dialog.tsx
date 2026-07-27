import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DeliveredProductSoldRow,
  getDeliveredProductsSold,
} from "@/services/expense-reports-service";

type Props = {
  open: boolean;
  setOpen: (open: boolean) => void;
  companyId: number;
  start: string;
  end: string;
};

const formatMoney = (value: number) =>
  new Intl.NumberFormat("en-DZ", {
    style: "currency",
    currency: "DZD",
    maximumFractionDigits: 0,
  }).format(value);

export default function DeliveredProductsSoldDialog({
  open,
  setOpen,
  companyId,
  start,
  end,
}: Props) {
  const rangeKey = `${companyId}:${start}:${end}`;

  const query = useQuery({
    queryKey: ["delivered-products-sold", rangeKey],
    queryFn: async () =>
      (
        await getDeliveredProductsSold({
          company_id: companyId,
          start,
          end,
        })
      ).data,
    enabled: open && Boolean(companyId && start && end),
  });

  const rows = (query.data?.rows || []) as DeliveredProductSoldRow[];
  const totalCogs = query.data?.total_cogs ?? 0;
  const rangeLabel = start === end ? start : `${start} → ${end}`;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Products sold (COGS)</DialogTitle>
          <DialogDescription>
            Confirmed products on delivered orders for {rangeLabel}, using the same delivery-date
            filters as analytics. Line total is quantity × first price.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-auto rounded border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">First price</TableHead>
                <TableHead className="text-right">Qty × first price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {query.isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading products...
                    </div>
                  </TableCell>
                </TableRow>
              ) : query.isError ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-destructive">
                    Failed to load products sold.
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No delivered products in this date range.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow key={row.product_id}>
                    <TableCell>{row.product_name || "-"}</TableCell>
                    <TableCell className="text-right tabular-nums">{row.quantity}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatMoney(row.first_price)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums font-medium">
                      {formatMoney(row.line_total)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between rounded-md border px-4 py-3">
          <span className="text-sm text-muted-foreground">Total (Σ quantity × first price)</span>
          <span className="text-lg font-semibold tabular-nums">{formatMoney(totalCogs)}</span>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
