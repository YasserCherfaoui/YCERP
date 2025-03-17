import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BillItem, EntryBill } from "@/models/data/bill.model";
import { APIResponse } from "@/models/responses/api-response.model";
import { CreateEntryBillSchema } from "@/schemas/bill";
import { UseMutateFunction } from "@tanstack/react-query";
import { BadgeAlert } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

interface Props {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setPrimaryFormOpen: React.Dispatch<React.SetStateAction<boolean>>;
  primaryForm: UseFormReturn<CreateEntryBillSchema>;
  extraItems: BillItem[];
  submitMutation?: UseMutateFunction<
    APIResponse<EntryBill>,
    Error,
    CreateEntryBillSchema,
    unknown
  >;
}

export default function ({
  open,
  setOpen,
  extraItems,
  submitMutation,
  setPrimaryFormOpen,
  primaryForm,
}: Props) {
  const onSaveClicked = () => {
    if (submitMutation) {
      submitMutation(primaryForm.getValues());
      setOpen(false);
      setPrimaryFormOpen(false);
    }
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex gap-2 items-center">
            <BadgeAlert />
            Report Extra Products
          </DialogTitle>
          <DialogDescription>
            These Products are extra products that were not in the original
            bill.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex flex-col gap-2 max-h-[400px]">
          {extraItems.map((item) => (
            <div key={item.product_variant_id} className="flex justify-between">
              <span className="text-white">{item.qr_code}</span>
              <span className="text-bold">Qty: {item.quantity}</span>
            </div>
          ))}
        </ScrollArea>
        <DialogFooter>
          <Button
            variant={"outline"}
            onClick={() => {
              setOpen(false);
            }}
          >
            Close
          </Button>
          {submitMutation && <Button onClick={onSaveClicked}>Save</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
