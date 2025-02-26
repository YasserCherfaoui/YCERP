import { RootState } from "@/app/store";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import AddFranchiseAdminForm from "./add-franchise-admin-form";
import AddFranchiseForm from "./add-franchise-form";

export default function () {
  const company = useSelector((state: RootState) => state.company.company);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const lastLocation = pathname.substring(0, pathname.lastIndexOf("/"));

  if (!company) return;
  return (
    <div className="flex justify-between items-center">
      <div className="text-2xl flex gap-2 items-center">
        <Button onClick={() => navigate(lastLocation)}>
          <ArrowLeft />
          Back to Menu
        </Button>
        {company.company_name} &gt; Franchises
      </div>
      <div className="flex gap-2">
        <AddFranchiseAdminForm />
        <AddFranchiseForm />
      </div>
    </div>
  );
}
