import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ExitBill } from "@/models/data/bill.model";
import { CircleX, LucideTicket, Printer } from "lucide-react";
import { useState } from "react";

interface Props {
  bill: ExitBill;
}

export default function ({ bill }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={"ghost"} className="flex w-full justify-start pl-2">
          <LucideTicket />
          View bill
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Exit Bill - {bill.ID}</DialogTitle>
        <DialogDescription className="flex flex-col gap-2">
          <div className="flex gap-2">
            <span className="font-bold">Company:</span>
            <p className="text-white font-bold">{bill.company?.company_name}</p>
          </div>
          <div className="flex gap-2">
            <span className="font-bold">Franchise:</span>
            <p className="text-white font-bold">{bill.franchise?.name}</p>
          </div>
          <div className="flex gap-2">
            <span className="font-bold">Date:</span>
            <p className="text-white font-bold">
              {new Date(bill.franchise?.CreatedAt ?? "").toDateString()}
            </p>
          </div>
          <ScrollArea className="max-h-[400px]">
            {bill.bill_items.map((billItem) => (
              <div
                key={`bill-item-${billItem.id}`}
                className="flex justify-between"
              >
                <span className="text-white">
                  {billItem.product_variant.product?.name}{" "}
                  {billItem.product_variant.color}{" "}
                  {billItem.product_variant.size}
                </span>
                <span className="text-bold">Qty: {billItem.quantity}</span>
              </div>
            ))}
          </ScrollArea>
          <div></div>
          <div>
            <div className="flex justify-between">
              <span>You need to pay:</span>
              <span className="text-white font-bold">
                {new Intl.NumberFormat("en-DZ", {
                  currency: "DZD",
                  style: "currency",
                }).format(bill.franchise_total_amount)}
              </span>
            </div>
          </div>
          <DialogFooter className="flex items-center">
            <DialogTrigger>
              <Button variant={"outline"}>
                <CircleX />
                Close
              </Button>
            </DialogTrigger>
            <Button>
              <Printer />
              Print
            </Button>
          </DialogFooter>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
}
