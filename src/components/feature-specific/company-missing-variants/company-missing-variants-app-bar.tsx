import { RootState } from "@/app/store";
import AppBarBackButton from "@/components/common/app-bar-back-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

interface CompanyMissingVariantsAppBarProps {
  onCreateExitBill: () => void;
  selectedCount: number;
  selectedFranchiseId?: number;
}

export default function CompanyMissingVariantsAppBar({ 
  onCreateExitBill, 
  selectedCount, 
  selectedFranchiseId 
}: CompanyMissingVariantsAppBarProps) {
  let company = useSelector((state: RootState) => state.company.company);
  const { pathname } = useLocation();
  if (pathname.includes("moderator")) {
    company = useSelector((state: RootState) => state.user.company);
  }
  
  if (!company) return null;

  const canCreateExitBill = selectedCount > 0 && selectedFranchiseId;

  return (
    <div className="flex justify-between items-center">
      <div className="flex gap-2 items-center text-xl">
        <AppBarBackButton destination="Menu" />
        {company.company_name} &gt; Missing Variants
      </div>
      
      <div className="flex items-center gap-4">
        {selectedCount > 0 && (
          <Badge variant="secondary" className="text-sm">
            {selectedCount} selected
          </Badge>
        )}
        
        <Button 
          onClick={onCreateExitBill}
          disabled={!canCreateExitBill}
          className="flex items-center gap-2"
        >
          <Package className="h-4 w-4" />
          Create Exit Bill
        </Button>
      </div>
    </div>
  );
}
