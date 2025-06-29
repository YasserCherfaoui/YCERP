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

interface SetUnconfirmedStatusDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  order: WooOrder;
  ordersQueryKey?: any[];
}

export default function SetUnconfirmedStatusDialog({ open, setOpen, order, ordersQueryKey }: SetUnconfirmedStatusDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { mutate: updateStatus, isPending } = useMutation({
    mutationFn: updateWooCommerceOrderStatus,
    onSuccess: () => {
      toast({
        title: "Order status updated",
        description: "Order status set to unconfirmed successfully",
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
          <DialogTitle>Set Order to Unconfirmed?</DialogTitle>
          <DialogDescription>
            Are you sure you want to set order <span className="font-bold">#{order.number}</span> to unconfirmed status?
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
                status: "unconfirmed"
              });
            }}
          >
            {isPending ? "Updating..." : "Yes, Set to Unconfirmed"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 