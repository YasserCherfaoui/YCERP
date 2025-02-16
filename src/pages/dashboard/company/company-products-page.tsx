import { RootState } from "@/app/store";
import CompanyProductsAppBar from "@/components/feature-specific/company-products/company-products-app-bar";
import { columns } from "@/components/feature-specific/company-products/products-table-columns";
import { DataTable } from "@/components/ui/data-table";
import { useSelector } from "react-redux";

export default function () {
  const company = useSelector((state: RootState) => state.company.company);

  if (!company) return;
  return (
    <div className="flex flex-col gap-4 p-4">
      <CompanyProductsAppBar  />
      <DataTable columns={columns} data={company.products!} />
    </div>
  );
}
