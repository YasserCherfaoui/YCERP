import { RootState } from "@/app/store";
import AppBarBackButton from "@/components/common/app-bar-back-button";
import { Button } from "@/components/ui/button";
import { Layers, Plus } from "lucide-react";
import { useSelector } from "react-redux";

interface FranchiseMissingVariantsAppBarProps {
  onCreateRequest: () => void;
  onBulkCreateRequest: () => void;
}

export default function FranchiseMissingVariantsAppBar({ onCreateRequest, onBulkCreateRequest }: FranchiseMissingVariantsAppBarProps) {
  const franchise = useSelector((state: RootState) => state.franchise.franchise);
  
  if (!franchise) return null;
  
  return (
    <div className="flex gap-2 items-center justify-between">
      <div className="flex gap-2 items-center">
        <AppBarBackButton destination="Menu" />
        <span>{franchise.name} &gt; Missing Variants</span>
      </div>
      <div className="flex gap-2">
        <Button onClick={onCreateRequest} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Report Missing Variant
        </Button>
        <Button onClick={onBulkCreateRequest} variant="outline" className="flex items-center gap-2">
          <Layers className="h-4 w-4" />
          Bulk Report
        </Button>
      </div>
    </div>
  );
}
