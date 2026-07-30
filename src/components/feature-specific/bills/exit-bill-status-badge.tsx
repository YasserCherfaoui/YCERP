import { Badge } from "@/components/ui/badge";
import { ExitBill } from "@/models/data/bill.model";

/** Status badge for exit bills: preparing / prepared / pending / acquired. */
export function ExitBillStatusBadge({ bill }: { bill: ExitBill }) {
  if (bill.status === "preparing") {
    return (
      <Badge className="bg-yellow-300 text-black hover:bg-yellow-300">
        Preparing
      </Badge>
    );
  }
  if (bill.status === "prepared" && bill.entry_bill == null) {
    return <Badge variant="secondary">Prepared</Badge>;
  }
  if (bill.entry_bill == null) {
    return <Badge variant="destructive">Pending</Badge>;
  }
  return <Badge variant="secondary">Acquired</Badge>;
}
