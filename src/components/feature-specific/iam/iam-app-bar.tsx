import { RootState } from "@/app/store";
import AppBarBackButton from "@/components/common/app-bar-back-button";
import AddUserDialog from "@/components/feature-specific/iam/add-user-dialog";
import { useSelector } from "react-redux";



export default function() {
    const company = useSelector((state: RootState) => state.company.company);
    return  <div className="flex justify-between">
    {/* ANCHOR: Leading + Title */}
    <div className="flex gap-4">
      <AppBarBackButton destination="Menu" />
      <span className="text-2xl">
        {company?.company_name} &gt; Identity & Access Management
      </span>
    </div>
    {/* ANCHOR: ACTION BUTTONS */}
    <div className="flex gap-4">
        <AddUserDialog />
    </div>
  </div>
}