import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BillItem, EntryBill } from "@/models/data/bill.model";
import { APIResponse } from "@/models/responses/api-response.model";
import { CreateEntryBillSchema } from "@/schemas/bill";
import { UseMutateFunction } from "@tanstack/react-query";
import { BadgeAlert } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import FranchiseMissingEntryBillForm from "./franchise-missing-entry-bill-form";

interface Props {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  missingItems: BillItem[];
  primaryForm: UseFormReturn<CreateEntryBillSchema>;
  setPrimaryFormOpen: React.Dispatch<React.SetStateAction<boolean>>;
  submitMutation?: UseMutateFunction<APIResponse<EntryBill>,Error, CreateEntryBillSchema, unknown> ;

}

export default function ({ open, setOpen, missingItems, primaryForm,setPrimaryFormOpen, submitMutation }: Props) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex gap-2 items-center">
            <BadgeAlert />
            Report Missing Products
          </DialogTitle>
          <DialogDescription>
            Please fill the form below to report the missing products.
          </DialogDescription>
        </DialogHeader>
        <FranchiseMissingEntryBillForm
          primaryForm={primaryForm}
          open={open}
          setOpen={setOpen}
          products={missingItems}
          setPrimaryFormOpen={setPrimaryFormOpen}
          submitMutation={submitMutation}
        />
      </DialogContent>
    </Dialog>
  );
}
