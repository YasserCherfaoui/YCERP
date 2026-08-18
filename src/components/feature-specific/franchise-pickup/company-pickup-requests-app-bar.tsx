import { RootState } from "@/app/store";
import AppBarBackButton from "@/components/common/app-bar-back-button";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

interface CompanyPickupRequestsAppBarProps {
  onCreate: () => void;
}

export default function CompanyPickupRequestsAppBar({
  onCreate,
}: CompanyPickupRequestsAppBarProps) {
  let company = useSelector((state: RootState) => state.company.company);
  const { pathname } = useLocation();
  if (pathname.includes("moderator")) {
    company = useSelector((state: RootState) => state.user.company);
  }
  if (!company) return null;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-2 sm:items-center">
        <AppBarBackButton destination="Menu" />
        <div className="min-w-0">
          <h1 className="text-lg font-semibold tracking-tight sm:text-xl">
            Pickup requests
          </h1>
          <p className="truncate text-sm text-muted-foreground">
            {company.company_name}
          </p>
        </div>
      </div>
      <Button onClick={onCreate} className="w-full sm:w-auto">
        <Plus className="h-4 w-4" />
        New request
      </Button>
    </div>
  );
}
