import { RootState } from "@/app/store";
import AppBarBackButton from "@/components/common/app-bar-back-button";
import { useSelector } from "react-redux";

export default function () {
  const franchise = useSelector(
    (state: RootState) => state.franchise.franchise
  );

  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2">
        <AppBarBackButton destination="Menu" />
        <span className="text-2xl">{franchise?.name} &gt; Products</span>
      </div>
      <div className="flex items-center gap-2"></div>
    </div>
  );
}
