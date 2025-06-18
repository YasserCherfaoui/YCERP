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
import { dispatchWooCommerceOrder } from "@/services/woocommerce-service";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface DispatchConfirmDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  order: WooOrder;
  ordersQueryKey?: any[];
}

export default function DispatchConfirmDialog({ open, setOpen, order, ordersQueryKey }: DispatchConfirmDialogProps) {
  const {toast} = useToast();
  const queryClient = useQueryClient();
  const {mutate: dispatchWooCommerceOrderMutation, isPending} = useMutation({
    mutationFn: dispatchWooCommerceOrder,
    onSuccess: () => {
      toast({
        title: "Order dispatched",
        description: "Order dispatched successfully",
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
      console.error("Failed to dispatch order:", err);
    },
  });
    return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Dispatch Order?</DialogTitle>
          <DialogDescription>
            Are you sure you want to dispatch order <span className="font-bold">#{order.id}</span>?
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button disabled={isPending} variant="default" onClick={() => { setOpen(false); dispatchWooCommerceOrderMutation(order.id); }}>
            {isPending ? "Dispatching..." : "Yes, Dispatch"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 