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
import { Product } from "@/models/data/product.model";
import { deleteProducts } from "@/services/product-service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { useState } from "react";

interface Props {
  product: Product;
}

export default function ({ product }: Props) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { mutate: removeProductMutation, isPending } = useMutation({
    mutationFn: deleteProducts,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["products"],
      });
      toast({
        title: "Product removed",
        description: "Product removed successfully",
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
      <DialogTrigger>
        <DropdownMenuItem
          onSelect={(e) => e.preventDefault()}
          className="text-red-500"
        >
          <Trash2 /> Remove Product
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Are you sure you want to remove{" "}
            <span className="text-red-500">{product.name}</span> ?
          </DialogTitle>
          <div className="flex flex-col gap-2 mt-2">
            The following action will affect:
            <ol className="list-disc list-inside">
              <li>Supplier Bills</li>
              <li>Franchise Bills</li>
              <li>Inventory</li>
              <li>Sales</li>
            </ol>
          </div>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={() => setOpen(false)} variant={"outline"}>
            Cancel
          </Button>
          <Button
            disabled={isPending}
            variant={"destructive"}
            onClick={() => removeProductMutation([product.ID])}
          >
            Remove
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
