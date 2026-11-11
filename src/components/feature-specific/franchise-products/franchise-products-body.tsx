import { RootState } from "@/app/store";
import { liquidGlass } from "@/components/feature-specific/crm/crm-theme";
import { getFranchiseProductColumns } from "@/components/feature-specific/franchise-products/franchise-products-columns";
import { ProductDetailsDialog } from "@/components/feature-specific/products/product-details-dialog";
import { ProductOverviewCards } from "@/components/feature-specific/products/product-overview-cards";
import {
  DEFAULT_PRODUCT_FILTERS,
  filterProducts,
  getProductImageUrls,
  ProductFiltersState,
} from "@/components/feature-specific/products/product-ui-utils";
import { ProductsFilterBar } from "@/components/feature-specific/products/products-filter-bar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { FRANCHISE_TYPES } from "@/models/data/franchise.model";
import { ProductCategory } from "@/models/data/product.model";
import { getFranchiseAllProducts } from "@/services/product-service";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";

const SEGMENT_LABELS: Record<ProductFiltersState["segment"], string> = {
  all: "All products",
  active: "Active products",
  inactive: "Inactive products",
  pack: "Pack products",
  bogo: "BOGO products",
  combinable: "Combinable products",
  pairable: "Pairable products",
  no_photos: "Products missing photos",
};

interface FranchiseProductsBodyProps {
  onCountsChange?: (counts: {
    total: number;
    filtered: number;
    withPhotos: number;
  }) => void;
}

export default function FranchiseProductsBody({
  onCountsChange,
}: FranchiseProductsBodyProps) {
  const franchise = useSelector(
    (state: RootState) => state.franchise.franchise
  );
  const [filters, setFilters] = useState<ProductFiltersState>(
    DEFAULT_PRODUCT_FILTERS
  );
  const [detailsProductId, setDetailsProductId] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["products", "franchise", franchise?.company_id],
    queryFn: () => getFranchiseAllProducts(franchise!.company_id),
    enabled: Boolean(franchise?.company_id),
  });

  const products = useMemo(() => data?.data ?? [], [data?.data]);

  const categories = useMemo(() => {
    const map = new Map<number, ProductCategory>();
    for (const product of products) {
      if (product.product_category) {
        map.set(product.product_category.ID, product.product_category);
      }
    }
    return Array.from(map.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [products]);

  const filteredProducts = useMemo(
    () => filterProducts(products, filters),
    [products, filters]
  );

  const withPhotosCount = useMemo(
    () => products.filter((p) => getProductImageUrls(p).length > 0).length,
    [products]
  );

  useEffect(() => {
    onCountsChange?.({
      total: products.length,
      filtered: filteredProducts.length,
      withPhotos: withPhotosCount,
    });
  }, [onCountsChange, products.length, filteredProducts.length, withPhotosCount]);

  const detailsProduct = useMemo(
    () =>
      detailsProductId != null
        ? products.find((p) => p.ID === detailsProductId) ?? null
        : null,
    [products, detailsProductId]
  );

  const isVip = franchise?.franchise_type === FRANCHISE_TYPES.VIP;

  const columns = useMemo(
    () =>
      getFranchiseProductColumns({
        isVip,
        onOpenDetails: (product) => setDetailsProductId(product.ID),
      }),
    [isVip]
  );

  return (
    <div className="flex flex-col gap-6">
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
              data={filteredProducts}
              columns={columns}
              searchColumn="name"
              searchBar={false}
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
        hideCost
        franchiseType={isVip ? "vip" : "normal"}
        canManage={false}
      />
    </div>
  );
}
