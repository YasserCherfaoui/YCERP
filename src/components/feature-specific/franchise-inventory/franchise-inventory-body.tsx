import { RootState } from "@/app/store";
import WarehouseTable from "@/components/feature-specific/company-warehouse/warehouse-table";
import { useSelector } from "react-redux";

interface Props {
  onInventoryId: (inventoryId: number | null) => void;
}

export default function FranchiseInventoryBody({ onInventoryId }: Props) {
  const franchise = useSelector((state: RootState) => state.franchise.franchise);
  if (!franchise) return null;

  return (
    <WarehouseTable
      franchiseId={franchise.ID}
      costMode="franchise-price"
      showActions={false}
      onInventoryId={onInventoryId}
    />
  );
}
