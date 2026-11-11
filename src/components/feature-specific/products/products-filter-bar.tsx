import { liquidGlass } from "@/components/feature-specific/crm/crm-theme";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ProductCategory } from "@/models/data/product.model";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";
import {
  DEFAULT_PRODUCT_FILTERS,
  PhotoFilter,
  ProductFiltersState,
  PromoFilter,
  StatusFilter,
} from "./product-ui-utils";

interface ProductsFilterBarProps {
  filters: ProductFiltersState;
  onChange: (next: ProductFiltersState) => void;
  categories: ProductCategory[];
}

export function ProductsFilterBar({
  filters,
  onChange,
  categories,
}: ProductsFilterBarProps) {
  const [sheetOpen, setSheetOpen] = useState(false);

  const selectedCategoryName =
    filters.categoryId === "uncategorized"
      ? "Uncategorized"
      : categories.find((c) => String(c.ID) === filters.categoryId)?.name;

  const chips = [
    filters.segment !== "all" && {
      key: "segment",
      label: `Segment: ${filters.segment.replace("_", " ")}`,
      clear: () => onChange({ ...filters, segment: "all" }),
    },
    filters.categoryId !== "all" && {
      key: "category",
      label: `Category: ${selectedCategoryName ?? filters.categoryId}`,
      clear: () => onChange({ ...filters, categoryId: "all" }),
    },
    filters.promo !== "all" && {
      key: "promo",
      label: `Promo: ${filters.promo}`,
      clear: () => onChange({ ...filters, promo: "all" }),
    },
    filters.status !== "all" && {
      key: "status",
      label: `Status: ${filters.status}`,
      clear: () => onChange({ ...filters, status: "all" }),
    },
    filters.photo !== "all" && {
      key: "photo",
      label:
        filters.photo === "with_photos" ? "Has photos" : "Missing photos",
      clear: () => onChange({ ...filters, photo: "all" }),
    },
    filters.search.trim() !== "" && {
      key: "search",
      label: `"${filters.search.trim()}"`,
      clear: () => onChange({ ...filters, search: "" }),
    },
  ].filter(Boolean) as Array<{ key: string; label: string; clear: () => void }>;

  const filterSelects = (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="products-filter-category">Category</Label>
        <Select
          value={filters.categoryId}
          onValueChange={(value) => onChange({ ...filters, categoryId: value })}
        >
          <SelectTrigger id="products-filter-category" className="w-full bg-background">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            <SelectItem value="uncategorized">Uncategorized</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.ID} value={String(cat.ID)}>
                {cat.name}
                {!cat.is_active ? " (inactive)" : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="products-filter-promo">Promo rule</Label>
        <Select
          value={filters.promo}
          onValueChange={(value) =>
            onChange({ ...filters, promo: value as PromoFilter })
          }
        >
          <SelectTrigger id="products-filter-promo" className="w-full bg-background">
            <SelectValue placeholder="All promo rules" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All promo rules</SelectItem>
            <SelectItem value="pack">Pack</SelectItem>
            <SelectItem value="bogo">BOGO</SelectItem>
            <SelectItem value="combinable">Combinable</SelectItem>
            <SelectItem value="pairable">Pairable</SelectItem>
            <SelectItem value="none">No promo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="products-filter-status">Status</Label>
        <Select
          value={filters.status}
          onValueChange={(value) =>
            onChange({ ...filters, status: value as StatusFilter })
          }
        >
          <SelectTrigger id="products-filter-status" className="w-full bg-background">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active only</SelectItem>
            <SelectItem value="inactive">Inactive only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="products-filter-photo">Photos</Label>
        <Select
          value={filters.photo}
          onValueChange={(value) =>
            onChange({ ...filters, photo: value as PhotoFilter })
          }
        >
          <SelectTrigger id="products-filter-photo" className="w-full bg-background">
            <SelectValue placeholder="All products" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All products</SelectItem>
            <SelectItem value="with_photos">Has photos</SelectItem>
            <SelectItem value="missing_photos">Missing photos</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  return (
    <Card className={liquidGlass} aria-label="Find products">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Find products</CardTitle>
        <CardDescription>
          Search by product name, description, ID, category, or variant color / QR code.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
          <div className="flex flex-1 flex-col gap-2">
            <Label htmlFor="products-search">Search</Label>
            <div className="relative">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id="products-search"
                type="search"
                placeholder="Search name, description, category, color, QR..."
                value={filters.search}
                onChange={(e) =>
                  onChange({ ...filters, search: e.target.value })
                }
                className="bg-white/70 pl-9 backdrop-blur-md dark:bg-white/10"
              />
            </div>
          </div>

          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="bg-background lg:hidden"
              >
                <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
                Filters
                {chips.length > 0 && (
                  <Badge variant="secondary" className="ml-1 tabular-nums">
                    {chips.length}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
              <SheetHeader>
                <SheetTitle>Filter products</SheetTitle>
              </SheetHeader>
              <div className="mt-4">{filterSelects}</div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="hidden lg:block">{filterSelects}</div>

        {chips.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 border-t pt-4">
            {chips.map((chip) => (
              <button
                key={chip.key}
                type="button"
                onClick={chip.clear}
                className="inline-flex min-h-8 cursor-pointer items-center gap-1.5 rounded-full border bg-background px-3 py-1 text-xs font-medium capitalize motion-safe:transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {chip.label}
                <X className="size-3" aria-hidden="true" />
                <span className="sr-only">Remove {chip.label}</span>
              </button>
            ))}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onChange(DEFAULT_PRODUCT_FILTERS)}
            >
              Clear filters
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

