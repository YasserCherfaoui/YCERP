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

interface SetPackingStatusDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  order: WooOrder;
  ordersQueryKey?: any[];
}

export default function SetPackingStatusDialog({ open, setOpen, order, ordersQueryKey }: SetPackingStatusDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { mutate: updateStatus, isPending } = useMutation({
    mutationFn: updateWooCommerceOrderStatus,
    onSuccess: () => {
      toast({
        title: "Order status updated",
        description: "Order status set to packing successfully",
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
          <DialogTitle>Set Order to Packing?</DialogTitle>
          <DialogDescription>
            Are you sure you want to set order <span className="font-bold">#{order.number}</span> to packing status?
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            disabled={isPending} 
            variant="default" 
            onClick={() => {
              updateStatus({
                order_id: order.id,
                status: "packing"
              });
            }}
          >
            {isPending ? "Updating..." : "Yes, Set to Packing"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 