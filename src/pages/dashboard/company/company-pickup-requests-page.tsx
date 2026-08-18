import CreatePickupRequestDialog from "@/components/feature-specific/franchise-pickup/create-pickup-request-dialog";
import CompanyPickupRequestsAppBar from "@/components/feature-specific/franchise-pickup/company-pickup-requests-app-bar";
import CompanyPickupRequestsBody from "@/components/feature-specific/franchise-pickup/company-pickup-requests-body";
import { RootState } from "@/app/store";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

export default function CompanyPickupRequestsPage() {
  const [createOpen, setCreateOpen] = useState(false);
  let company = useSelector((state: RootState) => state.company.company);
  const { pathname } = useLocation();
  if (pathname.includes("moderator")) {
    company = useSelector((state: RootState) => state.user.company);
  }

  if (!company) {
    return (
      <div className="p-4 text-sm text-muted-foreground">Company not found</div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-4 p-3 pb-[max(2rem,env(safe-area-inset-bottom))] sm:space-y-6 sm:p-6">
      <CompanyPickupRequestsAppBar onCreate={() => setCreateOpen(true)} />
      <CompanyPickupRequestsBody onCreate={() => setCreateOpen(true)} />
      <CreatePickupRequestDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        companyId={company.ID}
      />
    </div>
  );
}
