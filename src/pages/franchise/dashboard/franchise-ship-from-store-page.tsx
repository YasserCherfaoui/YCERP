import FranchiseShipFromStoreAppBar from "@/components/feature-specific/ship-from-store/franchise-ship-from-store-app-bar";
import { DataTable } from "@/components/ui/data-table";
import { listShipFromStoreFranchise } from "@/services/ship-from-store-service";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";
import { franchiseShipFromStoreColumns } from "@/components/feature-specific/ship-from-store/franchise-ship-from-store-columns";

export default function FranchiseShipFromStorePage() {
  const franchise = useSelector((state: RootState) => state.franchise.franchise);
  const { data } = useQuery({
    queryKey: ["franchise-ship-from-store"],
    queryFn: listShipFromStoreFranchise,
    enabled: !!franchise,
  });
  const records = data?.data ?? [];

  return (
    <div className="p-4">
      <FranchiseShipFromStoreAppBar />
      <DataTable
        data={records}
        searchColumn="tracking_number"
        columns={franchiseShipFromStoreColumns}
      />
    </div>
  );
}
