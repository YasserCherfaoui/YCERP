import WarehouseAppBar from "@/components/feature-specific/company-warehouse/warehouse-app-bar";
import WarehouseTable from "@/components/feature-specific/company-warehouse/warehouse-table";
import { useState } from "react";

export default function() {
  const [selectedRow, setSelectedRow] = useState<number | null>(null);

    return <div className="flex flex-col p-4">
        <WarehouseAppBar selectedRow={selectedRow} setSelectedRow={setSelectedRow} />
        <WarehouseTable />
    </div>
}