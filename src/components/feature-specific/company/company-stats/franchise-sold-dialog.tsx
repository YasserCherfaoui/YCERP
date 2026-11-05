import { liquidGlass } from "@/components/feature-specific/crm/crm-theme";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { FranchiseSoldBreakdown } from "@/models/responses/company-stats.model";
import { Store } from "lucide-react";

export function totalDelivered(row: {
  total_delivered_woo_orders_yalidine: number;
  total_delivered_woo_orders_my_companies: number;
  total_delivered_woo_orders_noest: number;
}) {
  return (
    (row.total_delivered_woo_orders_yalidine || 0) +
    (row.total_delivered_woo_orders_my_companies || 0) +
    (row.total_delivered_woo_orders_noest || 0)
  );
}

export function FranchiseSoldCell({
  total,
  breakdown,
  title,
}: {
  total: number;
  breakdown?: FranchiseSoldBreakdown[] | null;
  title: string;
}) {
  const rows = (breakdown ?? []).filter((item) => item.quantity > 0);
  if (total <= 0) {
    return <span className="tabular-nums text-muted-foreground">0</span>;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="link"
          onClick={(e) => e.stopPropagation()}
          className="h-auto p-0 font-semibold tabular-nums text-violet-700 underline-offset-4 hover:underline dark:text-violet-300"
        >
          {total.toLocaleString()}
        </Button>
      </DialogTrigger>
      <DialogContent
        className={cn(
          "max-w-md gap-0 overflow-hidden p-0 sm:p-0",
          liquidGlass,
          "bg-white/95 dark:bg-slate-950/95"
        )}
      >
        <DialogHeader className="border-b border-white/40 px-6 py-4 text-left dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-violet-200/80 text-violet-800 dark:bg-violet-400/20 dark:text-violet-100">
              <Store className="size-4" />
            </span>
            <div className="min-w-0">
              <DialogTitle className="truncate text-base">{title}</DialogTitle>
              <DialogDescription className="text-xs">
                Quantities sold by each franchise in the selected date range.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-auto p-4">
          {rows.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No franchise sales recorded for this item.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Franchise</TableHead>
                  <TableHead className="text-right">Sold Quantity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((item) => (
                  <TableRow key={`${item.franchise_id}-${item.franchise_name}`}>
                    <TableCell className="font-medium">{item.franchise_name}</TableCell>
                    <TableCell className="text-right font-semibold tabular-nums">
                      {item.quantity.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell className="font-semibold">Total</TableCell>
                  <TableCell className="text-right font-bold tabular-nums">
                    {total.toLocaleString()}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
