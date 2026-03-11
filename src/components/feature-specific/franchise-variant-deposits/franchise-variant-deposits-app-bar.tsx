import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface FranchiseVariantDepositsAppBarProps {
  onRecordDeposit: () => void;
}

export default function FranchiseVariantDepositsAppBar({
  onRecordDeposit,
}: FranchiseVariantDepositsAppBarProps) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-lg font-semibold">Variant deposits (advance orders)</h2>
      <Button onClick={onRecordDeposit}>
        <Plus className="h-4 w-4 mr-2" />
        Record deposit
      </Button>
    </div>
  );
}
