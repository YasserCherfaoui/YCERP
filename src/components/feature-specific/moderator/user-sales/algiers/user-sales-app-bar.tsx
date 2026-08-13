import { RootState } from "@/app/store";
import AppBarBackButton from "@/components/common/app-bar-back-button";
import { useSelector } from "react-redux";
import AddCompanySaleDialog from "./add-company-sale-dialog";

export default function () {
  const company = useSelector((state: RootState) => state.user.company);
  if (!company) return;
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 flex-wrap items-center gap-2 sm:gap-4">
        <AppBarBackButton destination="Sales Menu" />
        <span className="truncate text-lg font-bold sm:text-2xl">
          {company.company_name} &gt; Sales &gt; Algiers
        </span>
      </div>
      <AddCompanySaleDialog />
    </div>
  );
}
