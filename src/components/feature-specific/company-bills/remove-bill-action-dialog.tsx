import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { ExitBill } from "@/models/data/bill.model";
import { removeExitBill } from "@/services/bill-service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { useState } from "react";

interface Props {
  bill: ExitBill;
}

export default function ({ bill }: Props) {
  const [open, setOpen] = useState(false);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { mutate: removeExitBillMutation, isPending } = useMutation({
    mutationFn: removeExitBill,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Bill removed successfully",
      });
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["exit_bills"] });
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
        <DropdownMenuItem
          onSelect={(e) => e.preventDefault()}
          onClick={async () => {}}
          className="text-red-500"
        >
          <Trash2 /> Remove Bill
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent>
        <div>Are you sure you want to remove this bill ?</div>
        <DialogFooter>
          <Button
            variant="destructive"
            onClick={() => removeExitBillMutation(bill.ID)}
            disabled={isPending}
          >
            Remove
          </Button>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
