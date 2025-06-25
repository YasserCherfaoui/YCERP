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
import { updateWooCommerceOrderStatus } from "@/services/woocommerce-service";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface SetCancelledStatusDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  order: WooOrder;
  ordersQueryKey?: any[];
}

export default function SetCancelledStatusDialog({ open, setOpen, order, ordersQueryKey }: SetCancelledStatusDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { mutate: updateStatus, isPending } = useMutation({
    mutationFn: updateWooCommerceOrderStatus,
    onSuccess: () => {
      toast({
        title: "Order status updated",
        description: "Order status set to cancelled successfully",
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
      console.error("Failed to update order status:", err);
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Cancel Order?</DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel order <span className="font-bold">#{order.number}</span>?
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="secondary" onClick={() => setOpen(false)}>
            No, Keep Order
          </Button>
          <Button 
            disabled={isPending} 
            variant="destructive" 
            onClick={() => {
              updateStatus({
                order_id: order.id,
                status: "cancelled"
              });
            }}
          >
            {isPending ? "Cancelling..." : "Yes, Cancel Order"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 