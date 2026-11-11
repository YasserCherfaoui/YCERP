import { RootState } from "@/app/store";
import AppBarBackButton from "@/components/common/app-bar-back-button";
import { Badge } from "@/components/ui/badge";
import { FRANCHISE_TYPES } from "@/models/data/franchise.model";
import { useSelector } from "react-redux";

interface FranchiseProductsAppBarProps {
  totalCount?: number;
  filteredCount?: number;
  withPhotosCount?: number;
}

export default function FranchiseProductsAppBar({
  totalCount,
  filteredCount,
  withPhotosCount,
}: FranchiseProductsAppBarProps) {
  const franchise = useSelector(
    (state: RootState) => state.franchise.franchise
  );

  const isVip = franchise?.franchise_type === FRANCHISE_TYPES.VIP;

  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <AppBarBackButton destination="Menu" />
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-xs font-medium text-muted-foreground">
              {franchise?.name ?? "Franchise"}
            </p>
            {franchise && (
              <Badge
                variant={isVip ? "default" : "outline"}
                className="px-1.5 py-0 text-[10px] uppercase"
              >
                {isVip ? "VIP Franchise" : "Normal Franchise"}
              </Badge>
            )}
          </div>
          <h1 className="truncate text-2xl font-semibold tracking-tight sm:text-3xl">
            Products
          </h1>
          <p className="text-sm text-muted-foreground">
            {totalCount !== undefined ? (
              <>
                Showing{" "}
                <span className="font-medium text-foreground tabular-nums">
                  {(filteredCount ?? totalCount).toLocaleString()}
                </span>{" "}
                of{" "}
                <span className="tabular-nums">{totalCount.toLocaleString()}</span>{" "}
                products
                {withPhotosCount !== undefined && (
                  <>
                    {" "}
                    ·{" "}
                    <span className="tabular-nums">
                      {withPhotosCount.toLocaleString()}
                    </span>{" "}
                    with photos
                  </>
                )}
              </>
            ) : (
              "Franchise pricing ledger, promos, variants, and linked photos"
            )}
          </p>
        </div>
      </div>
    </header>
  );
}
