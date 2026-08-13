import { RootState } from "@/app/store";
import AppBarBackButton from "@/components/common/app-bar-back-button";
import ClearBrokenCountDialog from "@/components/feature-specific/company-franchise/franchise-inventory/clear-broken-count-dialog";
import InventoryDiscrepanciesDialog from "@/components/feature-specific/inventory-discrepancies-dialog";
import { Button } from "@/components/ui/button";
import { getCompanyFranchiseInventory } from "@/services/franchise-service";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, PackageX } from "lucide-react";
import { useMemo, useState } from "react";
import { useSelector } from "react-redux";

export default function () {
    const franchise = useSelector((state: RootState) => state.franchise.franchise);
    const [discrepanciesOpen, setDiscrepanciesOpen] = useState(false);
    const [clearBrokenOpen, setClearBrokenOpen] = useState(false);

    const { data: inventoryData } = useQuery({
        queryKey: ["franchise-inventory", franchise?.ID],
        queryFn: () => getCompanyFranchiseInventory(franchise!.ID),
        enabled: !!franchise,
    });
    const inventoryId = inventoryData?.data?.ID ?? null;
    const inventoryItems = useMemo(
        () =>
            inventoryData?.data?.items_with_cost?.filter(
                (item) => item.product?.is_active !== false
            ) ?? [],
        [inventoryData?.data?.items_with_cost]
    );
    const brokenItemCount = useMemo(
        () => inventoryItems.filter((item) => (item.broken_count ?? 0) > 0).length,
        [inventoryItems]
    );

    if (!franchise) return null;
    return (
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
                <AppBarBackButton destination="Menu" />
                <span className="truncate text-sm sm:text-base">{franchise.name} &gt; Inventory</span>
            </div>
            <div className="flex flex-wrap gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    disabled={brokenItemCount === 0}
                    onClick={() => setClearBrokenOpen(true)}
                >
                    <PackageX className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Clear broken count</span>
                    <span className="sm:hidden">Clear broken</span>
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    disabled={inventoryId == null}
                    onClick={() => setDiscrepanciesOpen(true)}
                >
                    <AlertCircle className="h-4 w-4 sm:mr-2" />
                    Discrepancies
                </Button>
            </div>
            <InventoryDiscrepanciesDialog
                open={discrepanciesOpen}
                onOpenChange={setDiscrepanciesOpen}
                inventoryId={inventoryId}
            />
            <ClearBrokenCountDialog
                open={clearBrokenOpen}
                onOpenChange={setClearBrokenOpen}
                items={inventoryItems}
            />
        </div>
    );
}
