import { RootState } from "@/app/store";
import AppBarBackButton from "@/components/common/app-bar-back-button";
import AddFranchiseSaleDialog from "@/components/feature-specific/franchise-sales/add-franchise-sale-dialog";
import { useSelector } from "react-redux";

export default function () {
  const franchise = useSelector(
    (state: RootState) => state.franchise.franchise
  );
  if (!franchise) return;
  return (
    <div className="flex gap-2 justify-between">
      <div className="flex gap-2 items-center">
        <AppBarBackButton destination="Dashboard" />
        {franchise.name} &gt; Sales
      </div>
      <div>
        <AddFranchiseSaleDialog />
      </div>
    </div>
  );
}
