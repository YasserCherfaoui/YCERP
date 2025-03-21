import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { deleteEntryBill } from "@/services/bill-service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface RemoveEntryBillDialogProps {
  entryBillId: number;
}

export function RemoveEntryBillDialog({
  entryBillId,
}: RemoveEntryBillDialogProps) {
  const queryClient = useQueryClient();
  const [open, onOpenChange] = useState(false);

  const { mutate: removeEntryBill, isPending } = useMutation({
    mutationFn: () => deleteEntryBill(entryBillId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["franchise-entry-bills"] });
      toast.success("Entry bill removed successfully");
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error("Failed to remove entry bill");
      console.error("Error removing entry bill:", error);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <DropdownMenuItem className="text-red-500" onSelect={(e) => e.preventDefault()}>
          <Trash2 />
          Remove Entry Bill
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Remove Entry Bill</DialogTitle>
          <DialogDescription>
            Are you sure you want to remove this entry bill? This action cannot
            be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => removeEntryBill()}
            disabled={isPending}
          >
            {isPending ? "Removing..." : "Remove"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
