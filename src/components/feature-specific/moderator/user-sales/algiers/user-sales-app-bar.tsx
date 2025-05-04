import { RootState } from "@/app/store";
import AppBarBackButton from "@/components/common/app-bar-back-button";
import { useSelector } from "react-redux";
import AddCompanySaleDialog from "./add-company-sale-dialog";

export default function () {
  const company = useSelector((state: RootState) => state.company.company);
  if (!company) return;
  return (
    <div className="flex justify-between">
      <div className="flex gap-4 items-center">
        <AppBarBackButton destination="Sales Menu" />
        <span className="text-2xl font-bold">
          {company.company_name} &gt; Sales
        </span>
      </div>
      <AddCompanySaleDialog />
    </div>
  );
}
