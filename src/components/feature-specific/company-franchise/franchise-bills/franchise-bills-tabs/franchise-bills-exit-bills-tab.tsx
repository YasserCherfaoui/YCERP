import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { TabsContent } from "@/components/ui/tabs";
import { ExitBill } from "@/models/data/bill.model";
import { franchiseExitBillsColumns } from "./franchise-exit-bills-columns";

interface Props {
  exitBills?: Array<ExitBill>;
}

export default function ({ exitBills }: Props) {
  return (
    <TabsContent value="exit-bills" className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Exit Bills</CardTitle>
          <CardDescription>
            Bills sent by the company to your franchise
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="px-5 overflow-x-auto">
            <DataTable
              data={exitBills ?? []}
              searchColumn="CreatedAt"
              columns={franchiseExitBillsColumns}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" size="sm">
            Previous
          </Button>
          <div className="text-sm text-muted-foreground">Page 1 of 1</div>
          <Button variant="outline" size="sm">
            Next
          </Button>
        </CardFooter>
      </Card>
    </TabsContent>
  );
}
