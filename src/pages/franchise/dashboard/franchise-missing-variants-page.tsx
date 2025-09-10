import BulkCreateMissingVariantDialog from "@/components/feature-specific/franchise-missing-variants/bulk-create-missing-variant-dialog";
import CreateMissingVariantDialog from "@/components/feature-specific/franchise-missing-variants/create-missing-variant-dialog";
import FranchiseMissingVariantsAppBar from "@/components/feature-specific/franchise-missing-variants/franchise-missing-variants-app-bar";
import FranchiseMissingVariantsBody from "@/components/feature-specific/franchise-missing-variants/franchise-missing-variants-body";
import { useState } from "react";

export default function FranchiseMissingVariantsPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [bulkCreateDialogOpen, setBulkCreateDialogOpen] = useState(false);

  return (
    <div className="p-4 space-y-4">
      <FranchiseMissingVariantsAppBar 
        onCreateRequest={() => setCreateDialogOpen(true)}
        onBulkCreateRequest={() => setBulkCreateDialogOpen(true)}
      />
      <FranchiseMissingVariantsBody />
      <CreateMissingVariantDialog 
        open={createDialogOpen} 
        onOpenChange={setCreateDialogOpen} 
      />
      <BulkCreateMissingVariantDialog 
        open={bulkCreateDialogOpen} 
        onOpenChange={setBulkCreateDialogOpen} 
      />
    </div>
  );
}
