import { RootState } from "@/app/store";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Dispatch, SetStateAction } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import AddInventoryItemForm from "./add-inventory-item-form";

interface Props {
  setSelectedRow: Dispatch<SetStateAction<number | null>>;
  selectedRow: number | null;
}
export default function ({ selectedRow }: Props) {
  let company = useSelector((state: RootState) => state.company.company);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  if(pathname.includes("moderator")){
    company = useSelector((state: RootState) => state.user.company);
  }
  
  const lastLocation = pathname.substring(0, pathname.lastIndexOf("/"));

  if (!company) return;
  return (
    <div className="flex justify-between">
      {/* ANCHOR: Leading + Title */}
      <div className="flex gap-4">
        <Button onClick={() => navigate(lastLocation)}>
          <ArrowLeft />
          Back to Menu
        </Button>
        <span className="text-2xl">{company.company_name} &gt; Warehouse</span>
      </div>
      {/* ANCHOR: ACTION BUTTONS */}
      <div className="flex gap-4">
        <AddInventoryItemForm disabled={selectedRow == null} />
      </div>
    </div>
  );
}
