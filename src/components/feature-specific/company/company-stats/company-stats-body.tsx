import { RootState } from "@/app/store";
import { companyPurchasesColumns } from "@/components/feature-specific/company/company-stats/company-purchases-columns";
import { liquidGlass } from "@/components/feature-specific/crm/crm-theme";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { getProductPurchases, getProductSales } from "@/services/product-service";
import { useQuery } from "@tanstack/react-query";
import { SortingState } from "@tanstack/react-table";
import { format, subMonths } from "date-fns";
import { CalendarDays, Loader2, Package, RefreshCcw, Search, ShoppingCart, X } from "lucide-react";
import { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import { useSelector } from "react-redux";
import { companyStatsColumns } from "./company-stats-columns";

const STAT_TABS = [
  {
    value: "sales",
    label: "Sales totals",
    description: "Franchise sold and delivered orders",
    icon: ShoppingCart,
    surfaceClass:
      "border-violet-200/80 bg-violet-100/80 text-violet-950 hover:bg-violet-100 dark:border-violet-400/30 dark:bg-violet-500/20 dark:text-violet-50 dark:hover:bg-violet-500/30",
    iconClass: "bg-violet-200/80 text-violet-800 dark:bg-violet-400/20 dark:text-violet-100",
    selectedClass: "bg-violet-200 ring-2 ring-violet-400/80 dark:bg-violet-500/40 dark:ring-violet-300/60",
  },
  {
    value: "purchases",
    label: "Purchases totals",
    description: "Supplier bill quantities",
    icon: Package,
    surfaceClass:
      "border-amber-200/80 bg-amber-100/85 text-amber-950 hover:bg-amber-100 dark:border-amber-400/30 dark:bg-amber-500/20 dark:text-amber-50 dark:hover:bg-amber-500/30",
    iconClass: "bg-amber-200/80 text-amber-900 dark:bg-amber-400/20 dark:text-amber-100",
    selectedClass: "bg-amber-200 ring-2 ring-amber-400/80 dark:bg-amber-500/40 dark:ring-amber-300/60",
  },
] as const;

export default function CompanyStatsBody() {
  const isMobile = useIsMobile();
  const company = useSelector((state: RootState) => state.company.company);
  const [activeTab, setActiveTab] = useState<(typeof STAT_TABS)[number]["value"]>("sales");
  const [date, setDate] = useState<DateRange | undefined>({
    from: subMonths(new Date(), 1),
    to: new Date(),
  });
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sorting, setSorting] = useState<SortingState>([
    { id: "total_sold_franchises", desc: true },
  ]);
  const [purchasesSorting, setPurchasesSorting] = useState<SortingState>([
    { id: "total_bill_quantity", desc: true },
  ]);

  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
      setCurrentPage(0);
    }, 300);
    return () => clearTimeout(handle);
  }, [searchInput]);

  const salesSort = sorting[0];
  const purchasesSort = purchasesSorting[0];
  const dateFrom = date?.from || new Date();
  const dateTo = date?.to || new Date();
  const dateLabel =
    date?.from && date?.to
      ? `${format(date.from, "d MMM yyyy")} – ${format(date.to, "d MMM yyyy")}`
      : date?.from
        ? format(date.from, "d MMM yyyy")
        : "Pick a date range";

  const {
    data,
    isLoading: salesLoading,
    isFetching: salesFetching,
    refetch: refetchSales,
  } = useQuery({
    queryKey: [
      "product-sales",
      company?.ID || 0,
      dateFrom,
      dateTo,
      currentPage,
      pageSize,
      debouncedSearch,
      salesSort?.id,
      salesSort?.desc,
    ],
    queryFn: () =>
      getProductSales({
        company_id: company?.ID || 0,
        start_date: dateFrom,
        end_date: dateTo,
        page: currentPage + 1,
        limit: pageSize,
        search: debouncedSearch || undefined,
        sort_by: salesSort?.id,
        sort_order: salesSort?.desc === false ? "asc" : "desc",
      }),
    enabled: !!company?.ID && !!date?.from && !!date?.to && activeTab === "sales",
  });

  const {
    data: purchasesData,
    isLoading: purchasesLoading,
    isFetching: purchasesFetching,
    refetch: refetchPurchases,
  } = useQuery({
    queryKey: [
      "product-purchases",
      company?.ID || 0,
      dateFrom,
      dateTo,
      currentPage,
      pageSize,
      debouncedSearch,
      purchasesSort?.id,
      purchasesSort?.desc,
    ],
    queryFn: () =>
      getProductPurchases({
        company_id: company?.ID || 0,
        start_date: dateFrom,
        end_date: dateTo,
        page: currentPage + 1,
        limit: pageSize,
        search: debouncedSearch || undefined,
        sort_by: purchasesSort?.id,
        sort_order: purchasesSort?.desc === false ? "asc" : "desc",
      }),
    enabled: !!company?.ID && !!date?.from && !!date?.to && activeTab === "purchases",
  });

  const activeMeta =
    activeTab === "sales" ? data?.data?.pagination : purchasesData?.data?.pagination;
  const isLoading = activeTab === "sales" ? salesLoading : purchasesLoading;
  const isFetching = activeTab === "sales" ? salesFetching : purchasesFetching;

  const handleRefresh = () => {
    if (activeTab === "sales") {
      refetchSales();
    } else {
      refetchPurchases();
    }
  };

  if (!company) {
    return <div>No company selected</div>;
  }

  return (
    <>
      <Card className={liquidGlass} aria-label="Statistics overview">
        <CardHeader className="flex flex-col gap-3 space-y-0 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base">Overview</CardTitle>
            <CardDescription>Choose sales or purchases, then pick a date range.</CardDescription>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                type="button"
                className={cn("w-full justify-start bg-background sm:w-auto", !date && "text-muted-foreground")}
              >
                <CalendarDays />
                {dateLabel}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={(range) => {
                  setDate(range);
                  setCurrentPage(0);
                }}
                numberOfMonths={isMobile ? 1 : 2}
              />
              <div className="flex justify-end border-t p-2">
                <Button
                  size="sm"
                  variant="ghost"
                  type="button"
                  onClick={() => {
                    setDate({ from: subMonths(new Date(), 1), to: new Date() });
                    setCurrentPage(0);
                  }}
                >
                  Reset
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2" role="tablist" aria-label="Statistics type">
            {STAT_TABS.map((tab) => {
              const Icon = tab.icon;
              const selected = activeTab === tab.value;
              return (
                <button
                  key={tab.value}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => {
                    setActiveTab(tab.value);
                    setCurrentPage(0);
                    setSearchInput("");
                    setDebouncedSearch("");
                  }}
                  className={cn(
                    "flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border px-3 py-3 text-left shadow-sm backdrop-blur-md",
                    "motion-safe:transition motion-safe:duration-200 hover:shadow-md active:scale-[0.98]",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    tab.surfaceClass,
                    selected && tab.selectedClass
                  )}
                >
                  <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg", tab.iconClass)}>
                    <Icon className="size-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-semibold leading-none">{tab.label}</span>
                    <span className="mt-1 block truncate text-xs font-medium text-current/70">
                      {tab.description}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className={liquidGlass} aria-label="Filters">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Find products</CardTitle>
          <CardDescription>Search products by name in the selected date range.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search product name..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="bg-white/70 pl-9 backdrop-blur-md dark:bg-white/10"
              />
            </div>
            {searchInput && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchInput("");
                  setDebouncedSearch("");
                }}
              >
                <X className="mr-1 size-4" />
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <section
        className={cn("flex flex-wrap items-center gap-2 rounded-xl px-3 py-2.5", liquidGlass)}
        aria-label="Table options"
      >
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={isFetching}
          onClick={handleRefresh}
          className="border-white/50 bg-white/70 hover:bg-white/90 dark:border-white/10 dark:bg-white/10 dark:hover:bg-white/15"
        >
          {isFetching ? <Loader2 className="size-4 animate-spin" /> : <RefreshCcw className="size-4" />}
          Refresh
        </Button>
        <div className="ml-auto flex items-center gap-2">
          <Label htmlFor="stats-page-size" className="text-sm text-muted-foreground">
            Page size
          </Label>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => {
              setPageSize(Number(value));
              setCurrentPage(0);
            }}
          >
            <SelectTrigger id="stats-page-size" className="w-[5.5rem]" aria-label="Page size">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
          {activeMeta?.total_items != null && (
            <span className="ml-2 text-sm text-muted-foreground">
              · {activeMeta.total_items.toLocaleString()} products
            </span>
          )}
        </div>
      </section>

      <Card className={cn("overflow-hidden", liquidGlass)}>
        <CardHeader className="flex flex-row items-end justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle className="text-lg">
              {activeTab === "sales" ? "Sales totals" : "Purchases totals"}
            </CardTitle>
            <CardDescription>
              {activeTab === "sales"
                ? "Franchise sold quantities and delivered WooCommerce orders."
                : "Quantities received on supplier bills."}
            </CardDescription>
          </div>
          {activeMeta?.total_items != null && (
            <span className="text-sm text-muted-foreground">
              {activeMeta.total_items.toLocaleString()} products
            </span>
          )}
        </CardHeader>
        <Separator />
        <CardContent className="p-3 sm:p-4">
          {isLoading ? (
            <div className="space-y-2" aria-busy="true" aria-live="polite">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          ) : activeTab === "sales" ? (
            <DataTable
              columns={companyStatsColumns}
              data={data?.data?.products || []}
              searchColumn="name"
              searchBar={false}
              getRowId={(row) => String(row.product_id)}
              sorting={sorting}
              onSortingChange={(updater) => {
                setSorting((prev) =>
                  typeof updater === "function" ? updater(prev) : updater
                );
                setCurrentPage(0);
              }}
              paginationMeta={data?.data?.pagination}
              onPageChange={(page) => setCurrentPage(page)}
              currentPage={currentPage}
              emptyState="No product sales in this range."
            />
          ) : (
            <DataTable
              columns={companyPurchasesColumns}
              data={purchasesData?.data?.products || []}
              searchColumn="name"
              searchBar={false}
              getRowId={(row) => String(row.product_id)}
              sorting={purchasesSorting}
              onSortingChange={(updater) => {
                setPurchasesSorting((prev) =>
                  typeof updater === "function" ? updater(prev) : updater
                );
                setCurrentPage(0);
              }}
              paginationMeta={purchasesData?.data?.pagination}
              onPageChange={(page) => setCurrentPage(page)}
              currentPage={currentPage}
              emptyState="No product purchases in this range."
            />
          )}
        </CardContent>
      </Card>
    </>
  );
}
