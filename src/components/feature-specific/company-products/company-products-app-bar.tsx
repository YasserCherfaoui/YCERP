import { RootState } from "@/app/store";
import AddProductVariantForm from "@/components/feature-specific/company-products/add-product-variant-form";
import { Button } from "@/components/ui/button";
import { syncProductsWithShopify } from "@/services/affiliate-service";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router";
import AddProductForm from "./add-product-form";
import PrintProductsLabelsDialog from "./print-products-labels-dialog";

export default function () {
  const navigate = useNavigate();
  const companyFromStore = useSelector((state: RootState) => state.company.company);
  const userCompany = useSelector((state: RootState) => state.user.company);
  const { pathname } = useLocation();
  const company = pathname.includes("moderator") ? userCompany : companyFromStore;
  const lastLocation = pathname.substring(0, pathname.lastIndexOf("/"));

  const syncMutation = useMutation({
    mutationFn: syncProductsWithShopify,
    onSuccess: () => {
      console.log("Products synced successfully with Shopify");
    },
    onError: (error) => {
      console.error("Failed to sync products:", error);
    },
  });

  if (!company) return;
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
        <Button className="w-fit shrink-0" onClick={() => navigate(lastLocation)}>
          <ArrowLeft />
          <span className="sm:hidden">Back</span>
          <span className="hidden sm:inline">Back to Menu</span>
        </Button>
        <span className="truncate text-lg sm:text-2xl">{company.company_name} &gt; Products</span>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => syncMutation.mutate()}
          disabled={syncMutation.isPending}
          variant="outline"
        >
          <RefreshCw className={`h-4 w-4 sm:mr-2 ${syncMutation.isPending ? "animate-spin" : ""}`} />
          <span className="sm:hidden">{syncMutation.isPending ? "Syncing" : "Sync"}</span>
          <span className="hidden sm:inline">{syncMutation.isPending ? "Syncing..." : "Sync with Shopify"}</span>
        </Button>
        <AddProductForm />
        <AddProductVariantForm />
        <PrintProductsLabelsDialog />
      </div>
    </div>
  );
}
