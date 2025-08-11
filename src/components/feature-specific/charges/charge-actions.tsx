import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Charge } from "@/models/data/charges/charge.model";
import { CheckCircle, DollarSign, MoreVertical, XCircle } from "lucide-react";
import { useState } from "react";
import ApproveChargeDialog from "./approve-charge-dialog";
import MarkPaidChargeDialog from "./mark-paid-charge-dialog";
import RejectChargeDialog from "./reject-charge-dialog";

interface ChargeActionsProps {
  charge: Charge;
  onActionComplete?: () => void;
  showApprove?: boolean;
  showReject?: boolean;
  showMarkPaid?: boolean;
  variant?: "dropdown" | "buttons";
}

export default function ChargeActions({
  charge,
  onActionComplete,
  showApprove = true,
  showReject = true,
  showMarkPaid = true,
  variant = "dropdown",
}: ChargeActionsProps) {
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [markPaidDialogOpen, setMarkPaidDialogOpen] = useState(false);

  const canApprove = charge.status === "pending";
  const canReject = charge.status === "pending";
  const canMarkPaid = charge.status === "approved";

  const handleActionComplete = () => {
    onActionComplete?.();
  };

  if (variant === "buttons") {
    return (
      <>
        <div className="flex gap-2">
          {showApprove && canApprove && (
            <Button
              size="sm"
              onClick={() => setApproveDialogOpen(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="mr-1 h-3 w-3" />
              Approve
            </Button>
          )}
          {showReject && canReject && (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setRejectDialogOpen(true)}
            >
              <XCircle className="mr-1 h-3 w-3" />
              Reject
            </Button>
          )}
          {showMarkPaid && canMarkPaid && (
            <Button
              size="sm"
              onClick={() => setMarkPaidDialogOpen(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <DollarSign className="mr-1 h-3 w-3" />
              Mark Paid
            </Button>
          )}
        </div>

        <ApproveChargeDialog
          charge={charge}
          open={approveDialogOpen}
          onOpenChange={setApproveDialogOpen}
        />
        <RejectChargeDialog
          charge={charge}
          open={rejectDialogOpen}
          onOpenChange={setRejectDialogOpen}
        />
        <MarkPaidChargeDialog
          charge={charge}
          open={markPaidDialogOpen}
          onOpenChange={setMarkPaidDialogOpen}
        />
      </>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {showApprove && canApprove && (
            <DropdownMenuItem onClick={() => setApproveDialogOpen(true)}>
              <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
              Approve
            </DropdownMenuItem>
          )}
          {showReject && canReject && (
            <DropdownMenuItem onClick={() => setRejectDialogOpen(true)}>
              <XCircle className="mr-2 h-4 w-4 text-red-600" />
              Reject
            </DropdownMenuItem>
          )}
          {showMarkPaid && canMarkPaid && (
            <DropdownMenuItem onClick={() => setMarkPaidDialogOpen(true)}>
              <DollarSign className="mr-2 h-4 w-4 text-blue-600" />
              Mark as Paid
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <ApproveChargeDialog
        charge={charge}
        open={approveDialogOpen}
        onOpenChange={setApproveDialogOpen}
      />
      <RejectChargeDialog
        charge={charge}
        open={rejectDialogOpen}
        onOpenChange={setRejectDialogOpen}
      />
      <MarkPaidChargeDialog
        charge={charge}
        open={markPaidDialogOpen}
        onOpenChange={setMarkPaidDialogOpen}
      />
    </>
  );
} 