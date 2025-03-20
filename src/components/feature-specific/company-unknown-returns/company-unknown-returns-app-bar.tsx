import { RootState } from "@/app/store";
import AppBarBackButton from "@/components/common/app-bar-back-button";
import AddCompanyUnknownReturnDialog from "@/components/feature-specific/company-unknown-returns/add-company-unknown-return-dialog";
import { useSelector } from "react-redux";

export default function () {
  const company = useSelector((state: RootState) => state.company.company);
  if (!company) return;
  return (
    <div className="flex justify-between">
      <div className="flex gap-4 items-center">
        <AppBarBackButton destination="Menu" />
        <span className="text-2xl font-bold">
          {company.company_name} &gt; Unknown Returns
        </span>
      </div>
      <AddCompanyUnknownReturnDialog />
    </div>
  );
}
