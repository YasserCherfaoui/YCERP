import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { ClientStatusDialog } from "./client-status-dialog";

export default function ClientStatusDetailsDialog({
  open,
  onClose,
  statuses,
  onSetStatus,
  setStatusOpen,
  setSetStatusOpen,
  orderID,
}: {
  open: boolean;
  onClose: () => void;
  statuses: any[];
  onSetStatus: () => void;
  setStatusOpen: boolean;
  setSetStatusOpen: (open: boolean) => void;
  orderID: number;
}) {
  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-lg w-full">
          <DialogHeader>
            <DialogTitle>Client Status Details</DialogTitle>
            <DialogDescription>
              {statuses.length === 0
                ? "No client statuses available."
                : "Below are all client statuses for this order."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 my-4">
            {statuses.length === 0 ? (
              <div className="bg-gray-500 p-2 rounded-md text-white text-center">
                No status
              </div>
            ) : (
              statuses.map((status, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "p-3 rounded-md text-black flex flex-col gap-1 border",
                    !(
                      status.sub_qualification?.color ||
                      (status.qualification?.color && status.qualification?.color.startsWith("#"))
                    ) && "bg-gray-200"
                  )}
                  style={{
                    backgroundColor:
                      status.sub_qualification?.color
                        ? status.sub_qualification?.color
                        : status.qualification?.color && status.qualification?.color.startsWith("#")
                        ? status.qualification?.color
                        : undefined,
                  }}
                >
                  <span className="font-bold">
                    {status.qualification?.name || "-"}
                  </span>
                  <span>{status.sub_qualification?.name || "-"}</span>
                  {status.comment && (
                    <span className="italic text-xs">{status.comment}</span>
                  )}
                  {status.date && (
                    <span className="text-xs text-gray-600">
                      {new Date(status.date).toLocaleString()}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={onClose} type="button">
              Close
            </Button>
            <Button
              variant="default"
              onClick={onSetStatus}
              type="button"
            >
              Set Client Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <ClientStatusDialog
        open={setStatusOpen}
        setOpen={setSetStatusOpen}
        orderID={orderID}
      />
    </>
  );
} 