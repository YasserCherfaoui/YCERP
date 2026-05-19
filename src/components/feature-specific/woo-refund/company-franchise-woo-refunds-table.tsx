import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { FranchiseWooRefund } from "@/models/data/franchise-woo-refund.model";
import { CheckCircle2 } from "lucide-react";
import { useMemo, useState } from "react";
import { createCompanyFranchiseWooRefundsColumns } from "./company-franchise-woo-refunds-columns";
import {
  canSettleRefund,
  reimbursementAmountDue,
} from "./woo-refund-reimbursement";

const formatDZD = (n: number) =>
  new Intl.NumberFormat("en-DZ", {
    style: "currency",
    currency: "DZD",
    maximumFractionDigits: 0,
  }).format(n);

type Props = {
  refunds: FranchiseWooRefund[];
  onView: (refund: FranchiseWooRefund) => void;
  onRequestSettle: (refunds: FranchiseWooRefund[]) => void;
  isSettling?: boolean;
};

export function CompanyFranchiseWooRefundsTable({
  refunds,
  onView,
  onRequestSettle,
  isSettling,
}: Props) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const settleableRefunds = useMemo(
    () => refunds.filter(canSettleRefund),
    [refunds]
  );

  const selectedRefunds = useMemo(
    () =>
      refunds.filter(
        (r) => selectedIds.includes(String(r.ID)) && canSettleRefund(r)
      ),
    [refunds, selectedIds]
  );

  const selectedTotal = useMemo(
    () =>
      selectedRefunds.reduce((sum, r) => sum + reimbursementAmountDue(r), 0),
    [selectedRefunds]
  );

  const columns = useMemo(
    () => createCompanyFranchiseWooRefundsColumns(onView),
    [onView]
  );

  const selectAllSettleable = () => {
    setSelectedIds(settleableRefunds.map((r) => String(r.ID)));
  };

  const clearSelection = () => setSelectedIds([]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2">
        <span className="text-sm text-muted-foreground mr-1">
          {settleableRefunds.length} awaiting payment
          {selectedRefunds.length > 0 && (
            <>
              {" · "}
              <span className="text-foreground font-medium">
                {selectedRefunds.length} selected ({formatDZD(selectedTotal)})
              </span>
            </>
          )}
        </span>
        <div className="flex flex-wrap gap-2 ml-auto">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={selectAllSettleable}
            disabled={settleableRefunds.length === 0}
          >
            Select all
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={clearSelection}
            disabled={selectedIds.length === 0}
          >
            Unselect all
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => onRequestSettle(selectedRefunds)}
            disabled={selectedRefunds.length === 0 || isSettling}
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Settle
            {selectedRefunds.length > 0 ? ` (${selectedRefunds.length})` : ""}
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <DataTable
          data={refunds}
          searchColumn="order"
          columns={columns}
          selectedRows={selectedIds}
          setSelectedRows={setSelectedIds}
          getRowId={(row) => String(row.ID)}
          isRowSelectable={canSettleRefund}
        />
      </div>
    </div>
  );
}
