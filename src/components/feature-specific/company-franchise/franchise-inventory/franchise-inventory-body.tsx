import { RootState } from "@/app/store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { getCompanyFranchiseInventory } from "@/services/franchise-service";
import { getFranchiseInventoryTotalCost } from "@/services/inventory-service";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { franchiseInventoryColumns } from "./franchise-inventory-columns";

export default function () {
  const franchise = useSelector(
    (state: RootState) => state.franchise.franchise
  );
  if (!franchise) return;
  const { pathname } = useLocation();
  const isModerator = pathname.includes("moderator");
  const { data: inventory } = useQuery({
    queryKey: ["franchise-inventory", franchise.ID],
    queryFn: () => getCompanyFranchiseInventory(franchise.ID),
    enabled: !!franchise,
  });
  const filteredItems = useMemo(
    () =>
      inventory?.data?.items_with_cost?.filter(
        (item) => item.product?.is_active !== false
      ) ?? [],
    [inventory?.data?.items_with_cost]
  );
  const { data: totalCostData } = useQuery({
    queryKey: ["inventory-total-cost"],
    queryFn: () => getFranchiseInventoryTotalCost(franchise.ID),
    enabled: !!franchise,
  });
  return (
    <div>
      <div className={!isModerator ? "grid grid-cols-2 gap-2" : "hidden"}>
      <Card>
          <CardHeader>
            <CardTitle>Total First Price</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-2xl font-bold">
              {Intl.NumberFormat("en-DZ", {
                style: "currency",
                currency: "DZD",
              }).format(totalCostData?.data?.total_first_price ?? 0)}
            </CardDescription>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Franchise Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-2xl font-bold">
              {Intl.NumberFormat("en-DZ", {
                style: "currency",
                currency: "DZD",
              }).format(totalCostData?.data?.total_franchise_price ?? 0)}
            </CardDescription>
          </CardContent>
        </Card>
      </div>
      <DataTable
        data={filteredItems}
        searchColumn="name"
        columns={franchiseInventoryColumns.filter(column => !isModerator || column.id !== "cost" && column.id !== "franchise_cost")}
      />
    </div>
  );
}
