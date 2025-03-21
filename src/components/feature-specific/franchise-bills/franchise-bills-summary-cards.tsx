import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EntryBill, ExitBill } from "@/models/data/bill.model";
import { FranchiseTotals } from "@/models/data/franchise.model";
import { APIResponse } from "@/models/responses/api-response.model";
import { FileText, Package, PackageMinus, PackagePlus } from "lucide-react";

interface Props {
  exitBills?: APIResponse<Array<ExitBill>>;
  entryBills?: APIResponse<Array<EntryBill>>;
  paymentTotals?: APIResponse<FranchiseTotals>;
}

export default function ({ exitBills, entryBills, paymentTotals }: Props) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Exit Bills
          </CardTitle>
          <PackagePlus className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{exitBills?.data?.length}</div>
          <p className="text-xs text-muted-foreground"></p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Entry Bills
          </CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{entryBills?.data?.length}</div>
          <p className="text-xs text-muted-foreground"></p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Due Bills</CardTitle>
          <PackageMinus className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {new Intl.NumberFormat("en-DZ", {
              style: "currency",
              currency: "DZD",
            }).format(paymentTotals?.data?.totals.due ?? 0)}
          </div>
          <p className="text-xs text-muted-foreground"></p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Amount of bills</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {/* Total amount of bills */}
            {new Intl.NumberFormat("en-DZ", {
              style: "currency",
              currency: "DZD",
            }).format(
              exitBills?.data
                ?.map((bill) => bill.franchise_total_amount)
                .reduce((prev, curr) => prev + curr, 0) ?? 0
            )}
          </div>
          <p className="text-xs text-muted-foreground"></p>
        </CardContent>
      </Card>
    </div>
  );
}
