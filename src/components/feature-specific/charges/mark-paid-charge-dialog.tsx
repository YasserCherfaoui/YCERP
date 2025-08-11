import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Charge } from "@/models/data/charges/charge.model";
import { markChargeAsPaid } from "@/services/charges-service";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface MarkPaidChargeDialogProps {
  charge: Charge | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function MarkPaidChargeDialog({
  charge,
  open,
  onOpenChange,
}: MarkPaidChargeDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { mutate: markPaidMutation, isPending } = useMutation({
    mutationFn: () => markChargeAsPaid(charge!.ID),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Charge marked as paid successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["charges"] });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to mark charge as paid",
        variant: "destructive",
      });
    },
  });

  const handleMarkPaid = () => {
    if (!charge) return;
    markPaidMutation();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mark Charge as Paid</DialogTitle>
          <DialogDescription>
            Are you sure you want to mark this charge as paid? This action will update the charge status to paid.
          </DialogDescription>
        </DialogHeader>
        
        {charge && (
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium">{charge.title}</h4>
              <p className="text-sm text-muted-foreground">{charge.description}</p>
              <p className="text-sm font-medium mt-2">
                Amount: {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: charge.currency || 'DZD',
                }).format(charge.amount)}
              </p>
            </div>
          </div>
        )}
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleMarkPaid}
            disabled={isPending}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isPending ? "Marking as Paid..." : "Mark as Paid"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 