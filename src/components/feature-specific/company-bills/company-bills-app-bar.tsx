import { RootState } from "@/app/store";
import AppBarBackButton from "@/components/common/app-bar-back-button";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

export default function () {
  let company = useSelector((state: RootState) => state.company.company);
  const { pathname } = useLocation();
  if (pathname.includes("moderator")) {
    company = useSelector((state: RootState) => state.user.company);
  }
  if (!company) return;

  return (
    <div className="flex justify-between">
      <div className="flex gap-2 items-center text-xl">
        <AppBarBackButton destination="Menu" />
        {company.company_name} &gt; Bills
      </div>
    </div>
  );
}
