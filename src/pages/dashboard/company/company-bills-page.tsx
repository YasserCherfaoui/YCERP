import CompanyBillsAppBar from "@/components/feature-specific/company-bills/company-bills-app-bar";
import CompanyBillsTable from "@/components/feature-specific/company-bills/company-bills-table";

export default function () {
  return (
    <div className="p-4">
      <CompanyBillsAppBar />
      <CompanyBillsTable />
    </div>
  );
}
