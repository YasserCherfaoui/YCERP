import { RootState } from "@/app/store";
import AppBarBackButton from "@/components/common/app-bar-back-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { processAllVariantNeedsAutomation } from "@/services/missing-variants-service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Package, Plus, RefreshCw } from "lucide-react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

interface CompanyMissingVariantsAppBarProps {
  onCreateExitBill: () => void;
  onCreateAdditionalItemsExitBill: () => void;
  selectedCount: number;
  selectedFranchiseId?: number;
  isMutationPending?: boolean;
}

export default function CompanyMissingVariantsAppBar({ 
  onCreateExitBill, 
  onCreateAdditionalItemsExitBill,
  selectedCount, 
  selectedFranchiseId,
  isMutationPending = false
}: CompanyMissingVariantsAppBarProps) {
  let company = useSelector((state: RootState) => state.company.company);
  const { pathname } = useLocation();
  const isModerator = pathname.includes("moderator");
  if (isModerator) {
    company = useSelector((state: RootState) => state.user.company);
  }

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { mutate: runAutomation, isPending: isAutomationPending } = useMutation({
    mutationFn: processAllVariantNeedsAutomation,
    onSuccess: (res) => {
      const summary = res.data?.summary;
      const results = res.data?.results ?? [];
      const skippedCount = results.filter((r) => r.AlreadyProcessed).length;
      const description = summary
        ? `Franchises: ${summary.total_franchises_processed} (Skipped: ${skippedCount}), Created: ${summary.total_requests_created}, Updated: ${summary.total_requests_updated}`
        : "Daily variant needs automation completed.";
      toast({
        title: "Automation Completed",
        description,
      });
      queryClient.invalidateQueries({ queryKey: ["company-missing-variants"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Automation Failed",
        description: error.message || "Failed to run variant needs automation",
        variant: "destructive",
      });
    },
  });
  
  if (!company) return null;

  const canCreateExitBill = selectedCount > 0 && selectedFranchiseId;
  const anyPending = isMutationPending || isAutomationPending;

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

        {!isModerator && (
          <Button
            onClick={() => runAutomation()}
            variant="outline"
            className="flex items-center gap-2"
            disabled={anyPending}
          >
            <RefreshCw className={`h-4 w-4 ${isAutomationPending ? "animate-spin" : ""}`} />
            {isAutomationPending ? "Running..." : "Run Automation"}
          </Button>
        )}
        
        <Button 
          onClick={onCreateAdditionalItemsExitBill}
          variant="outline"
          className="flex items-center gap-2"
          disabled={anyPending}
        >
          <Plus className="h-4 w-4" />
          Add Items Only
        </Button>
        
        <Button 
          onClick={onCreateExitBill}
          disabled={!canCreateExitBill || anyPending}
          className="flex items-center gap-2"
        >
          <Package className="h-4 w-4" />
          Create Exit Bill
        </Button>
      </div>
    </div>
  );
}
