import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { BillItem } from "@/models/data/bill.model";
import { BadgeAlert } from "lucide-react";

interface Props {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  extraItems: BillItem[];
}

export default function ({ open, setOpen, extraItems }: Props) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex gap-2 items-center">
            <BadgeAlert />
            Report Extra Products
          </DialogTitle>
          <DialogDescription>
            These Products are extra products that were not in the original bill.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          {extraItems.map((item) => (
            <div key={item.product_variant_id} className="flex justify-between">
              <span className="text-white">{item.qr_code}</span>
              <span className="text-bold">Qty: {item.quantity}</span>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button
            variant={"outline"}
            onClick={() => {
              setOpen(false);
            }}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
