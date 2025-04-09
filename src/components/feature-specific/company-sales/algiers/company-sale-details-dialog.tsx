import { Card } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Sale } from "@/models/data/sale.model";
import { Ticket } from "lucide-react";

interface Props {
  sale: Sale;
}

export default function ({ sale }: Props) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <Ticket />
          Show details
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sale {sale.ID} Details</DialogTitle>
        </DialogHeader>
        <section className="flex flex-col gap-4">
          <ScrollArea className="max-h-[400px]">
            <Table>
              <TableHeader>
                <TableHead>Product</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Total</TableHead>
              </TableHeader>
              <TableBody>
                {sale.sale_items.map((s) => (
                  <TableRow>
                    <TableCell>{s.product_variant.qr_code}</TableCell>
                    <TableCell>{s.quantity}</TableCell>
                    <TableCell>
                      {" "}
                      {new Intl.NumberFormat("en-DZ", {
                        style: "currency",
                        currency: "DZD",
                      }).format(s.discount)}
                    </TableCell>
                    <TableCell>
                      {new Intl.NumberFormat("en-DZ", {
                        style: "currency",
                        currency: "DZD",
                      }).format((s.product?.price ?? 0) * s.quantity)}
                    </TableCell>
                    <TableCell>
                      {new Intl.NumberFormat("en-DZ", {
                        style: "currency",
                        currency: "DZD",
                      }).format(
                        ((s.product?.price ?? 0) - s.discount) * s.quantity
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>

          <Card className="w-fit min-w-[300px] self-end">
            <div className="flex flex-col gap-2 p-4">
              <div className="flex justify-between">
                <span>Amount</span>
                <span>
                  {new Intl.NumberFormat("en-DZ", {
                    style: "currency",
                    currency: "DZD",
                  }).format(sale.amount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Discount</span>
                <span>
                  {new Intl.NumberFormat("en-DZ", {
                    style: "currency",
                    currency: "DZD",
                  }).format(sale.discount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Total</span>
                <span>
                  {new Intl.NumberFormat("en-DZ", {
                    style: "currency",
                    currency: "DZD",
                  }).format(sale.total)}
                </span>
              </div>
            </div>
          </Card>
        </section>
      </DialogContent>
    </Dialog>
  );
}
