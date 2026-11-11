import { RootState } from "@/app/store";
import AppBarBackButton from "@/components/common/app-bar-back-button";
import AddProductVariantForm from "@/components/feature-specific/company-products/add-product-variant-form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { syncProductsWithShopify } from "@/services/affiliate-service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import AddProductForm from "./add-product-form";
import { ManageProductCategoriesDialog } from "./manage-product-categories-dialog";
import PrintProductsLabelsDialog from "./print-products-labels-dialog";

interface CompanyProductsAppBarProps {
  totalCount?: number;
  filteredCount?: number;
  withPhotosCount?: number;
}

export default function CompanyProductsAppBar({
  totalCount,
  filteredCount,
  withPhotosCount,
}: CompanyProductsAppBarProps) {
  const companyFromStore = useSelector((state: RootState) => state.company.company);
  const userCompany = useSelector((state: RootState) => state.user.company);
  const { pathname } = useLocation();
  const company = pathname.includes("moderator") ? userCompany : companyFromStore;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const syncMutation = useMutation({
    mutationFn: syncProductsWithShopify,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({
        title: "Shopify sync complete",
        description: "Products have been synced with Shopify.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Shopify sync failed",
        description: error.message || "Could not sync products with Shopify.",
        variant: "destructive",
      });
    },
  });

  if (!company) return null;

  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <AppBarBackButton destination="Menu" />
        <div className="min-w-0 space-y-1">
          <p className="truncate text-xs font-medium text-muted-foreground">
            {company.company_name}
          </p>
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
              "Catalog, pricing ledger, variants, and linked product media"
            )}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <ManageProductCategoriesDialog companyId={company.ID} />
        <Button
          type="button"
          onClick={() => syncMutation.mutate()}
          disabled={syncMutation.isPending}
          variant="outline"
          className="bg-background"
        >
          <RefreshCw
            aria-hidden="true"
            className={`h-4 w-4 ${syncMutation.isPending ? "animate-spin" : ""}`}
          />
          <span className="sm:hidden">
            {syncMutation.isPending ? "Syncing" : "Sync"}
          </span>
          <span className="hidden sm:inline">
            {syncMutation.isPending ? "Syncing..." : "Sync with Shopify"}
          </span>
        </Button>
        <PrintProductsLabelsDialog />
        <AddProductVariantForm />
        <AddProductForm />
      </div>
    </header>
  );
}
