import { RootState } from "@/app/store";
import AppBarBackButton from "@/components/common/app-bar-back-button";
import { useSelector } from "react-redux";

export default function () {
  const company = useSelector((state: RootState) => state.company.company);
  const franchise = useSelector(
    (state: RootState) => state.franchise.franchise
  );
  return (
    <div className="flex justify-between">
      {/* ANCHOR: Leading + Title */}
      <div className="flex gap-4">
        <AppBarBackButton destination="Franchises" />
        <span className="text-2xl">
          {company?.company_name} &gt; Franchises &gt; {franchise?.name}
        </span>
      </div>
      {/* ANCHOR: ACTION BUTTONS */}
      <div className="flex gap-4"></div>
    </div>
  );
}
