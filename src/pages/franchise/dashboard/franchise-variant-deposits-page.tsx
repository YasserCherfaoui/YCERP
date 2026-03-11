import CreateVariantDepositDialog from "@/components/feature-specific/franchise-variant-deposits/create-variant-deposit-dialog";
import FranchiseVariantDepositsAppBar from "@/components/feature-specific/franchise-variant-deposits/franchise-variant-deposits-app-bar";
import FranchiseVariantDepositsBody from "@/components/feature-specific/franchise-variant-deposits/franchise-variant-deposits-body";
import { useState } from "react";

export default function FranchiseVariantDepositsPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  return (
    <div className="p-4 space-y-4">
      <FranchiseVariantDepositsAppBar onRecordDeposit={() => setCreateDialogOpen(true)} />
      <FranchiseVariantDepositsBody />
      <CreateVariantDepositDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
    </div>
  );
}
