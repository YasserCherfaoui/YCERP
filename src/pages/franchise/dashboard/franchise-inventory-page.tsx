import FranchiseInventoryAppBar from "@/components/feature-specific/franchise-inventory/franchise-inventory-app-bar";
import FranchiseInventoryBody from "@/components/feature-specific/franchise-inventory/franchise-inventory-body";
import { useCallback, useState } from "react";

export default function FranchiseInventoryPage() {
  const [inventoryId, setInventoryId] = useState<number | null>(null);
  const handleInventoryId = useCallback((id: number | null) => {
    setInventoryId(id);
  }, []);

  return (
    <div className="flex min-h-[calc(100dvh-3.5rem)] flex-col gap-6 p-4 pb-24 md:p-6">
      <FranchiseInventoryAppBar inventoryId={inventoryId} />
      <div className="flex min-h-0 flex-1 flex-col">
        <FranchiseInventoryBody onInventoryId={handleInventoryId} />
      </div>
    </div>
  );
}
