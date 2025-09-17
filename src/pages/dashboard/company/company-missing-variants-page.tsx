import { RootState } from "@/app/store";
import CompanyMissingVariantsAppBar from "@/components/feature-specific/company-missing-variants/company-missing-variants-app-bar";
import CompanyMissingVariantsBody from "@/components/feature-specific/company-missing-variants/company-missing-variants-body";
import CreateExitBillDialog from "@/components/feature-specific/company-missing-variants/create-exit-bill-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MissingVariantRequestResponse } from "@/models/data/missing-variant.model";
import { getMyCompanyFranchises } from "@/services/franchise-service";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

export default function CompanyMissingVariantsPage() {
  const [createExitBillOpen, setCreateExitBillOpen] = useState(false);
  const [selectedRequests, setSelectedRequests] = useState<MissingVariantRequestResponse[]>([]);
  const [selectedFranchiseId, setSelectedFranchiseId] = useState<number | undefined>();
  const [isAdditionalItemsOnly, setIsAdditionalItemsOnly] = useState(false);
  const [franchiseSelectorOpen, setFranchiseSelectorOpen] = useState(false);
  const [tempFranchiseId, setTempFranchiseId] = useState<number | undefined>();

  let company = useSelector((state: RootState) => state.company.company);
  const { pathname } = useLocation();
  if (pathname.includes("moderator")) {
    company = useSelector((state: RootState) => state.user.company);
  }

  // Get company franchises
  const { data: franchisesData } = useQuery({
    queryKey: ["company-franchises", company?.ID],
    queryFn: () => getMyCompanyFranchises(company?.ID ?? 0),
    enabled: !!company,
  });

  const handleCreateExitBill = () => {
    if (selectedRequests.length > 0 && selectedFranchiseId && company) {
      setIsAdditionalItemsOnly(false);
      setCreateExitBillOpen(true);
    }
  };

  const handleCreateAdditionalItemsExitBill = () => {
    if (company) {
      setIsAdditionalItemsOnly(true);
      setFranchiseSelectorOpen(true);
    }
  };

  const handleFranchiseSelected = () => {
    if (tempFranchiseId) {
      setSelectedFranchiseId(tempFranchiseId);
      setFranchiseSelectorOpen(false);
      setCreateExitBillOpen(true);
    }
  };

  const handleSelectionChange = (requests: MissingVariantRequestResponse[]) => {
    setSelectedRequests(requests);
    
    // Determine which franchise is selected (should be only one)
    const franchiseIds = [...new Set(requests.map(row => row.franchise_id))];
    if (franchiseIds.length === 1) {
      setSelectedFranchiseId(franchiseIds[0]);
    } else {
      setSelectedFranchiseId(undefined);
    }
  };

  if (!company) {
    return <div>Company not found</div>;
  }

  return (
    <div className="p-4 space-y-4">
      <CompanyMissingVariantsAppBar 
        onCreateExitBill={handleCreateExitBill}
        onCreateAdditionalItemsExitBill={handleCreateAdditionalItemsExitBill}
        selectedCount={selectedRequests.length}
        selectedFranchiseId={selectedFranchiseId}
      />
      <CompanyMissingVariantsBody 
        onSelectionChange={handleSelectionChange}
      />
      <CreateExitBillDialog 
        open={createExitBillOpen} 
        onOpenChange={setCreateExitBillOpen}
        selectedRequests={isAdditionalItemsOnly ? [] : selectedRequests}
        franchiseId={selectedFranchiseId || 0}
        companyId={company.ID}
      />

      {/* Franchise Selector Dialog */}
      <Dialog open={franchiseSelectorOpen} onOpenChange={setFranchiseSelectorOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Franchise</DialogTitle>
            <DialogDescription>
              Choose a franchise to create an exit bill with additional items.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Select 
              value={tempFranchiseId?.toString()} 
              onValueChange={(value) => setTempFranchiseId(parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a franchise..." />
              </SelectTrigger>
              <SelectContent>
                {franchisesData?.data?.map((franchise) => (
                  <SelectItem key={franchise.ID} value={franchise.ID.toString()}>
                    {franchise.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setFranchiseSelectorOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleFranchiseSelected}
              disabled={!tempFranchiseId}
            >
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
