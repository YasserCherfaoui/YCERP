import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { WooOrder } from "@/models/data/woo-order.model";
import { declareEmptyExchange } from "@/services/woocommerce-service";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface DeclareEmptyExchangeDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  order: WooOrder;
  queryKey: any[];
}

export default function DeclareEmptyExchangeDialog({ open, setOpen, order, queryKey }: DeclareEmptyExchangeDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { mutate: declareExchange, isPending } = useMutation({
    mutationFn: declareEmptyExchange,
    onSuccess: () => {
      toast({
        title: "Exchange declared",
        description: "Empty exchange has been declared successfully",
      });
      setOpen(false);
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (err: any) => {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
      console.error("Failed to declare empty exchange:", err);
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Declare Empty Exchange</DialogTitle>
          <DialogDescription>
            Are you sure you want to declare an empty exchange for order <span className="font-bold">#{order.number}</span>?
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="exchange-reason">
              Exchange Reason
            </Label>
            <Textarea
              id="exchange-reason"
              placeholder="Enter the reason for the exchange..."
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="exchange-comments">
              Additional Comments (Optional)
            </Label>
            <Textarea
              id="exchange-comments"
              placeholder="Add any additional notes about the exchange..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            disabled={isPending} 
            variant="default" 
            onClick={() => {
              const reason = (document.getElementById("exchange-reason") as HTMLTextAreaElement).value;
              const comments = (document.getElementById("exchange-comments") as HTMLTextAreaElement).value;
              
              if (!reason.trim()) {
                toast({
                  title: "Error",
                  description: "Please provide a reason for the exchange",
                  variant: "destructive",
                });
                return;
              }

              declareExchange({
                woo_order_id: order.id,
                reason: reason,
                comments: comments || undefined
              });
            }}
          >
            {isPending ? "Declaring..." : "Declare Exchange"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 