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
import { rejectCharge } from "@/services/charges-service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

interface RejectChargeDialogProps {
  charge: Charge | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function RejectChargeDialog({
  charge,
  open,
  onOpenChange,
}: RejectChargeDialogProps) {
  const [reason, setReason] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { mutate: rejectChargeMutation, isPending } = useMutation({
    mutationFn: () => rejectCharge(charge!.ID, reason),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Charge rejected successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["charges"] });
      onOpenChange(false);
      setReason("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reject charge",
        variant: "destructive",
      });
    },
  });

  const handleReject = () => {
    if (!charge) return;
    if (!reason.trim()) {
      toast({
        title: "Error",
        description: "Reason is required for rejecting a charge",
        variant: "destructive",
      });
      return;
    }
    rejectChargeMutation();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject Charge</DialogTitle>
          <DialogDescription>
            Are you sure you want to reject this charge? This action will mark the charge as rejected.
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
              <label htmlFor="reason" className="text-sm font-medium">
                Reason <span className="text-red-500">*</span>
              </label>
              <Textarea
                id="reason"
                placeholder="Provide a reason for rejecting this charge..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                required
              />
            </div>
          </div>
        )}
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleReject}
            disabled={isPending || !reason.trim()}
            variant="destructive"
          >
            {isPending ? "Rejecting..." : "Reject Charge"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 