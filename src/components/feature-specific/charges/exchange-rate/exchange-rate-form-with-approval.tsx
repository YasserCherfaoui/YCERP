import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Charge } from "@/models/data/charges/charge.model";
import { getCharges } from "@/services/charges-service";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import ApproveChargeDialog from "../approve-charge-dialog";
import MarkPaidChargeDialog from "../mark-paid-charge-dialog";
import RejectChargeDialog from "../reject-charge-dialog";
import ExchangeRateForm from "./exchange-rate-form";

interface ExchangeRateFormWithApprovalProps {
  companyId: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ExchangeRateFormWithApproval({
  companyId,
  onSuccess,
  onCancel,
}: ExchangeRateFormWithApprovalProps) {
  const [selectedCharge, setSelectedCharge] = useState<Charge | null>(null);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [markPaidDialogOpen, setMarkPaidDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch exchange rate charges for this company
  const { data: chargesData } = useQuery({
    queryKey: ["charges", companyId, "exchange_rate"],
    queryFn: () => getCharges({
      company_id: companyId,
      type: "exchange_rate",
      limit: 50,
    }),
    enabled: !!companyId,
  });

  const exchangeRateCharges = chargesData?.data || [];

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
    queryClient.invalidateQueries({ queryKey: ["charges", companyId] });
  };

  return (
    <div className="space-y-6">
      {/* Exchange Rate Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Create Exchange Rate Charge</span>
            <Badge variant="outline">
              {exchangeRateCharges.filter(c => c.status === "pending").length} Pending
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ExchangeRateForm
            companyId={companyId}
            onSuccess={onSuccess}
            onCancel={onCancel}
          />
        </CardContent>
      </Card>

      {/* Recent Exchange Rate Charges */}
      {exchangeRateCharges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Exchange Rate Charges</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {exchangeRateCharges.slice(0, 5).map((charge) => (
                <div
                  key={charge.ID}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <h4 className="font-medium">{charge.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {charge.description}
                    </p>
                    <p className="text-sm font-medium">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: charge.currency || 'DZD',
                      }).format(charge.amount)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        charge.status === "pending"
                          ? "secondary"
                          : charge.status === "approved"
                          ? "default"
                          : charge.status === "rejected"
                          ? "destructive"
                          : "outline"
                      }
                    >
                      {charge.status}
                    </Badge>
                    {charge.status === "pending" && (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(charge)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(charge)}
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                    {charge.status === "approved" && (
                      <Button
                        size="sm"
                        onClick={() => handleMarkPaid(charge)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Mark Paid
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Approval Dialogs */}
      <ApproveChargeDialog
        charge={selectedCharge}
        open={approveDialogOpen}
        onOpenChange={setApproveDialogOpen}
      />
      <RejectChargeDialog
        charge={selectedCharge}
        open={rejectDialogOpen}
        onOpenChange={setRejectDialogOpen}
      />
      <MarkPaidChargeDialog
        charge={selectedCharge}
        open={markPaidDialogOpen}
        onOpenChange={setMarkPaidDialogOpen}
      />
    </div>
  );
} 