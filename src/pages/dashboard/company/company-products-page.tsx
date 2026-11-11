import { RootState } from "@/app/store";
import CompanyProductsAppBar from "@/components/feature-specific/company-products/company-products-app-bar";
import { getCompanyProductColumns } from "@/components/feature-specific/company-products/products-table-columns";
import CrmBackdrop from "@/components/feature-specific/crm/crm-backdrop";
import { liquidGlass } from "@/components/feature-specific/crm/crm-theme";
import { ProductDetailsDialog } from "@/components/feature-specific/products/product-details-dialog";
import { ProductOverviewCards } from "@/components/feature-specific/products/product-overview-cards";
import {
  DEFAULT_PRODUCT_FILTERS,
  filterProducts,
  getProductImageUrls,
  ProductFiltersState,
} from "@/components/feature-specific/products/product-ui-utils";
import { ProductsFilterBar } from "@/components/feature-specific/products/products-filter-bar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  deleteProducts,
  getAllProductsWithVariantsByCompany,
  listProductCategories,
} from "@/services/product-service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

const SEGMENT_LABELS: Record<ProductFiltersState["segment"], string> = {
  all: "All products",
  active: "Active products",
  inactive: "Inactive products",
  bogo: "BOGO products",
  combinable: "Combinable products",
  pairable: "Pairable products",
  no_photos: "Products missing photos",
};

export default function CompanyProductsPage() {
  const companyFromStore = useSelector((state: RootState) => state.company.company);
  const userCompany = useSelector((state: RootState) => state.user.company);
  const { pathname } = useLocation();
  const isModerator = pathname.includes("moderator");
  const company = isModerator ? userCompany : companyFromStore;

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState<ProductFiltersState>(
    DEFAULT_PRODUCT_FILTERS
  );
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [detailsProductId, setDetailsProductId] = useState<number | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["products", company?.ID],
    queryFn: () => getAllProductsWithVariantsByCompany(company!.ID),
    enabled: Boolean(company?.ID),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["product-categories", company?.ID],
    queryFn: () => listProductCategories(company!.ID),
    enabled: Boolean(company?.ID),
  });

  const products = useMemo(() => data?.data ?? [], [data?.data]);
  const categories = useMemo(
    () => categoriesData?.data ?? [],
    [categoriesData?.data]
  );

  const filteredProducts = useMemo(
    () => filterProducts(products, filters),
    [products, filters]
  );

  const withPhotosCount = useMemo(
    () => products.filter((p) => getProductImageUrls(p).length > 0).length,
    [products]
  );

  const detailsProduct = useMemo(
    () =>
      detailsProductId != null
        ? products.find((p) => p.ID === detailsProductId) ?? null
        : null,
    [products, detailsProductId]
  );

  const columns = useMemo(
    () =>
      getCompanyProductColumns({
        isModerator,
        onOpenDetails: (product) => setDetailsProductId(product.ID),
      }),
    [isModerator]
  );

  const { mutate: bulkDeleteMutation, isPending: isDeleting } = useMutation({
    mutationFn: deleteProducts,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({
        title: "Products removed",
        description: `${selectedRows.length} product(s) removed successfully.`,
      });
      setSelectedRows([]);
      setBulkDeleteOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to remove products",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (!company) {
    return (
      <div className="p-6 text-sm text-muted-foreground">No company selected</div>
    );
  }

  return (
    <div className="relative isolate min-h-full overflow-hidden">
      <CrmBackdrop />
      <div className="relative mx-auto flex max-w-[1600px] flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
        <CompanyProductsAppBar
          totalCount={products.length}
          filteredCount={filteredProducts.length}
          withPhotosCount={withPhotosCount}
        />

        <ProductOverviewCards
          products={products}
          selectedSegment={filters.segment}
          onSelectSegment={(segment) => setFilters((prev) => ({ ...prev, segment }))}
          isLoading={isLoading}
        />

        <ProductsFilterBar
          filters={filters}
          onChange={setFilters}
          categories={categories}
        />

        {selectedRows.length > 0 && (
          <section
            aria-label="Selected products"
            className={cn(
              "flex flex-wrap items-center gap-2 rounded-xl px-3 py-2.5 ring-2 ring-white/40 dark:ring-white/20",
              liquidGlass
            )}
          >
            <span className="px-1 text-sm font-medium tabular-nums">
              {selectedRows.length} selected
            </span>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="border-rose-300 bg-rose-50 text-rose-800 hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-950/70 dark:text-rose-100 dark:hover:bg-rose-950"
              onClick={() => setBulkDeleteOpen(true)}
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Delete selected
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setSelectedRows([])}
            >
              <X className="h-4 w-4" aria-hidden="true" />
              Clear
            </Button>
          </section>
        )}

        <Card className={cn("overflow-hidden", liquidGlass)}>
          <CardHeader className="flex flex-row items-end justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardTitle className="text-lg">
                {SEGMENT_LABELS[filters.segment]}
              </CardTitle>
              <CardDescription className="tabular-nums">
                {isLoading
                  ? "Loading products..."
                  : `${filteredProducts.length.toLocaleString()} product${filteredProducts.length === 1 ? "" : "s"}`}
              </CardDescription>
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="p-3 sm:p-4">
            {isLoading ? (
              <div className="space-y-2" aria-busy="true" aria-live="polite">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Skeleton key={index} className="h-16 w-full rounded-xl" />
                ))}
              </div>
            ) : (
              <DataTable
                searchColumn="product_name"
                searchBar={false}
                columns={columns}
                data={filteredProducts}
                getRowId={(row) => String(row.ID)}
                selectedRows={selectedRows}
                setSelectedRows={setSelectedRows}
                showSelectionSummary={false}
                emptyState="No products match the current filters."
              />
            )}
          </CardContent>
        </Card>

        <ProductDetailsDialog
          product={detailsProduct}
          open={Boolean(detailsProduct)}
          onOpenChange={(open) => {
            if (!open) setDetailsProductId(null);
          }}
          hideCost={isModerator}
          canManage
        />

        <Dialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
          <DialogContent className={liquidGlass}>
            <DialogHeader>
              <DialogTitle>
                Delete {selectedRows.length} selected product
                {selectedRows.length === 1 ? "" : "s"}?
              </DialogTitle>
              <DialogDescription>
                This will affect linked supplier bills, franchise bills, inventory,
                and sales records.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setBulkDeleteOpen(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={isDeleting}
                onClick={() => bulkDeleteMutation(selectedRows.map(Number))}
              >
                {isDeleting && (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                )}
                Delete {selectedRows.length}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
