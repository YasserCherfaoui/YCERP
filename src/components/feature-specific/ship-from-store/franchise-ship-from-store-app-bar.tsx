import { RootState } from "@/app/store";
import AppBarBackButton from "@/components/common/app-bar-back-button";
import { Button } from "@/components/ui/button";
import { useSelector } from "react-redux";
import { ShipFromStoreDialog } from "./ship-from-store-dialog";
import { useState } from "react";
import { Package } from "lucide-react";

export default function FranchiseShipFromStoreAppBar() {
  const franchise = useSelector((state: RootState) => state.franchise.franchise);
  const [dialogOpen, setDialogOpen] = useState(false);
  if (!franchise) return null;
  return (
    <div className="flex gap-2 items-center justify-between mb-4">
      <div className="flex gap-2 items-center">
        <AppBarBackButton destination="Menu" />
        <span>{franchise.name} &gt; Ship from store</span>
      </div>
      <Button onClick={() => setDialogOpen(true)}>
        <Package className="mr-2 h-4 w-4" />
        Create
      </Button>
      <ShipFromStoreDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
