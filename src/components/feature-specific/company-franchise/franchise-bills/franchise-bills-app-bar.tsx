import { RootState } from "@/app/store";
import AppBarBackButton from "@/components/common/app-bar-back-button";
import AddFranchisePayment from "@/components/feature-specific/company-franchise/franchise-bills/add-franchise-payment";
import { useSelector } from "react-redux";

export default function () {
  const franchise = useSelector(
    (state: RootState) => state.franchise.franchise
  );
  if (!franchise) return;
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <AppBarBackButton destination="Menu" />
        <span className="truncate text-sm sm:text-base">
          {franchise.name} &gt; Bills
        </span>
      </div>
      <div>
        <AddFranchisePayment />
      </div>
    </div>
  );
}
