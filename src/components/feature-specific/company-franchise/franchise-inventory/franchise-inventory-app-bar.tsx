import { RootState } from "@/app/store";
import AppBarBackButton from "@/components/common/app-bar-back-button";
import InventoryDiscrepanciesDialog from "@/components/feature-specific/inventory-discrepancies-dialog";
import { getCompanyFranchiseInventory } from "@/services/franchise-service";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle } from "lucide-react";
import { useState } from "react";
import { useSelector } from "react-redux";
import { Button } from "@/components/ui/button";

export default function () {
    const franchise = useSelector((state: RootState) => state.franchise.franchise);
    const [discrepanciesOpen, setDiscrepanciesOpen] = useState(false);

    const { data: inventoryData } = useQuery({
        queryKey: ["franchise-inventory", franchise?.ID],
        queryFn: () => getCompanyFranchiseInventory(franchise!.ID),
        enabled: !!franchise,
    });
    const inventoryId = inventoryData?.data?.ID ?? null;

    if (!franchise) return null;
    return (
        <div className="flex gap-2 items-center justify-between w-full">
            <div className="flex gap-2 items-center">
                <AppBarBackButton destination="Menu" />
                <span>{franchise.name} &gt; Inventory</span>
            </div>
            <div className="flex gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    disabled={inventoryId == null}
                    onClick={() => setDiscrepanciesOpen(true)}
                >
                    <AlertCircle className="mr-2 h-4 w-4" />
                    Discrepancies
                </Button>
            </div>
            <InventoryDiscrepanciesDialog
                open={discrepanciesOpen}
                onOpenChange={setDiscrepanciesOpen}
                inventoryId={inventoryId}
            />
        </div>
    );
}