import { companyFranchiseCommissionsColumns } from "@/components/feature-specific/ship-from-store/company-franchise-commissions-columns";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { FranchiseCommission } from "@/models/data/franchise-commission.model";
import { CheckCircle2 } from "lucide-react";
import { useMemo, useState } from "react";

const formatDZD = (n: number) =>
  new Intl.NumberFormat("en-DZ", {
    style: "currency",
    currency: "DZD",
    maximumFractionDigits: 0,
  }).format(n);

export function canMarkCommissionPaid(commission: FranchiseCommission): boolean {
  return commission.status === "approved";
}

type Props = {
  commissions: FranchiseCommission[];
  onRequestMarkPaid: (commissions: FranchiseCommission[]) => void;
  isMarkingPaid?: boolean;
};

export function CompanyFranchiseCommissionsTable({
  commissions,
  onRequestMarkPaid,
  isMarkingPaid,
}: Props) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const payableCommissions = useMemo(
    () => commissions.filter(canMarkCommissionPaid),
    [commissions]
  );

  const selectedCommissions = useMemo(
    () =>
      commissions.filter(
        (c) => selectedIds.includes(String(c.ID)) && canMarkCommissionPaid(c)
      ),
    [commissions, selectedIds]
  );

  const selectedTotal = useMemo(
    () =>
      selectedCommissions.reduce((sum, c) => sum + (c.total_amount ?? 0), 0),
    [selectedCommissions]
  );

  const selectAllPayable = () => {
    setSelectedIds(payableCommissions.map((c) => String(c.ID)));
  };

  const clearSelection = () => setSelectedIds([]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2">
        <span className="text-sm text-muted-foreground mr-1">
          {payableCommissions.length} approved awaiting payout
          {selectedCommissions.length > 0 && (
            <>
              {" · "}
              <span className="text-foreground font-medium">
                {selectedCommissions.length} selected ({formatDZD(selectedTotal)})
              </span>
            </>
          )}
        </span>
        <div className="flex flex-wrap gap-2 ml-auto">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={selectAllPayable}
            disabled={payableCommissions.length === 0}
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
            onClick={() => onRequestMarkPaid(selectedCommissions)}
            disabled={selectedCommissions.length === 0 || isMarkingPaid}
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Mark as paid
            {selectedCommissions.length > 0
              ? ` (${selectedCommissions.length})`
              : ""}
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <DataTable
          data={commissions}
          columns={companyFranchiseCommissionsColumns}
          selectedRows={selectedIds}
          setSelectedRows={setSelectedIds}
          getRowId={(row) => String(row.ID)}
          isRowSelectable={canMarkCommissionPaid}
        />
      </div>
    </div>
  );
}
