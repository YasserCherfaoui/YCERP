import { RootState } from "@/app/store";
import CompanyMissingVariantsAppBar from "@/components/feature-specific/company-missing-variants/company-missing-variants-app-bar";
import CompanyMissingVariantsBody from "@/components/feature-specific/company-missing-variants/company-missing-variants-body";
import CreateExitBillDialog from "@/components/feature-specific/company-missing-variants/create-exit-bill-dialog";
import { MissingVariantRequestResponse } from "@/models/data/missing-variant.model";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

export default function CompanyMissingVariantsPage() {
  const [createExitBillOpen, setCreateExitBillOpen] = useState(false);
  const [selectedRequests, setSelectedRequests] = useState<MissingVariantRequestResponse[]>([]);
  const [selectedFranchiseId, setSelectedFranchiseId] = useState<number | undefined>();

  let company = useSelector((state: RootState) => state.company.company);
  const { pathname } = useLocation();
  if (pathname.includes("moderator")) {
    company = useSelector((state: RootState) => state.user.company);
  }

  const handleCreateExitBill = () => {
    if (selectedRequests.length > 0 && selectedFranchiseId && company) {
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
        selectedCount={selectedRequests.length}
        selectedFranchiseId={selectedFranchiseId}
      />
      <CompanyMissingVariantsBody 
        onSelectionChange={handleSelectionChange}
      />
      <CreateExitBillDialog 
        open={createExitBillOpen} 
        onOpenChange={setCreateExitBillOpen}
        selectedRequests={selectedRequests}
        franchiseId={selectedFranchiseId || 0}
        companyId={company.ID}
      />
    </div>
  );
}
