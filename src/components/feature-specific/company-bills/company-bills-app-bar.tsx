import { RootState } from "@/app/store";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";

export default function () {
  const company = useSelector((state: RootState) => state.company.company);
  if (!company) return;
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const lastLocation = pathname.substring(0, pathname.lastIndexOf("/"));
  return (
    <div className="flex justify-between">
      <div className="flex gap-2 items-center text-xl">
        <Button onClick={()=> navigate(lastLocation)}>
          <ArrowLeft />
          Back to Menu
        </Button>
        {company.company_name} &gt; Bills
      </div>

    </div>
  );
}
