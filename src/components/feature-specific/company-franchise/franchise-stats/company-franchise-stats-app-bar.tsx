import { RootState } from "@/app/store";
import AppBarBackButton from "@/components/common/app-bar-back-button";
import { useSelector } from "react-redux";

export default function () {
  const franchise = useSelector((state: RootState) => state.franchise.franchise);
  if (!franchise) return;  
  return (
    <div className="flex gap-4">
      <AppBarBackButton destination="Menu" />
      <h1 className="text-2xl font-bold">{franchise.name} &gt; Statistics</h1>
    </div>
  );
}
