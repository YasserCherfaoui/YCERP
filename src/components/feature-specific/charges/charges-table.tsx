import { RootState } from "@/app/store";
import { Charge } from "@/models/data/charges/charge.model";
import { getCharges } from "@/services/charges-service";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import ApproveChargeDialog from "./approve-charge-dialog";
import ChargeTable from "./charge-table";
import MarkPaidChargeDialog from "./mark-paid-charge-dialog";
import RejectChargeDialog from "./reject-charge-dialog";

interface ChargesTableProps {
  companyId?: number;
  filters?: {
    type?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  };
}

export default function ChargesTable({ companyId, filters }: ChargesTableProps) {
  const [selectedCharge, setSelectedCharge] = useState<Charge | null>(null);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [markPaidDialogOpen, setMarkPaidDialogOpen] = useState(false);

  let company = useSelector((state: RootState) => state.company.company);
  const { pathname } = useLocation();
  
  if (pathname.includes("moderator")) {
    company = useSelector((state: RootState) => state.user.company);
  }

  const finalCompanyId = companyId || company?.ID;

  const { data: chargesData, isLoading, error } = useQuery({
    queryKey: ["charges", finalCompanyId, filters],
    queryFn: () => getCharges({
      company_id: finalCompanyId,
      type: filters?.type as any,
      status: filters?.status as any,
      date_from: filters?.dateFrom,
      date_to: filters?.dateTo,
    }),
    enabled: !!finalCompanyId,
  });

  const charges = chargesData?.data || [];

  const handleApprove = (charge: Charge) => {
    setSelectedCharge(charge);
    setApproveDialogOpen(true);
  };

  const handleReject = (charge: Charge) => {
    setSelectedCharge(charge);
    setRejectDialogOpen(true);
  };

  const handleMarkPaid = (charge: Charge) => {
    setSelectedCharge(charge);
    setMarkPaidDialogOpen(true);
  };

  const handleActionComplete = () => {
    // Refresh the charges data
    // The dialogs will handle invalidating the query
  };

  if (!finalCompanyId) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Company information is required to view charges.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Error loading charges: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ChargeTable
        charges={charges}
        loading={isLoading}
        onApprove={handleApprove}
        onReject={handleReject}
        onMarkPaid={handleMarkPaid}
        showActions={true}
        showSelection={false}
        compact={false}
      />

      {/* Approval Dialog */}
      <ApproveChargeDialog
        charge={selectedCharge}
        open={approveDialogOpen}
        onOpenChange={setApproveDialogOpen}
      />

      {/* Rejection Dialog */}
      <RejectChargeDialog
        charge={selectedCharge}
        open={rejectDialogOpen}
        onOpenChange={setRejectDialogOpen}
      />

      {/* Mark as Paid Dialog */}
      <MarkPaidChargeDialog
        charge={selectedCharge}
        open={markPaidDialogOpen}
        onOpenChange={setMarkPaidDialogOpen}
      />
    </div>
  );
} 