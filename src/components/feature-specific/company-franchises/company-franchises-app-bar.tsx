import { RootState } from "@/app/store";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import AddFranchiseAdminForm from "./add-franchise-admin-form";
import AddFranchiseForm from "./add-franchise-form";

export default function () {
  const companyFromStore = useSelector((state: RootState) => state.company.company);
  const userCompany = useSelector((state: RootState) => state.user.company);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isModerator = pathname.includes("moderator");
  const lastLocation = pathname.substring(0, pathname.lastIndexOf("/"));
  const company = isModerator ? userCompany : companyFromStore;
  if (!company) return;
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
        <Button className="w-fit shrink-0" onClick={() => navigate(lastLocation)}>
          <ArrowLeft />
          <span className="sm:hidden">Back</span>
          <span className="hidden sm:inline">Back to Menu</span>
        </Button>
        <div className="truncate text-lg sm:text-2xl">
          {company.company_name} &gt; Franchises
        </div>
      </div>
      <div className={`flex flex-wrap gap-2 ${isModerator ? "hidden" : ""}`}>
        <AddFranchiseAdminForm />
        <AddFranchiseForm />
      </div>
    </div>
  );
}
