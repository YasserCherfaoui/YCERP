import { ProductPromoBadges } from "@/components/feature-specific/products/product-promo-badges";
import { ProductThumbnail } from "@/components/feature-specific/products/product-thumbnail";
import { formatDzd } from "@/components/feature-specific/products/product-ui-utils";
import { ProductVariantsPopover } from "@/components/feature-specific/products/product-variants-popover";
import { SortableHeaderButton } from "@/components/feature-specific/products/sortable-header-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Product } from "@/models/data/product.model";
import { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";

interface GetFranchiseProductColumnsOptions {
  isVip?: boolean;
  onOpenDetails?: (product: Product) => void;
}

export function getFranchiseProductColumns({
  isVip = false,
  onOpenDetails,
}: GetFranchiseProductColumnsOptions = {}): ColumnDef<Product>[] {
  const cols: ColumnDef<Product>[] = [
    {
      accessorKey: "name",
      id: "name",
      header: ({ column }) => (
        <SortableHeaderButton column={column} label="Product" />
      ),
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="flex min-w-[15rem] items-center gap-3">
            <ProductThumbnail
              product={product}
              onClick={onOpenDetails ? () => onOpenDetails(product) : undefined}
            />
            <div className="min-w-0 flex-1 space-y-0.5">
              <div className="flex flex-wrap items-center gap-1.5">
                {onOpenDetails ? (
                  <button
                    type="button"
                    onClick={() => onOpenDetails(product)}
                    className="cursor-pointer truncate text-left text-sm font-semibold tracking-tight hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {product.name}
                  </button>
                ) : (
                  <span className="truncate text-sm font-semibold tracking-tight">
                    {product.name}
                  </span>
                )}
                <Badge
                  variant="outline"
                  className="px-1.5 py-0 font-mono text-[10px] text-muted-foreground tabular-nums"
                >
                  #{product.ID}
                </Badge>
                {product.is_active === false && (
                  <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
                    Inactive
                  </Badge>
                )}
              </div>
              {product.description && (
                <p className="max-w-[20rem] truncate text-xs text-muted-foreground">
                  {product.description}
                </p>
              )}
            </div>
          </div>
        );
      },
    },
    {
      id: "category",
      header: ({ column }) => (
        <SortableHeaderButton column={column} label="Category" />
      ),
      accessorFn: (row) => row.product_category?.name ?? "",
      cell: ({ row }) => {
        const category = row.original.product_category;
        if (!category) {
          return (
            <span className="text-xs text-muted-foreground">Uncategorized</span>
          );
        }
        return (
          <Badge variant="outline" className="font-normal">
            {category.name}
          </Badge>
        );
      },
    },
    {
      id: "promos",
      header: "Promos",
      cell: ({ row }) => <ProductPromoBadges product={row.original} />,
      enableSorting: false,
    },
    {
      id: "variants",
      header: "Variants",
      cell: ({ row }) => <ProductVariantsPopover product={row.original} />,
      enableSorting: false,
    },
  ];

  if (isVip) {
    cols.push({
      id: "vip_franchise_price",
      accessorFn: (row) => row.vip_franchise_price ?? row.franchise_price,
      header: ({ column }) => (
        <SortableHeaderButton
          column={column}
          label="VIP Franchise Price"
          align="right"
        />
      ),
      cell: ({ row }) => {
        const product = row.original;
        const vip = product.vip_franchise_price;
        const effective = vip ?? product.franchise_price;
        return (
          <div className="text-right">
            <div className="text-sm font-medium tabular-nums">
              {formatDzd(effective)}
            </div>
            {vip == null && (
              <div className="text-[10px] text-muted-foreground">
                Normal fallback
              </div>
            )}
          </div>
        );
      },
    });
  } else {
    cols.push({
      accessorKey: "franchise_price",
      id: "franchise_price",
      header: ({ column }) => (
        <SortableHeaderButton
          column={column}
          label="Franchise Price"
          align="right"
        />
      ),
      cell: ({ row }) => (
        <div className="text-right text-sm font-medium tabular-nums">
          {formatDzd(row.original.franchise_price)}
        </div>
      ),
    });
  }

  cols.push(
    {
      accessorKey: "price",
      id: "price",
      header: ({ column }) => (
        <SortableHeaderButton column={column} label="Sell Price" align="right" />
      ),
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="text-right">
            <div className="text-sm font-semibold tabular-nums">
              {formatDzd(product.price)}
            </div>
            {product.promo_price != null && product.promo_price > 0 && (
              <div className="text-[11px] text-muted-foreground tabular-nums">
                Promo: {formatDzd(product.promo_price)}
              </div>
            )}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "",
      enableHiding: false,
      cell: ({ row }) =>
        onOpenDetails ? (
          <div className="flex justify-end">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              aria-label={`Inspect ${row.original.name}`}
              onClick={() => onOpenDetails(row.original)}
            >
              <Eye className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        ) : null,
    }
  );

  return cols;
}

export const franchiseProductsColumnsNormal: ColumnDef<Product>[] =
  getFranchiseProductColumns({ isVip: false });

export const franchiseProductsColumnsVIP: ColumnDef<Product>[] =
  getFranchiseProductColumns({ isVip: true });
