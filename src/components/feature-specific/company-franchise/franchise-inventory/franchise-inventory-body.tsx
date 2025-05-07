import { RootState } from "@/app/store";
import { DataTable } from "@/components/ui/data-table";
import { getCompanyFranchiseInventory } from "@/services/franchise-service";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { franchiseInventoryColumns } from "./franchise-inventory-columns";

export default function () {
  const franchise = useSelector(
    (state: RootState) => state.franchise.franchise
  );
  if (!franchise) return;
  const { data: inventory } = useQuery({
    queryKey: ["franchise-inventory", franchise.ID],
    queryFn: () => getCompanyFranchiseInventory(franchise.ID),
    enabled: !!franchise,
  });

  return (
    <div>
      <DataTable
        data={inventory?.data?.items ?? []}
        searchColumn="name"
        columns={franchiseInventoryColumns}
      />
    </div>
  );
}
