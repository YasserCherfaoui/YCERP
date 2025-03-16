import { RootState } from "@/app/store";
import AppBarBackButton from "@/components/common/app-bar-back-button";
import { useSelector } from "react-redux";

export default function () {
  const franchise = useSelector(
    (state: RootState) => state.franchise.franchise
  );
  if (!franchise) return;
  return (
    <div className="flex items-center gap-2 justify-between">
      <div className="flex items-center gap-2">
        <AppBarBackButton destination="Menu" />
        <h1>{franchise.name}</h1>
        &gt;
        <h2>Bills</h2>
      </div>
      <div></div>
    </div>
  );
}
