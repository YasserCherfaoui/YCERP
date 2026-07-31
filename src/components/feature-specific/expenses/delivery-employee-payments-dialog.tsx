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
  EmployeePaymentByEmployeeRow,
  getEmployeePaymentsByEmployee,
} from "@/services/delivery-payments-service";

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

export default function DeliveryEmployeePaymentsDialog({
  open,
  setOpen,
  companyId,
  start,
  end,
}: Props) {
  const query = useQuery({
    queryKey: ["employee-payments-by-employee", companyId, start, end],
    queryFn: async () =>
      (
        await getEmployeePaymentsByEmployee({
          company_id: companyId,
          start,
          end,
        })
      ).data,
    enabled: open && Boolean(companyId && start && end),
  });

  const rows = (query.data?.rows || []) as EmployeePaymentByEmployeeRow[];
  const rangeLabel = start === end ? start : `${start} → ${end}`;
  const grandTotal = rows.reduce((sum, r) => sum + (r.total_amount || 0), 0);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Delivery employee remittances</DialogTitle>
          <DialogDescription>
            Cash collected from delivery employees between {rangeLabel}. Only employees with a
            total greater than zero are shown, ordered by amount descending.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-auto rounded border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead className="text-right">Payments</TableHead>
                <TableHead className="text-right">Total remitted</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {query.isLoading && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8">
                    <Loader2 className="inline h-5 w-5 animate-spin mr-2" />
                    Loading…
                  </TableCell>
                </TableRow>
              )}
              {query.isError && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-destructive py-8">
                    {(query.error as Error)?.message || "Failed to load remittances."}
                  </TableCell>
                </TableRow>
              )}
              {!query.isLoading && !query.isError && rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                    No remittances in this range.
                  </TableCell>
                </TableRow>
              )}
              {!query.isLoading &&
                !query.isError &&
                rows.map((row) => (
                  <TableRow key={row.delivery_employee_id}>
                    <TableCell>{row.employee_name}</TableCell>
                    <TableCell className="text-right">{row.count}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatMoney(row.total_amount)}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>

        {!query.isLoading && !query.isError && rows.length > 0 && (
          <div className="text-sm font-medium text-right">
            Grand total: {formatMoney(grandTotal)} ({rows.length} employee
            {rows.length === 1 ? "" : "s"})
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
