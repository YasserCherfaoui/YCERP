import CompanyAppbar from "@/components/feature-specific/company/company-appbar";
import CompanyBody from "@/components/feature-specific/company/company-body";

export default function () {
  return (
    <div className="flex flex-col gap-6 px-4 py-6 md:m-10 md:gap-4 md:p-0">
      <CompanyAppbar />
      <CompanyBody />
    </div>
  );
}
