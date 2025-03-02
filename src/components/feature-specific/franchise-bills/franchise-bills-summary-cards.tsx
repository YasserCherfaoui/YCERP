import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EntryBill, ExitBill } from "@/models/data/bill.model";
import { APIResponse } from "@/models/responses/api-response.model";
import { FileText, Package, PackageMinus, PackagePlus } from "lucide-react";

interface Props {
  exitBills?: APIResponse<Array<ExitBill>>;
  entryBills?: APIResponse<Array<EntryBill>>;
}

export default function ({ exitBills, entryBills }: Props) {
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
          <p className="text-xs text-muted-foreground">+2 from last month</p>
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
          <p className="text-xs text-muted-foreground">+1 from last month</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Missing Items</CardTitle>
          <PackageMinus className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">3</div>
          <p className="text-xs text-muted-foreground">-1 from last month</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Unpaid Bills</CardTitle>
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
          <p className="text-xs text-muted-foreground">-$50 from last month</p>
        </CardContent>
      </Card>
    </div>
  );
}
