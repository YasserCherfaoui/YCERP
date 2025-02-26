import { RootState } from "@/app/store";
import CompanyProductsAppBar from "@/components/feature-specific/company-products/company-products-app-bar";
import { columns } from "@/components/feature-specific/company-products/products-table-columns";
import { DataTable } from "@/components/ui/data-table";
import { getAllProductsWithVariantsByCompany } from "@/services/product-service";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";

export default function () {
  const company = useSelector((state: RootState) => state.company.company);
  const { data } = useQuery({
    queryKey: ["products"],
    queryFn: () => getAllProductsWithVariantsByCompany(company?.ID ?? 0),
    enabled: !!company,
  });
  if (!company) return;
  return (
    <div className="flex flex-col gap-4 p-4">
      <CompanyProductsAppBar />
      {data?.data && <DataTable searchColumn="franchise.name" columns={columns} data={data?.data} />}
    </div>
  );
}
