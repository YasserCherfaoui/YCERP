import { RootState } from "@/app/store";
import { franchiseProductsColumnsNormal, franchiseProductsColumnsVIP } from "@/components/feature-specific/franchise-products/franchise-products-columns";
import { DataTable } from "@/components/ui/data-table";
import { getFranchiseAllProducts } from "@/services/product-service";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";

export default function () {
  const franchise = useSelector(
    (state: RootState) => state.franchise.franchise
  );
  const { data: products } = useQuery({
    queryKey: ["products"],
    queryFn: () => getFranchiseAllProducts(franchise?.company_id ?? 0),
  });
  return (
    <div>
      <DataTable
        data={products?.data ?? []}
        columns={
          franchise?.franchise_type === "vip"
            ? franchiseProductsColumnsVIP
            : franchiseProductsColumnsNormal
        }
        searchColumn="name"
      />
    </div>
  );
}
