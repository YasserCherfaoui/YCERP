import { RootState } from "@/app/store";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { BrokenItemTransfer } from "@/models/data/broken-item-transfer.model";
import { approveTransfer } from "@/services/broken-items-service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, X } from "lucide-react";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface ApproveTransferDialogProps {
  transfer: BrokenItemTransfer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ApproveTransferDialog({
  transfer,
  open,
  onOpenChange,
}: ApproveTransferDialogProps) {
  const [notes, setNotes] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { mutate: approveTransferMutation, isPending: isApproving } = useMutation({
    mutationFn: ({ action }: { action: "approve" | "reject" }) =>
      approveTransfer(transfer.ID, { action, notes: notes || undefined }),
    onSuccess: (_, variables) => {
      onOpenChange(false);
      toast({
        title: variables.action === "approve" ? "Transfer Approved" : "Transfer Rejected",
        description:
          variables.action === "approve"
            ? "Broken items have been transferred to company inventory"
            : "Transfer request has been rejected",
      });
      setNotes("");
      queryClient.invalidateQueries({
        queryKey: ["broken-items-transfers"],
      });
      queryClient.invalidateQueries({
        queryKey: ["inventory"],
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error processing transfer",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    },
  });

  const handleApprove = () => {
    approveTransferMutation({ action: "approve" });
  };

  const handleReject = () => {
    approveTransferMutation({ action: "reject" });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Review Transfer Request</DialogTitle>
          <DialogDescription>
            Review the broken items transfer request and approve or reject it.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">From</Label>
              <p className="text-sm text-gray-600">
                {transfer.from_inventory?.name || `Franchise ${transfer.franchise_id}`}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium">To</Label>
              <p className="text-sm text-gray-600">
                {transfer.to_inventory?.name || `Company ${transfer.company_id}`}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium">Requested By</Label>
              <p className="text-sm text-gray-600">
                {transfer.requested_by?.name || `Admin ${transfer.requested_by_id}`}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium">Status</Label>
              <p className="text-sm font-semibold capitalize">{transfer.status}</p>
            </div>
          </div>

          {transfer.notes && (
            <div>
              <Label className="text-sm font-medium">Notes</Label>
              <p className="text-sm text-gray-600">{transfer.notes}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label>Items to Transfer</Label>
            <ScrollArea className="h-[300px] border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>QR Code</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Broken Qty</TableHead>
                    <TableHead>Recovered</TableHead>
                    <TableHead>Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transfer.items?.map((item) => (
                    <TableRow key={item.ID}>
                      <TableCell className="font-mono">
                        {item.broken_item?.product_variant?.qr_code || "N/A"}
                      </TableCell>
                      <TableCell>
                        {item.broken_item?.product_variant?.name ||
                          item.broken_item?.inventory_item?.name ||
                          "N/A"}
                      </TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>
                        {item.broken_item?.recovered_quantity || 0}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {item.broken_item?.reason || "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>

          <div className="space-y-2">
            <Label htmlFor="review-notes">Notes (Optional)</Label>
            <Textarea
              id="review-notes"
              placeholder="Add notes about your decision..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleReject}
            disabled={isApproving}
          >
            <X className="mr-2 h-4 w-4" />
            Reject
          </Button>
          <Button onClick={handleApprove} disabled={isApproving}>
            <Check className="mr-2 h-4 w-4" />
            {isApproving ? "Processing..." : "Approve"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
