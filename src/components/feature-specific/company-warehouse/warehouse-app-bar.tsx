import { RootState } from "@/app/store";
import RecordBrokenItemsDialog from "@/components/feature-specific/broken-items/record-broken-items-dialog";
import InventoryDiscrepanciesDialog from "@/components/feature-specific/inventory-discrepancies-dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft, Warehouse } from "lucide-react";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import AddInventoryItemForm from "./add-inventory-item-form";

interface Props {
  inventoryId: number | null;
  selectedRow: number | null;
}

export default function WarehouseAppBar({ inventoryId, selectedRow }: Props) {
  const companyFromStore = useSelector((state: RootState) => state.company.company);
  const userCompany = useSelector((state: RootState) => state.user.company);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [discrepanciesOpen, setDiscrepanciesOpen] = useState(false);
  const isModerator = pathname.includes("moderator");
  const company = isModerator ? userCompany : companyFromStore;
  const lastLocation = pathname.substring(0, pathname.lastIndexOf("/"));

  if (!company) return null;

  return (
    <>
    <header className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
          <Warehouse className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="-ml-2 h-7 px-2 text-muted-foreground"
            onClick={() => navigate(lastLocation)}
          >
            <ArrowLeft />
            Back
          </Button>
          <h1 className="text-2xl font-semibold tracking-tight">Warehouse</h1>
          <p className="truncate text-sm text-muted-foreground">{company.company_name}</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={inventoryId == null}
            onClick={() => setDiscrepanciesOpen(true)}
          >
            <AlertCircle />
            Discrepancies
          </Button>
          <RecordBrokenItemsDialog
            inventoryId={inventoryId ?? 0}
            isFranchise={false}
            disabled={inventoryId == null}
            compact
          />
          <AddInventoryItemForm disabled={selectedRow == null} />
      </div>
    </header>
      <InventoryDiscrepanciesDialog
        open={discrepanciesOpen}
        onOpenChange={setDiscrepanciesOpen}
        inventoryId={inventoryId}
      />
    </>
  );
}
