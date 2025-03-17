import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { SupplierBill } from "@/models/data/supplier.model";
import { deleteSupplierBill } from "@/services/supplier-service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { useState } from "react";

interface Props {
  bill: SupplierBill;
}
export default function ({ bill }: Props) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { mutate: deleteSupplierBillMutation , isPending} = useMutation({
    mutationFn: deleteSupplierBill,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Supplier bill removed successfully",
      });
      setOpen(false);

      queryClient.invalidateQueries({ queryKey: ["supplier-bills"] });
      queryClient.invalidateQueries({ queryKey: ["supplier"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button variant={"ghost"} className="text-red-500 pl-2">
          <Trash2 /> Remove Supplier Bill
        </Button>
      </DialogTrigger>
      <DialogContent>
        <div>Are you sure you want to remove this bill ?</div>
        <DialogFooter>
          <Button
            disabled={isPending}
            variant={"destructive"}
            onClick={() => deleteSupplierBillMutation(bill.ID)}
          >
            Remove
          </Button>
          <Button variant={"outline"} onClick={() => setOpen(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
