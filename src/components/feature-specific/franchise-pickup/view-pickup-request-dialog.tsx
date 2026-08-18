import { PickupRequestSummary } from "@/components/feature-specific/franchise-pickup/pickup-request-summary";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FranchisePickupRequest } from "@/models/data/franchise-pickup.model";

interface ViewPickupRequestDialogProps {
  request: FranchisePickupRequest | null;
  open: boolean;
  showFranchise?: boolean;
  onOpenChange: (open: boolean) => void;
  onCancelPending?: (request: FranchisePickupRequest) => void;
  onRespondPending?: (request: FranchisePickupRequest) => void;
}

export function ViewPickupRequestDialog({
  request,
  open,
  showFranchise = false,
  onOpenChange,
  onCancelPending,
  onRespondPending,
}: ViewPickupRequestDialogProps) {
  const pending = request?.status === "pending";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader className="pr-8 text-left">
          <DialogTitle>Pickup request</DialogTitle>
          <DialogDescription>
            {pending
              ? "Review the requested items before changing status."
              : "Request details and item outcomes."}
          </DialogDescription>
        </DialogHeader>
        {request ? (
          <PickupRequestSummary request={request} showFranchise={showFranchise} />
        ) : null}
        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
          {pending && onCancelPending && request ? (
            <Button
              type="button"
              variant="destructive"
              className="w-full sm:w-auto"
              onClick={() => onCancelPending(request)}
            >
              Cancel request
            </Button>
          ) : null}
          {pending && onRespondPending && request ? (
            <Button
              type="button"
              className="w-full sm:w-auto"
              onClick={() => onRespondPending(request)}
            >
              Respond
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
