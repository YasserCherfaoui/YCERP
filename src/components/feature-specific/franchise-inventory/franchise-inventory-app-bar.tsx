import { RootState } from "@/app/store";
import BrokenItemsTransferDialog from "@/components/feature-specific/broken-items/broken-items-transfer-dialog";
import RecordBrokenItemsDialog from "@/components/feature-specific/broken-items/record-broken-items-dialog";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Store } from "lucide-react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";

interface Props {
  inventoryId: number | null;
}

export default function FranchiseInventoryAppBar({ inventoryId }: Props) {
  const franchise = useSelector((state: RootState) => state.franchise.franchise);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const lastLocation = pathname.substring(0, pathname.lastIndexOf("/"));

  if (!franchise) return null;

  return (
    <header className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
          <Store className="h-5 w-5" aria-hidden="true" />
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
          <h1 className="text-2xl font-semibold tracking-tight">Inventory</h1>
          <p className="truncate text-sm text-muted-foreground">{franchise.name}</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <RecordBrokenItemsDialog
          inventoryId={inventoryId ?? 0}
          isFranchise
          disabled={inventoryId == null}
          compact
        />
        <BrokenItemsTransferDialog />
      </div>
    </header>
  );
}
