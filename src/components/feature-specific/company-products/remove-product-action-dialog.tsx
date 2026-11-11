import { liquidGlass } from "@/components/feature-specific/crm/crm-theme";
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
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Product } from "@/models/data/product.model";
import { deleteProducts } from "@/services/product-service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { useState } from "react";

interface Props {
  product: Product;
}

export default function RemoveProductActionDialog({ product }: Props) {
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
        description: `"${product.name}" was removed successfully.`,
      });
      setOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to remove product",
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
          className="text-rose-600 focus:text-rose-600 dark:text-rose-400"
        >
          <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
          Remove Product
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent
        className={cn(
          "flex max-w-md flex-col gap-0 overflow-hidden p-0 sm:p-0",
          liquidGlass
        )}
      >
        <DialogHeader className="space-y-2 border-b border-white/40 px-5 py-4 pr-12 text-left dark:border-white/10">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-200">
              <AlertTriangle className="h-4 w-4" aria-hidden="true" />
            </span>
            <span>Remove {product.name}?</span>
          </DialogTitle>
          <DialogDescription>
            Product #{product.ID} will be deleted from the catalog.
          </DialogDescription>
        </DialogHeader>

        <div className="px-5 py-4">
          <div className="rounded-xl border border-rose-200/80 bg-rose-50/70 p-3 text-sm text-rose-950 dark:border-rose-500/30 dark:bg-rose-950/30 dark:text-rose-100">
            <p className="font-medium">This action affects linked records:</p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-rose-900/85 dark:text-rose-200/85">
              <li>Supplier Bills</li>
              <li>Franchise Bills</li>
              <li>Inventory</li>
              <li>Sales</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="border-t border-white/40 px-5 py-3 dark:border-white/10">
          <Button
            type="button"
            variant="outline"
            className="bg-background"
            autoFocus
            disabled={isPending}
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={isPending}
            onClick={() => removeProductMutation([product.ID])}
          >
            {isPending && (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            )}
            Remove Product
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
