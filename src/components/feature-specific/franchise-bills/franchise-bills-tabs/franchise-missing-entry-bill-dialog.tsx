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
import {
  MissingItemsFormSchema,
  MissingItemsSchema,
} from "@/schemas/missing-items";
import { zodResolver } from "@hookform/resolvers/zod";
import { BadgeAlert } from "lucide-react";
import { useForm } from "react-hook-form";
import FranchiseMissingEntryBillForm from "./franchise-missing-entry-bill-form";

interface Props {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  missingItems: BillItem[];
}

export default function ({ open, setOpen, missingItems }: Props) {
  const defaultValues = {
    items: missingItems.map((product) => ({
      productId: product.product_variant_id,
      broken: 0,
      missing: product.quantity,
      total: product.quantity,
    })),
  };
  const form = useForm<MissingItemsSchema>({
    resolver: zodResolver(MissingItemsFormSchema),
    defaultValues,
  });

  const onSaveClicked = (data: MissingItemsSchema) => {
    console.log(data);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex gap-2 items-center">
            <BadgeAlert />
            Report Missing Products
          </DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>

        <FranchiseMissingEntryBillForm form={form} products={missingItems} />

        <DialogFooter>
          <Button
            variant={"outline"}
            onClick={() => {
              setOpen(false);
            }}
          >
            Cancel
          </Button>
          <Button onClick={form.handleSubmit(onSaveClicked)}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
