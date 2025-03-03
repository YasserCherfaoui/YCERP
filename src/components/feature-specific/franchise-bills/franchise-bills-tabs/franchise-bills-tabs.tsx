import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EntryBill, ExitBill } from "@/models/data/bill.model";
import { APIResponse } from "@/models/responses/api-response.model";
import { Package, PackagePlus } from "lucide-react";
import FranchiseBillsExitBillsTab from "./franchise-bills-exit-bills-tab";

interface Props {
  exitBills?: APIResponse<Array<ExitBill>>;
  entryBills?: APIResponse<Array<EntryBill>>;
}

export default function ({ exitBills }: Props) {
  // const [selectedTab, setSelectedTab] = useState("exit-bills");
  return (
    <Tabs
      defaultValue="exit-bills"
      className="w-full"
      // onValueChange={setSelectedTab}
    >
      <TabsList className="grid w-full grid-cols-2 md:w-auto">
        <TabsTrigger value="exit-bills" className="flex items-center gap-2">
          <PackagePlus className="h-4 w-4" />
          <span className="hidden sm:inline">Exit Bills</span>
        </TabsTrigger>
        <TabsTrigger value="entry-bills" className="flex items-center gap-2">
          <Package className="h-4 w-4" />
          <span className="hidden sm:inline">Entry Bills</span>
        </TabsTrigger>
      </TabsList>
      <FranchiseBillsExitBillsTab exitBills={exitBills?.data} />
    </Tabs>
  );
}
