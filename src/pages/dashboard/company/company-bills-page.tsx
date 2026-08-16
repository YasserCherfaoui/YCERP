import CompanyBillsAppBar from "@/components/feature-specific/company-bills/company-bills-app-bar";
import CompanyBillsTable from "@/components/feature-specific/company-bills/company-bills-table";

export default function () {
  return (
    <div className="flex min-h-[calc(100dvh-3.5rem)] flex-col gap-3 p-4 pb-24">
      <CompanyBillsAppBar />
      <div className="flex min-h-0 flex-1 flex-col">
        <CompanyBillsTable />
      </div>
    </div>
  );
}
