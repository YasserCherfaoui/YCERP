import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
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
import { EntryBill } from "@/models/data/bill.model";
import { Eye } from "lucide-react";

interface Props {
  bill: EntryBill;
}

export default function FranchiseEntryBillDetailsDialog({ bill }: Props) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" className="flex w-full justify-start pl-2">
          <Eye className="mr-2 h-4 w-4" />
          View Bill Details
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Entry Bill Details - EXB-{bill.ID}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[500px]">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="confirmed">
              <AccordionTrigger>Confirmed Items</AccordionTrigger>
              <AccordionContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bill.confirmed_bill_items?.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{item.product_variant?.qr_code}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>
                          {new Intl.NumberFormat("en-DZ", {
                            style: "currency",
                            currency: "DZD",
                          }).format(
                            item.product_variant?.product?.franchise_price ?? 0
                          )}
                        </TableCell>
                        <TableCell>
                          {new Intl.NumberFormat("en-DZ", {
                            style: "currency",
                            currency: "DZD",
                          }).format(
                            (item.product_variant?.product?.franchise_price ?? 0) *
                              item.quantity
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="broken">
              <AccordionTrigger>Broken Items</AccordionTrigger>
              <AccordionContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Quantity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bill.bill_issue?.broken_items?.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{item.product_variant?.qr_code}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="missing">
              <AccordionTrigger>Missing Items</AccordionTrigger>
              <AccordionContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Quantity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bill.bill_issue?.missing_items?.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{item.product_variant?.qr_code}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="extra">
              <AccordionTrigger>Extra Items</AccordionTrigger>
              <AccordionContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Quantity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bill.bill_issue?.extra_items?.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{item.product_variant?.qr_code}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <Card className="mt-4 p-4">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between">
                <span>Exit Bill Total</span>
                <span>
                  {new Intl.NumberFormat("en-DZ", {
                    style: "currency",
                    currency: "DZD",
                  }).format(bill.exit_bill?.franchise_total_amount ?? 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Entry bill Total</span>
                <span>
                  {new Intl.NumberFormat("en-DZ", {
                    style: "currency",
                    currency: "DZD",
                  }).format(bill.total ?? 0)}
                </span>
              </div>
            </div>
          </Card>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
