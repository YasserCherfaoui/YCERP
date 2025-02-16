import { RootState } from "@/app/store";
import { useSelector } from "react-redux";
import AddFranchiseAdminForm from "./add-franchise-admin-form";
import AddFranchiseForm from "./add-franchise-form";

export default function () {
  const company = useSelector((state: RootState) => state.company.company);
  if (!company) return;
  return (
    <div className="flex justify-between items-center">
      <div className="text-2xl">{company.company_name} &gt; Franchises</div>
      <div className="flex gap-2">
        <AddFranchiseAdminForm />
        <AddFranchiseForm />
      </div>
    </div>
  );
}
