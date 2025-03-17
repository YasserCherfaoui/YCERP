import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Supplier } from "@/models/data/supplier.model";
import { removeSupplier } from "@/services/supplier-service";
import { DialogDescription } from "@radix-ui/react-dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { useState } from "react";

interface Props {
  supplier: Supplier;
}

export default function ({ supplier }: Props) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { mutate: removeSupplierMutation, isPending } = useMutation({
    mutationFn: removeSupplier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      setOpen(false);
      toast({
        title: "Success",
        description: "Supplier removed successfully",
      });
    },
    onError: (error) => {
      setOpen(false);
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
        <Button variant={"ghost"} className="text-red-500">
          <Trash2 />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove Supplier</DialogTitle>
          <DialogDescription>
            Are you sure you want to remove <span className="font-bold text-red-500">{supplier.name}</span> from your suppliers
            list?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={()=> setOpen(false)} variant={"outline"}>Cancel</Button>
          <Button
            disabled={isPending}
            variant={"destructive"}
            onClick={() => {
              removeSupplierMutation(supplier.ID);
            }}
          >
            Remove
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
