import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Charge } from "@/models/data/charges/charge.model";
import { approveCharge } from "@/services/charges-service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

interface ApproveChargeDialogProps {
  charge: Charge | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ApproveChargeDialog({
  charge,
  open,
  onOpenChange,
}: ApproveChargeDialogProps) {
  const [notes, setNotes] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { mutate: approveChargeMutation, isPending } = useMutation({
    mutationFn: () => approveCharge(charge!.ID, notes || undefined),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Charge approved successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["charges"] });
      onOpenChange(false);
      setNotes("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to approve charge",
        variant: "destructive",
      });
    },
  });

  const handleApprove = () => {
    if (!charge) return;
    approveChargeMutation();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Approve Charge</DialogTitle>
          <DialogDescription>
            Are you sure you want to approve this charge? This action will mark the charge as approved.
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
            
            <div className="space-y-2">
              <label htmlFor="notes" className="text-sm font-medium">
                Notes (Optional)
              </label>
              <Textarea
                id="notes"
                placeholder="Add approval notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
        )}
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleApprove}
            disabled={isPending}
            className="bg-green-600 hover:bg-green-700"
          >
            {isPending ? "Approving..." : "Approve Charge"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 