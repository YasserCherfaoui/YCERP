import { RootState } from "@/app/store";
import AppBarBackButton from "@/components/common/app-bar-back-button";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import AddSupplierDialog from "./add-supplier-dialog";

export default function () {
  const companyFromStore = useSelector((state: RootState) => state.company.company);
  const userCompany = useSelector((state: RootState) => state.user.company);
  const { pathname } = useLocation();
  const company = pathname.includes("moderator") ? userCompany : companyFromStore;
  if (!company) return;
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <AppBarBackButton destination="Menu" />
        <span className="truncate">{company.company_name} &gt; Suppliers</span>
      </div>
      <AddSupplierDialog />
    </div>
  );
}
