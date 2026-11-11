import { ProductPromoBadges } from "@/components/feature-specific/products/product-promo-badges";
import { ProductThumbnail } from "@/components/feature-specific/products/product-thumbnail";
import { formatDzd } from "@/components/feature-specific/products/product-ui-utils";
import { ProductVariantsPopover } from "@/components/feature-specific/products/product-variants-popover";
import { SortableHeaderButton } from "@/components/feature-specific/products/sortable-header-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Product } from "@/models/data/product.model";
import { ColumnDef } from "@tanstack/react-table";
import { Eye, MoreHorizontal } from "lucide-react";
import RemoveProductActionDialog from "./remove-product-action-dialog";
import { SetAffiliatePropsDialog } from "./set-affiliate-props-dialog";
import UpdateProductForm from "./update-product-form";

interface GetCompanyProductColumnsOptions {
  isModerator?: boolean;
  onOpenDetails?: (product: Product) => void;
}

export function getCompanyProductColumns({
  isModerator = false,
  onOpenDetails,
}: GetCompanyProductColumnsOptions = {}): ColumnDef<Product>[] {
  const cols: ColumnDef<Product>[] = [
    {
      accessorKey: "name",
      id: "product_name",
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
          <div className="flex flex-wrap items-center gap-1">
            <Badge variant="outline" className="font-normal">
              {category.name}
            </Badge>
            {!category.is_active && (
              <span className="text-[11px] text-muted-foreground">(inactive)</span>
            )}
          </div>
        );
      },
    },
    {
      id: "promos",
      header: "Promos",
      cell: ({ row }) => (
        <ProductPromoBadges product={row.original} showWooPicture />
      ),
      enableSorting: false,
    },
    {
      id: "variants",
      header: "Variants",
      cell: ({ row }) => <ProductVariantsPopover product={row.original} />,
      enableSorting: false,
    },
  ];

  if (!isModerator) {
    cols.push({
      accessorKey: "first_price",
      id: "first_price",
      header: ({ column }) => (
        <SortableHeaderButton column={column} label="First Price" align="right" />
      ),
      cell: ({ row }) => (
        <div className="text-right text-sm font-medium tabular-nums text-muted-foreground">
          {formatDzd(row.original.first_price)}
        </div>
      ),
    });
  }

  cols.push(
    {
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
    },
    {
      id: "vip_franchise_price",
      accessorFn: (row) => row.vip_franchise_price ?? undefined,
      sortUndefined: "last",
      header: ({ column }) => (
        <SortableHeaderButton column={column} label="VIP Price" align="right" />
      ),
      cell: ({ row }) => {
        const vip = row.original.vip_franchise_price;
        return (
          <div
            className={
              vip != null
                ? "text-right text-sm font-medium tabular-nums"
                : "text-right text-sm tabular-nums text-muted-foreground"
            }
          >
            {formatDzd(vip)}
          </div>
        );
      },
    },
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
      cell: ({ row }) => {
        const product = row.original;

        return (
          <div className="flex items-center justify-end gap-1">
            {onOpenDetails && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                aria-label={`Inspect ${product.name}`}
                onClick={() => onOpenDetails(product)}
              >
                <Eye className="h-4 w-4" aria-hidden="true" />
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                {onOpenDetails && (
                  <DropdownMenuItem onSelect={() => onOpenDetails(product)}>
                    <Eye className="mr-2 h-4 w-4" aria-hidden="true" />
                    View details & photos
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() =>
                    navigator.clipboard.writeText(product.ID.toString())
                  }
                >
                  Copy product ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <UpdateProductForm product={product} />
                <SetAffiliatePropsDialog product={product} />
                <RemoveProductActionDialog product={product} />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    }
  );

  return cols;
}

export const columns: ColumnDef<Product>[] = getCompanyProductColumns();
