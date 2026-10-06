import WarehouseAppBar from "@/components/feature-specific/company-warehouse/warehouse-app-bar";
import WarehouseTable from "@/components/feature-specific/company-warehouse/warehouse-table";
import { useCallback, useState } from "react";

export default function WarehousePage() {
  const [inventoryId, setInventoryId] = useState<number | null>(null);
  const handleInventoryId = useCallback((id: number | null) => {
    setInventoryId(id);
  }, []);

  return (
    <div className="flex min-h-[calc(100dvh-3.5rem)] flex-col gap-6 p-4 pb-24 md:p-6">
      <WarehouseAppBar inventoryId={inventoryId} selectedRow={null} />
      <div className="flex min-h-0 flex-1 flex-col">
        <WarehouseTable onInventoryId={handleInventoryId} />
      </div>
    </div>
  );
}
