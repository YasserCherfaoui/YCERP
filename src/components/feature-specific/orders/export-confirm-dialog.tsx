import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { WooOrder } from "@/models/data/woo-order.model";
import { exportWooCommerceOrder } from "@/services/woocommerce-service";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface ExportConfirmDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  order: WooOrder;
  ordersQueryKey?: any[];
}

export default function ExportConfirmDialog({ open, setOpen, order, ordersQueryKey }: ExportConfirmDialogProps) {
    const {toast} = useToast();
    const queryClient = useQueryClient()
    const {mutate: exportWooCommerceOrderMutation, isPending} = useMutation({
        mutationFn: exportWooCommerceOrder,
        onSuccess: () => {
            toast({
                title: "Order exported",
                description: "Order exported successfully",
            });
            setOpen(false);
            if (ordersQueryKey) {
              queryClient.invalidateQueries({ queryKey: ordersQueryKey });
            } else {
              queryClient.invalidateQueries({ queryKey: ["orders"] });
            }
        },
        onError: (err: any) => {
            toast({
                title: "Error",
                description: err.message,
                variant: "destructive",
            });
            console.error("Failed to export order:", err);
        },
    });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Export Order?</DialogTitle>
          <DialogDescription>
            Are you sure you want to export order <span className="font-bold">#{order.id}</span>?
            This action will export the order data.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button disabled={isPending} variant="default" onClick={() => { setOpen(false); exportWooCommerceOrderMutation(order.id); }}>
            {isPending ? "Exporting..." : "Yes, Export"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 