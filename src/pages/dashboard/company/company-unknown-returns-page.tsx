import CompanyUnknownReturnsAppBar from "@/components/feature-specific/company-unknown-returns/company-unknown-returns-app-bar";
import CompanyUnknownReturnsTable from "@/components/feature-specific/company-unknown-returns/company-unknown-returns-table";

export default function () {
  return (
    <div className="flex flex-col gap-4 p-4">
      <CompanyUnknownReturnsAppBar />
      <CompanyUnknownReturnsTable />
    </div>
  );
}
