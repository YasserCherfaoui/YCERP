import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ExitBill } from "@/models/data/bill.model";

interface Props {
  bills: ExitBill[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (bill: ExitBill) => void;
}

export default function PreparingExitBillsPicker({
  bills,
  open,
  onOpenChange,
  onSelect,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Preparing Exit Bills</DialogTitle>
        </DialogHeader>
        <ul className="flex flex-col gap-2 max-h-[400px] overflow-y-auto">
          {bills.map((bill) => (
            <li key={bill.ID}>
              <Button
                variant="outline"
                className="w-full justify-between h-auto py-3"
                onClick={() => onSelect(bill)}
              >
                <span className="font-medium">EXB-{bill.ID}</span>
                <span className="text-xs text-muted-foreground text-right">
                  {new Date(bill.CreatedAt).toLocaleString()}
                  <br />
                  {bill.bill_items?.length ?? 0} items
                </span>
              </Button>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
