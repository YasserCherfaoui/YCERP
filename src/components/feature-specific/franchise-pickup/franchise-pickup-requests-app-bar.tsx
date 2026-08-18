import { RootState } from "@/app/store";
import AppBarBackButton from "@/components/common/app-bar-back-button";
import { useSelector } from "react-redux";

export default function FranchisePickupRequestsAppBar() {
  const franchise = useSelector((state: RootState) => state.franchise.franchise);
  if (!franchise) return null;
  return (
    <div className="flex min-w-0 items-start gap-2 sm:items-center">
      <AppBarBackButton destination="Menu" />
      <div className="min-w-0">
        <h1 className="text-lg font-semibold tracking-tight sm:text-xl">
          Pickup requests
        </h1>
        <p className="truncate text-sm text-muted-foreground">{franchise.name}</p>
      </div>
    </div>
  );
}
