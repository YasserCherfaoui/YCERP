import { Badge } from "@/components/ui/badge";
import { ExitBill } from "@/models/data/bill.model";

export type ExitBillDisplayStatus =
  | "pending"
  | "preparing"
  | "prepared"
  | "acquired";

/** Matches the badge shown in bills tables. */
export function getExitBillDisplayStatus(
  bill: ExitBill
): ExitBillDisplayStatus {
  if (bill.status === "preparing") return "preparing";
  if (bill.status === "prepared" && bill.entry_bill == null) return "prepared";
  if (bill.entry_bill == null) return "pending";
  return "acquired";
}

const STATUS_LABELS: Record<ExitBillDisplayStatus, string> = {
  pending: "Pending",
  preparing: "Preparing",
  prepared: "Prepared",
  acquired: "Acquired",
};

/** Status badge for exit bills: preparing / prepared / pending / acquired. */
export function ExitBillStatusBadge({ bill }: { bill: ExitBill }) {
  const status = getExitBillDisplayStatus(bill);
  if (status === "preparing") {
    return (
      <Badge className="bg-yellow-300 text-black hover:bg-yellow-300">
        {STATUS_LABELS.preparing}
      </Badge>
    );
  }
  if (status === "prepared") {
    return <Badge variant="secondary">{STATUS_LABELS.prepared}</Badge>;
  }
  if (status === "pending") {
    return <Badge variant="destructive">{STATUS_LABELS.pending}</Badge>;
  }
  return <Badge variant="secondary">{STATUS_LABELS.acquired}</Badge>;
}
