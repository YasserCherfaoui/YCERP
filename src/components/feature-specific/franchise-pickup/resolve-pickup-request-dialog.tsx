import { PickupStatusBadge, formatPickupItem } from "@/components/feature-specific/franchise-pickup/pickup-status";
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
import {
  FranchisePickupItemStatus,
  FranchisePickupRequest,
} from "@/models/data/franchise-pickup.model";
import { resolveFranchisePickupRequest } from "@/services/franchise-pickup-service";
import { cn } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";

type ItemOutcome = Exclude<FranchisePickupItemStatus, "pending">;

interface ResolvePickupRequestDialogProps {
  request: FranchisePickupRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ResolvePickupRequestDialog({
  request,
  open,
  onOpenChange,
}: ResolvePickupRequestDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [outcomes, setOutcomes] = useState<Record<number, ItemOutcome | "">>({});
  const [step, setStep] = useState<"select" | "confirm">("select");

  const items = request?.items ?? [];

  useEffect(() => {
    if (open && request) {
      setStep("select");
      setOutcomes(
        Object.fromEntries((request.items ?? []).map((item) => [item.ID, ""]))
      );
    }
  }, [open, request]);

  const allChosen = items.length > 0 && items.every((item) => outcomes[item.ID]);
  const pickedItems = items.filter((item) => outcomes[item.ID] === "picked");
  const unavailableItems = items.filter(
    (item) => outcomes[item.ID] === "not_available"
  );
  const pickedUnits = pickedItems.reduce((sum, item) => sum + item.quantity, 0);

  const summary = useMemo(() => {
    if (pickedItems.length === 0) {
      return "No stock will change. The company will see this request as not available.";
    }
    if (unavailableItems.length === 0) {
      return `This deducts ${pickedUnits} unit${pickedUnits === 1 ? "" : "s"} from franchise inventory.`;
    }
    return `This deducts ${pickedUnits} unit${pickedUnits === 1 ? "" : "s"} for picked items. Unavailable items will not change stock.`;
  }, [pickedItems.length, unavailableItems.length, pickedUnits]);

  const { mutate, isPending } = useMutation({
    mutationFn: () => {
      if (!request) {
        return Promise.reject(new Error("No request selected"));
      }
      return resolveFranchisePickupRequest(request.ID, {
        items: items.map((item) => ({
          id: item.ID,
          status: outcomes[item.ID] as ItemOutcome,
        })),
      });
    },
    onSuccess: () => {
      toast({ title: "Pickup request updated" });
      queryClient.invalidateQueries({ queryKey: ["franchise-pickup-requests"] });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Could not update request",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const setAll = (status: ItemOutcome) => {
    setOutcomes(Object.fromEntries(items.map((item) => [item.ID, status])));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader className="pr-8 text-left">
          <DialogTitle>
            {step === "select" ? "Respond to pickup" : "Confirm pickup outcome"}
          </DialogTitle>
          <DialogDescription>
            {step === "select"
              ? "Mark each item as picked or not available. Stock is deducted only for picked items."
              : summary}
          </DialogDescription>
        </DialogHeader>

        {step === "select" ? (
          <div className="space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setAll("picked")}
              >
                Mark all picked
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setAll("not_available")}
              >
                Mark all not available
              </Button>
            </div>
            {items.map((item) => {
              const chosen = outcomes[item.ID];
              return (
                <div key={item.ID} className="space-y-2 rounded-lg border p-3">
                  <p className="text-sm font-medium">{formatPickupItem(item)}</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant={chosen === "picked" ? "default" : "outline"}
                      aria-pressed={chosen === "picked"}
                      onClick={() =>
                        setOutcomes((current) => ({ ...current, [item.ID]: "picked" }))
                      }
                    >
                      Picked
                    </Button>
                    <Button
                      type="button"
                      variant={chosen === "not_available" ? "destructive" : "outline"}
                      aria-pressed={chosen === "not_available"}
                      className={cn(chosen !== "not_available" && "text-foreground")}
                      onClick={() =>
                        setOutcomes((current) => ({
                          ...current,
                          [item.ID]: "not_available",
                        }))
                      }
                    >
                      Not available
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <ul className="space-y-2">
            {items.map((item) => (
              <li
                key={item.ID}
                className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm"
              >
                <span className="min-w-0 break-words font-medium">
                  {formatPickupItem(item)}
                </span>
                <PickupStatusBadge status={outcomes[item.ID] as ItemOutcome} />
              </li>
            ))}
          </ul>
        )}

        <DialogFooter className="gap-2">
          {step === "confirm" ? (
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              disabled={isPending}
              onClick={() => setStep("select")}
            >
              Back
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
          )}
          {step === "select" ? (
            <Button
              type="button"
              className="w-full sm:w-auto"
              disabled={!allChosen}
              onClick={() => setStep("confirm")}
            >
              Review and confirm
            </Button>
          ) : (
            <Button
              type="button"
              className="w-full sm:w-auto"
              disabled={isPending}
              onClick={() => mutate()}
            >
              Confirm outcome
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
