import { RootState } from "@/app/store";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { Sale } from "@/models/data/sale.model";
import { removeCompanyFranchiseSale } from "@/services/sale-service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { useSelector } from "react-redux";

interface Props {
  sale: Sale;
}

export default function ({ sale }: Props) {
  const franchise = useSelector((state: RootState) => state.franchise.franchise);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { mutate: removeSaleMutation, isPending } = useMutation({
    mutationFn: (saleID: number) => removeCompanyFranchiseSale(saleID),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["sales"],
      });
      queryClient.invalidateQueries({
        queryKey: ["franchise-inventory", franchise?.ID],
      });
      toast({
        title: "Sale removed",
        description: "Sale removed successfully",
      });
      setOpen(false);
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
      <DialogTrigger asChild>
        <DropdownMenuItem
          onSelect={(e) => e.preventDefault()}
          className="text-red-500"
          color="danger"
        >
          <Trash2 />
          Remove Sale
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Are you sure you want to remove sale S-{sale.ID} ?
          </DialogTitle>

          <div className="flex flex-col gap-2 mt-2">
            The following action will affect:
            <ol className="list-disc list-inside">
              <li>Inventory</li>
            </ol>
          </div>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={() => setOpen(false)} variant={"outline"}>
            Cancel
          </Button>
          <Button
            variant={"destructive"}
            disabled={isPending}
            onClick={() => removeSaleMutation(sale.ID)}
          >
            Remove
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
