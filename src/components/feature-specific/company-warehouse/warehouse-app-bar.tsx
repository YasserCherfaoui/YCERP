import { RootState } from "@/app/store";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Dispatch, SetStateAction } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import AddInventoryItemForm from "./add-inventory-item-form";
interface Props {
    setSelectedRow: Dispatch<SetStateAction<number | null>>;
    selectedRow: number | null;
  }
export default function ({setSelectedRow, selectedRow}:Props) {
  const company = useSelector((state: RootState) => state.company.company);
  const navigate = useNavigate();
  if (!company) return;
  return (
    <div className="flex justify-between">
        {/* ANCHOR: Leading + Title */}
      <div className="flex gap-4">
        <Button onClick={() => navigate(-1)}>
          <ArrowLeft />
          Back to Menu
        </Button>
        <span className="text-2xl">{company.company_name} &gt; Warehouse</span>
      </div>
      {/* ANCHOR: ACTION BUTTONS */}
      <div className="flex gap-4">
        <AddInventoryItemForm disabled={selectedRow == null}/>
      </div>
    </div>
  );
}
