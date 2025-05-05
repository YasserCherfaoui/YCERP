import { RootState } from "@/app/store";
import AppBarBackButton from "@/components/common/app-bar-back-button";
import { useSelector } from "react-redux";
import AddCompanySaleDialog from "./add-user-sale-dialog";

export default function () {
  const company = useSelector((state: RootState) => state.user.company);
  if (!company) return;
  return (
    <div className="flex justify-between">
      <div className="flex gap-4 items-center">
        <AppBarBackButton destination="Sales Menu" />
        <span className="text-2xl font-bold">
          {company.company_name} &gt; Sales &gt; Warehouse
        </span>
      </div>
      <AddCompanySaleDialog />
    </div>
  );
}
