import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface FranchiseVariantDepositsAppBarProps {
  onRecordDeposit: () => void;
}

export default function FranchiseVariantDepositsAppBar({
  onRecordDeposit,
}: FranchiseVariantDepositsAppBarProps) {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-2 min-w-0">
        <Button variant="outline" onClick={() => navigate("/myFranchise")}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to menu
        </Button>
        <h2 className="text-lg font-semibold truncate">
          Variant deposits (advance orders)
        </h2>
      </div>
      <Button onClick={onRecordDeposit}>
        <Plus className="h-4 w-4 mr-2" />
        Record deposit
      </Button>
    </div>
  );
}
