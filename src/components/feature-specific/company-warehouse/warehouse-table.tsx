import { RootState } from "@/app/store";
import TransactionsLogDialog from "@/components/feature-specific/company-warehouse/transactions-log-dialog";
import UpdateInventoryItemDialog from "@/components/feature-specific/company-warehouse/update-inventory-item-dialog";
import VariantLocationsDialog from "@/components/feature-specific/company-warehouse/variant-locations-dialog";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { PaginationMeta } from "@/models/responses/company-stats.model";
import { CompanyInventoryListItem } from "@/models/responses/inventory-with-cost.model";
import { getCompanyInventoryItems, getInventoryTotalCost } from "@/services/inventory-service";
import { useQuery } from "@tanstack/react-query";
import { Column, ColumnDef, OnChangeFn, SortingState } from "@tanstack/react-table";
import { Banknote, Boxes, ChevronDown, ChevronUp, Package, PackageX, TriangleAlert, type LucideIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Barcode from "react-barcode";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

const PAGE_SIZES = [20, 50];
const SORT_KEYS = ["product_name", "name", "quantity", "broken_count"] as const;
type StockFilter = "" | "out_of_stock" | "broken";

interface Props {
  onInventoryId: (inventoryId: number | null) => void;
}

function SortableHeader<TData>({
  column,
  label,
}: {
  column: Column<TData, unknown>;
  label: string;
}) {
  const sorted = column.getIsSorted();
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="-ml-2 px-2"
      onClick={() => column.toggleSorting(sorted === "asc")}
    >
      {label}
      {sorted === "asc" ? <ChevronUp /> : null}
      {sorted === "desc" ? <ChevronDown /> : null}
    </Button>
  );
}

function SummaryStat({
  icon: Icon,
  label,
  value,
  hint,
  tone = "default",
  onClick,
  pressed,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  hint: string;
  tone?: "default" | "warning" | "danger";
  onClick?: () => void;
  pressed?: boolean;
}) {
  const emphasized = value !== "0" && value !== formatMoney(0);
  const valueClass =
    tone === "danger" && emphasized
      ? "text-destructive"
      : tone === "warning" && emphasized
        ? "text-orange-700 dark:text-orange-400"
        : "text-foreground";
  const className = cn(
    "flex min-h-24 items-start justify-between gap-3 rounded-xl border bg-card p-3 text-left",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
    onClick && "cursor-pointer transition-colors duration-200 hover:bg-accent/60",
    pressed && "border-primary bg-accent"
  );
  const body = (
    <>
      <div className="min-w-0">
        <div className="text-xs font-medium text-muted-foreground">{label}</div>
        <div className={cn("mt-1 text-lg font-semibold leading-tight tabular-nums tracking-tight", valueClass)}>
          {value}
        </div>
        <div className="mt-1 text-xs text-muted-foreground">{hint}</div>
      </div>
      <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted", valueClass)}>
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
    </>
  );
  if (!onClick) {
    return <div className={className}>{body}</div>;
  }
  return (
    <button
      type="button"
      className={className}
      aria-pressed={pressed}
      aria-label={`${label}, ${value}. ${hint}`}
      onClick={onClick}
    >
      {body}
    </button>
  );
}

function formatMoney(value: number) {
  return Intl.NumberFormat("en-DZ", {
    style: "currency",
    currency: "DZD",
  }).format(value);
}

export default function WarehouseTable({ onInventoryId }: Props) {
  const companyFromStore = useSelector((state: RootState) => state.company.company);
  const userCompany = useSelector((state: RootState) => state.user.company);
  const { pathname } = useLocation();
  const isModerator = pathname.includes("moderator");
  const company = isModerator ? userCompany : companyFromStore;

  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sorting, setSorting] = useState<SortingState>([
    { id: "quantity", desc: true },
  ]);
  const [stockFilter, setStockFilter] = useState<StockFilter>("");

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const next = searchValue.trim();
      if (next === debouncedSearch) return;
      setDebouncedSearch(next);
      setCurrentPage(0);
    }, 400);
    return () => window.clearTimeout(timeout);
  }, [searchValue, debouncedSearch]);

  const activeSort = sorting[0];
  const sortKey = SORT_KEYS.includes(activeSort?.id as (typeof SORT_KEYS)[number])
    ? activeSort.id
    : "quantity";
  const sortOrder = !activeSort || activeSort.desc ? "desc" : "asc";

  const { data, isLoading, isFetching } = useQuery({
    queryKey: [
      "company-inventory-items",
      company?.ID,
      currentPage,
      pageSize,
      debouncedSearch,
      sortKey,
      sortOrder,
      stockFilter,
    ],
    queryFn: () =>
      getCompanyInventoryItems(company!.ID, {
        page: currentPage + 1,
        limit: pageSize,
        search: debouncedSearch || undefined,
        sort: sortKey,
        order: sortOrder,
        stock: stockFilter || undefined,
      }),
    enabled: !!company,
    placeholderData: (previousData) => previousData,
  });

  const inventoryId = data?.data?.inventory_id ?? null;
  useEffect(() => {
    onInventoryId(inventoryId);
  }, [inventoryId, onInventoryId]);

  const { data: totalCostData } = useQuery({
    queryKey: ["inventory-total-cost", company?.ID],
    queryFn: () => getInventoryTotalCost(company?.ID ?? 0),
    enabled: !!company && !isModerator,
  });

  const items = data?.data?.items ?? [];
  const summary = data?.data?.summary;
  const pagination = data?.data?.pagination;
  const paginationMeta: PaginationMeta | undefined = pagination
    ? {
        total_items: pagination.total,
        total_pages: pagination.total_pages,
        current_page: pagination.page,
        per_page: pagination.limit,
      }
    : undefined;

  const handleSortingChange: OnChangeFn<SortingState> = (updater) => {
    setSorting((current) => (typeof updater === "function" ? updater(current) : updater));
    setCurrentPage(0);
  };

  const columns = useMemo<ColumnDef<CompanyInventoryListItem>[]>(() => {
    const defs: ColumnDef<CompanyInventoryListItem>[] = [
      {
        id: "product_name",
        header: ({ column }) => <SortableHeader column={column} label="Product" />,
        accessorFn: (row) => row.product?.name ?? "",
        cell: ({ row }) => {
          const variant = row.original.product_variant;
          const details = [
            variant?.color,
            variant?.size != null ? String(variant.size) : "",
          ].filter(Boolean);
          return (
            <div className="min-w-0">
              <div className="font-medium">{row.original.product?.name || "Product"}</div>
              {details.length > 0 ? (
                <div className="text-sm text-muted-foreground">{details.join(" · ")}</div>
              ) : null}
            </div>
          );
        },
      },
      {
        id: "name",
        header: ({ column }) => <SortableHeader column={column} label="Name" />,
        accessorKey: "name",
      },
      {
        id: "code",
        header: "Code",
        enableSorting: false,
        accessorFn: (row) => row.product_variant?.qr_code ?? "",
        cell: ({ row }) => {
          const code = row.original.product_variant?.qr_code;
          if (!code) {
            return <span className="text-muted-foreground">—</span>;
          }
          return (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 max-w-44 border-border bg-muted/40 px-2 font-mono text-xs"
                  aria-label={`Show barcode for ${code}`}
                >
                  <span className="truncate">{code}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto">
                <Barcode value={code} height={48} />
              </PopoverContent>
            </Popover>
          );
        },
      },
      {
        id: "quantity",
        header: ({ column }) => <SortableHeader column={column} label="Quantity" />,
        accessorKey: "quantity",
        cell: ({ row }) => (
          <span
            className={cn(
              "inline-flex min-w-8 items-center justify-center rounded-md px-2 py-0.5 text-sm font-medium tabular-nums",
              row.original.quantity > 0
                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                : "bg-muted text-muted-foreground"
            )}
          >
            {row.original.quantity}
          </span>
        ),
      },
      {
        id: "all_locations",
        header: "All locations",
        enableSorting: false,
        accessorFn: (row) => row.location_total,
        cell: ({ row }) => (
          <VariantLocationsDialog
            productName={row.original.product?.name}
            color={row.original.product_variant?.color}
            size={
              row.original.product_variant?.size != null
                ? String(row.original.product_variant.size)
                : undefined
            }
            totalQuantity={row.original.location_total ?? 0}
            locations={row.original.locations ?? []}
          />
        ),
      },
      {
        id: "broken_count",
        header: ({ column }) => <SortableHeader column={column} label="Broken" />,
        accessorKey: "broken_count",
        cell: ({ row }) => {
          const count = row.original.broken_count || 0;
          return (
            <span
              className={cn(
                "inline-flex min-w-8 items-center justify-center rounded-md px-2 py-0.5 text-sm font-medium tabular-nums",
                count > 0
                  ? "bg-orange-500/10 text-orange-700 dark:text-orange-400"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {count}
            </span>
          );
        },
      },
    ];

    if (!isModerator) {
      defs.push({
        id: "cost",
        header: "Cost",
        enableSorting: false,
        accessorKey: "cost",
        cell: ({ row }) => (
          <span
            className={
              row.original.cost < 0
                ? "tabular-nums text-red-500"
                : "tabular-nums text-green-600"
            }
          >
            {formatMoney(row.original.cost)}
          </span>
        ),
      });
    }

    defs.push({
      id: "actions",
      header: "Actions",
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex items-center justify-end">
          <UpdateInventoryItemDialog inventoryItem={row.original} />
          <TransactionsLogDialog inventoryItemId={row.original.ID} />
        </div>
      ),
    });

    return defs;
  }, [isModerator]);

  if (!company) return null;

  if (isLoading && !data) {
    return (
      <div className="flex flex-1 flex-col gap-3" aria-busy="true" aria-label="Loading warehouse">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: isModerator ? 4 : 5 }).map((_, index) => (
            <Skeleton key={index} className="h-16 w-full" />
          ))}
        </div>
        <Skeleton className="h-11 w-full max-w-sm" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="min-h-64 w-full flex-1" />
      </div>
    );
  }

  const toggleStock = (next: Exclude<StockFilter, "">) => {
    setStockFilter((current) => (current === next ? "" : next));
    setCurrentPage(0);
  };

  return (
    <div className="flex flex-col gap-4">
      <section
        aria-label="Warehouse summary"
        className={cn("grid grid-cols-2 gap-3", isModerator ? "xl:grid-cols-4" : "xl:grid-cols-5")}
      >
        <SummaryStat
          icon={Package}
          label="Variants"
          value={String(summary?.variant_count ?? 0)}
          hint="Active products"
        />
        <SummaryStat
          icon={Boxes}
          label="Units on hand"
          value={String(summary?.units_on_hand ?? 0)}
          hint="In this warehouse"
        />
        <SummaryStat
          icon={PackageX}
          label="Out of stock"
          value={String(summary?.out_of_stock ?? 0)}
          hint={stockFilter === "out_of_stock" ? "Showing these rows" : "Click to filter"}
          tone="danger"
          pressed={stockFilter === "out_of_stock"}
          onClick={() => toggleStock("out_of_stock")}
        />
        <SummaryStat
          icon={TriangleAlert}
          label="Broken units"
          value={String(summary?.broken_units ?? 0)}
          hint={stockFilter === "broken" ? "Showing these rows" : "Click to filter"}
          tone="warning"
          pressed={stockFilter === "broken"}
          onClick={() => toggleStock("broken")}
        />
        {isModerator ? null : (
          <SummaryStat
            icon={Banknote}
            label="Total cost"
            value={formatMoney(totalCostData?.data?.total ?? 0)}
            hint="At first price"
          />
        )}
      </section>
      <div className={cn(isFetching && "opacity-80 transition-opacity duration-200")}>
      <DataTable
        columns={columns}
        data={items}
        searchColumn="name"
        searchPlaceholder="Search product, color, size, or code"
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        sorting={sorting}
        onSortingChange={handleSortingChange}
        paginationMeta={paginationMeta}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        headerExtra={
          <Select
            value={String(pageSize)}
            onValueChange={(value) => {
              setPageSize(Number(value));
              setCurrentPage(0);
            }}
          >
            <SelectTrigger className="w-full sm:w-[140px]" aria-label="Rows per page">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZES.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size} rows
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
        emptyState={
          debouncedSearch || stockFilter ? (
            <div className="flex flex-col items-center gap-2 py-2">
              <p>
                {debouncedSearch
                  ? `No variants match “${debouncedSearch}”.`
                  : stockFilter === "out_of_stock"
                    ? "No out-of-stock variants."
                    : "No variants with broken units."}
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchValue("");
                  setStockFilter("");
                  setCurrentPage(0);
                }}
              >
                Clear filters
              </Button>
            </div>
          ) : (
            "No inventory items."
          )
        }
      />
      </div>
    </div>
  );
}
