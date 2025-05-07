import { RootState } from "@/app/store";
import CompanyProductsAppBar from "@/components/feature-specific/company-products/company-products-app-bar";
import { columns } from "@/components/feature-specific/company-products/products-table-columns";
import { DataTable } from "@/components/ui/data-table";
import { getAllProductsWithVariantsByCompany } from "@/services/product-service";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

export default function () {
  let company = useSelector((state: RootState) => state.company.company);
  const { pathname } = useLocation();
  const isModerator = pathname.includes("moderator");
  if (isModerator) {
    company = useSelector((state: RootState) => state.user.company);
  }
  if (!company) return;

  const { data } = useQuery({
    queryKey: ["products"],
    queryFn: () => getAllProductsWithVariantsByCompany(company.ID),
    enabled: !!company,
  });
  return (
    <div className="flex flex-col gap-4 p-4">
      <CompanyProductsAppBar />
      <DataTable
        searchColumn="product_name"
        columns={columns.filter(
          (column) => !isModerator || column.id !== "first_price"
        )}
        data={data?.data ?? []}
      />
    </div>
  );
}
