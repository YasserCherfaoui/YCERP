import CompanySalesAppBar from "@/components/feature-specific/company-sales/company-sales-app-bar";
import CompanySalesTable from "@/components/feature-specific/company-sales/company-sales-table";

export default function () {
  return (
    <div className="flex flex-col gap-4 p-4">
      <CompanySalesAppBar />
      <CompanySalesTable />
    </div>
  );
}
