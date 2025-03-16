import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { TabsContent } from "@/components/ui/tabs";
import { EntryBill } from "@/models/data/bill.model";
import { franchiseEntryBillsColumns } from "./franchise-entry-bills-columns";

interface Props {
  entryBills?: Array<EntryBill>;
}
export default function ({ entryBills }: Props) {
  return (
    <TabsContent value="entry-bills" className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Entry Bills</CardTitle>
          <CardDescription>
            Bills received by your franchise from the company
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <div className="px-5 overflow-x-auto">
            <DataTable
              data={entryBills ?? []}
              columns={franchiseEntryBillsColumns}
              searchColumn={""}
            />
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
}
