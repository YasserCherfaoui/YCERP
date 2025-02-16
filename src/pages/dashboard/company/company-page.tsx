import CompanyAppbar from "@/components/feature-specific/company/company-appbar";
import CompanyBody from "@/components/feature-specific/company/company-body";

export default function () {
  return (
    <div className="flex flex-col m-10">
      <CompanyAppbar />
      <CompanyBody />
    </div>
  );
}
