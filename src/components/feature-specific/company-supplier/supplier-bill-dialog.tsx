import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SupplierBill } from "@/models/data/supplier.model";
import { Ticket } from "lucide-react";

interface Props {
  bill: SupplierBill;
}
export default function ({ bill }: Props) {
  return (
    <Dialog>
      <DialogTrigger>
        <Button variant={"ghost"} className="flex w-full justify-start pl-2">
          <Ticket />
          <span className="flex-1">View Supplier Bill</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Supplier Bill {bill.ID}</DialogTitle>
          <ScrollArea className="max-h-[400px]">
            <Table>
              <TableHeader>
                <TableHead>Product</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead>Total</TableHead>
              </TableHeader>
              <TableBody>
                {bill.items.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{item.product_variant?.qr_code}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>
                      {new Intl.NumberFormat("en-DZ", {
                        style: "currency",
                        currency: "DZD",
                      }).format(
                        item.product_variant?.product?.first_price ?? 0
                      )}
                    </TableCell>
                    <TableCell>
                      {new Intl.NumberFormat("en-DZ", {
                        style: "currency",
                        currency: "DZD",
                      }).format(
                        (item.product_variant?.product?.first_price ?? 0) *
                          item.quantity
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>

          <div>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between">
                <span>Total</span>
                <span>
                  {new Intl.NumberFormat("en-DZ", {
                    style: "currency",
                    currency: "DZD",
                  }).format(bill.total)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Paid</span>
                <span>
                  {new Intl.NumberFormat("en-DZ", {
                    style: "currency",
                    currency: "DZD",
                  }).format(bill.paid)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Due</span>
                <span>
                  {new Intl.NumberFormat("en-DZ", {
                    style: "currency",
                    currency: "DZD",
                  }).format(bill.due)}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter></DialogFooter>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
