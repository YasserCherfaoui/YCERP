import { RootState } from "@/app/store";
import AppBarBackButton from "@/components/common/app-bar-back-button";
import AddCompanyUnknownReturnDialog from "@/components/feature-specific/company-unknown-returns/add-company-unknown-return-dialog";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

export default function () {
  let company = useSelector((state: RootState) => state.company.company);
  const { pathname } = useLocation();
  const isModerator = pathname.includes("moderator");
  if (isModerator) {
    company = useSelector((state: RootState) => state.user.company);
  }
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
