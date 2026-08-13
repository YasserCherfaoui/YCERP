import { RootState } from "@/app/store";
import AppBarBackButton from "@/components/common/app-bar-back-button";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

export default function () {
  const companyFromStore = useSelector((state: RootState) => state.company.company);
  const userCompany = useSelector((state: RootState) => state.user.company);
  const { pathname } = useLocation();
  const company = pathname.includes("moderator") ? userCompany : companyFromStore;
  if (!company) return;

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-2 text-lg sm:text-xl">
      <AppBarBackButton destination="Menu" />
      <span className="truncate">{company.company_name} &gt; Bills</span>
    </div>
  );
}
