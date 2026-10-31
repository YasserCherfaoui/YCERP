import { RootState } from "@/app/store";
import CrmBackdrop from "@/components/feature-specific/crm/crm-backdrop";
import { liquidGlass, tone } from "@/components/feature-specific/crm/crm-theme";
import { CustomerTableRow, getCustomersColumns } from "@/components/feature-specific/crm/customers-columns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounce } from "@/hooks/use-debounce";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Customer } from "@/models/data/customer.model";
import { deleteCustomersWithZeroOrders, getCustomers, syncCustomers, updateSelectedCustomers } from "@/services/customer-service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { OnChangeFn, SortingState } from "@tanstack/react-table";
import {
  ArrowLeft,
  Loader2,
  MoreHorizontal,
  Package,
  RefreshCcw,
  Search,
  SlidersHorizontal,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import DailyDeliveriesPage from "../deliveries/daily-deliveries-page";

const VIEWS = [
  {
    value: "customers",
    label: "Customers",
    icon: Users,
    selected: "bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-sm",
    idle: "text-indigo-700 hover:bg-indigo-100/70 dark:text-indigo-200 dark:hover:bg-indigo-500/20",
  },
  {
    value: "deliveries",
    label: "Daily deliveries",
    icon: Package,
    selected: "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm",
    idle: "text-emerald-700 hover:bg-emerald-100/70 dark:text-emerald-200 dark:hover:bg-emerald-500/20",
  },
] as const;

const RATE_SEGMENTS = [
  {
    value: "all",
    label: "All",
    min: undefined,
    max: undefined,
    dot: "bg-gradient-to-br from-emerald-400 via-amber-400 to-rose-400",
    idle: "text-foreground/70 hover:bg-background/70",
    selected: "bg-background text-foreground shadow-sm",
  },
  {
    value: "reliable",
    label: "Reliable",
    hint: "≥ 80%",
    min: 80,
    max: undefined,
    dot: "bg-emerald-500",
    idle: "text-emerald-800 hover:bg-emerald-100 dark:text-emerald-200 dark:hover:bg-emerald-500/20",
    selected: "bg-emerald-500 text-white shadow-sm",
  },
  {
    value: "mixed",
    label: "Mixed",
    hint: "50–80%",
    min: 50,
    max: 80,
    dot: "bg-amber-500",
    idle: "text-amber-800 hover:bg-amber-100 dark:text-amber-200 dark:hover:bg-amber-500/20",
    selected: "bg-amber-500 text-white shadow-sm",
  },
  {
    value: "risky",
    label: "Risky",
    hint: "< 50%",
    min: undefined,
    max: 50,
    dot: "bg-rose-500",
    idle: "text-rose-800 hover:bg-rose-100 dark:text-rose-200 dark:hover:bg-rose-500/20",
    selected: "bg-rose-500 text-white shadow-sm",
  },
] as const;

const SORT_LABELS: Record<string, string> = {
  updated_at: "recently synced",
  last_update: "last update",
  created_at: "first seen",
  name: "name",
  phone: "phone",
  email: "email",
  total_orders: "orders",
  delivered_orders: "delivered orders",
  delivery_rate: "delivery rate",
  birthday: "birthday",
};

export default function CustomersPage() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isModerator = pathname.startsWith("/moderator");
  const { companyID } = useParams<{ companyID: string }>();
  const companyFromStore = useSelector((state: RootState) => state.company.company);
  const userCompany = useSelector((state: RootState) => state.user.company);
  const company = isModerator ? userCompany : companyFromStore;
  const companyId = companyID ? parseInt(companyID, 10) : company?.ID;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = searchParams.get("tab") === "deliveries" ? "deliveries" : "customers";

  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const search = searchParams.get("search") || "";
  const minDeliveryRate = searchParams.get("min_delivery_rate") ? parseFloat(searchParams.get("min_delivery_rate")!) : undefined;
  const maxDeliveryRate = searchParams.get("max_delivery_rate") ? parseFloat(searchParams.get("max_delivery_rate")!) : undefined;
  const sortBy = searchParams.get("sort_by") || "updated_at";
  const sortOrder = (searchParams.get("sort_order") as "asc" | "desc") || "desc";

  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  const updateParams = (updates: Record<string, string | number | undefined | null>) => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") {
          newParams.delete(key);
        } else {
          newParams.set(key, String(value));
        }
      });
      return newParams;
    });
  };

  const setPage = (p: number) => updateParams({ page: p });
  const setLimit = (l: number) => updateParams({ limit: l, page: 1 });
  const setSearch = (s: string) => updateParams({ search: s, page: 1 });
  const setRateRange = (min: number | undefined, max: number | undefined) =>
    updateParams({ min_delivery_rate: min, max_delivery_rate: max, page: 1 });
  const setActiveTab = (t: string) => updateParams({ tab: t === "customers" ? undefined : t });

  const sorting: SortingState = [{ id: sortBy, desc: sortOrder === "desc" }];
  const handleSortingChange: OnChangeFn<SortingState> = (updater) => {
    const next = typeof updater === "function" ? updater(sorting) : updater;
    const first = next[0];
    updateParams({
      sort_by: first?.id ?? "updated_at",
      sort_order: first ? (first.desc ? "desc" : "asc") : "desc",
      page: 1,
    });
  };

  const [searchInput, setSearchInput] = useState(search);
  const debouncedSearchInput = useDebounce(searchInput, 300);
  useEffect(() => {
    if (debouncedSearchInput !== search) setSearch(debouncedSearchInput);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchInput]);

  useEffect(() => {
    setSelectedRows([]);
  }, [page]);

  const syncMut = useMutation({
    mutationFn: () => syncCustomers(companyId),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["customers", companyId] });
      toast({
        title: "Sync completed",
        description: `Synced ${(res.data?.synced || 0).toLocaleString()} customers from ${(res.data?.total || 0).toLocaleString()} orders.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Sync failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const { data, isLoading, isFetching, isError, error } = useQuery({
    queryKey: ["customers", companyId, page, limit, search, minDeliveryRate, maxDeliveryRate, sortBy, sortOrder],
    queryFn: () =>
      getCustomers({
        page,
        limit,
        search: search || undefined,
        min_delivery_rate: minDeliveryRate,
        max_delivery_rate: maxDeliveryRate,
        company_id: companyId,
        sort_by: sortBy,
        sort_order: sortOrder,
      }),
    enabled: !!companyId,
    placeholderData: (previous) => previous,
  });

  const updateSelectedMut = useMutation({
    mutationFn: (phones: string[]) => updateSelectedCustomers(phones, companyId),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["customers", companyId] });
      setSelectedRows([]);
      toast({
        title: "Update completed",
        description: `Updated ${res.data?.customers_processed || 0} customers. Synced ${res.data?.orders_synced || 0} orders.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteZeroOrdersMut = useMutation({
    mutationFn: () => deleteCustomersWithZeroOrders(companyId),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["customers", companyId] });
      toast({
        title: "Deletion completed",
        description: `Deleted ${res.data?.deleted || 0} customers with 0 orders.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Deletion failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (isError) {
      toast({
        title: "Error",
        description: (error as Error)?.message || "Failed to load customers",
        variant: "destructive",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isError]);

  const tableData: CustomerTableRow[] =
    data?.data?.customers?.map((item: { customer: Customer; delivery_rate: number }) => ({
      customer: item.customer,
      delivery_rate: item.delivery_rate,
    })) || [];
  const pagination = data?.data?.pagination;
  const totalCustomers = pagination?.total;

  const activeSegment = RATE_SEGMENTS.find(
    (segment) => segment.min === minDeliveryRate && segment.max === maxDeliveryRate
  )?.value;
  const hasCustomRange = !activeSegment;
  const hasFilters = Boolean(search) || minDeliveryRate !== undefined || maxDeliveryRate !== undefined;

  const backTo = isModerator ? "/moderator" : companyId ? `/company/${companyId}` : "/company";

  return (
    <div className="relative isolate min-h-full overflow-hidden">
      <CrmBackdrop />
      <div className="relative mx-auto flex max-w-[1600px] flex-col gap-4 px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <Button type="button" className="shrink-0" onClick={() => navigate(backTo)}>
              <ArrowLeft />
              <span className="sm:hidden">Back</span>
              <span className="hidden sm:inline">Back to Menu</span>
            </Button>
            <div className="min-w-0 space-y-1">
              {company?.company_name && (
                <p className="text-xs font-medium text-muted-foreground">{company.company_name}</p>
              )}
              <h1 className="truncate bg-gradient-to-r from-indigo-600 via-violet-600 to-rose-500 bg-clip-text text-2xl font-semibold tracking-tight text-transparent dark:from-indigo-300 dark:via-violet-300 dark:to-rose-300 sm:text-3xl">
                CRM
              </h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div role="tablist" aria-label="CRM view" className={cn("inline-flex rounded-xl p-1", liquidGlass)}>
              {VIEWS.map((view) => {
                const Icon = view.icon;
                const selected = activeTab === view.value;
                return (
                  <button
                    key={view.value}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    onClick={() => setActiveTab(view.value)}
                    className={cn(
                      "inline-flex min-h-9 cursor-pointer items-center gap-2 rounded-lg px-3 text-sm font-medium motion-safe:transition-colors",
                      selected ? view.selected : view.idle
                    )}
                  >
                    <Icon className="size-4" />
                    {view.label}
                    {view.value === "customers" && totalCustomers != null && (
                      <span
                        className={cn(
                          "rounded-md px-1.5 text-xs tabular-nums",
                          selected ? "bg-white/25 text-white" : "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-100"
                        )}
                      >
                        {totalCustomers.toLocaleString()}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" type="button" size="icon" className="bg-background" aria-label="More actions">
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  disabled={deleteZeroOrdersMut.isPending}
                  onSelect={() => {
                    if (window.confirm("Are you sure you want to delete all customers with 0 orders? This action cannot be undone.")) {
                      deleteZeroOrdersMut.mutate();
                    }
                  }}
                >
                  <Trash2 />
                  {deleteZeroOrdersMut.isPending ? "Deleting…" : "Delete customers with 0 orders"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              type="button"
              className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20 hover:from-indigo-500 hover:to-violet-500"
              disabled={syncMut.isPending}
              onClick={() => syncMut.mutate()}
            >
              {syncMut.isPending ? <Loader2 className="animate-spin" /> : <RefreshCcw />}
              {syncMut.isPending ? "Syncing…" : "Sync customers"}
            </Button>
          </div>
        </header>

        {activeTab === "deliveries" ? (
          <DailyDeliveriesPage />
        ) : (
          <Card className={cn("overflow-hidden", liquidGlass)}>
            <div className="flex flex-col gap-2 p-3 sm:p-4 lg:flex-row lg:items-center" aria-label="Filters">
              <div className="relative min-w-[14rem] flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-indigo-500 dark:text-indigo-300" />
                <Input
                  aria-label="Search customers"
                  placeholder="Search phone, name or email"
                  autoComplete="off"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="h-9 border-indigo-200/80 bg-white/70 pl-9 pr-8 backdrop-blur-md focus-visible:ring-indigo-400 dark:border-indigo-400/30 dark:bg-white/10"
                />
                {searchInput && (
                  <button
                    type="button"
                    aria-label="Clear search"
                    onClick={() => setSearchInput("")}
                    className="absolute right-2 top-1/2 flex size-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-muted-foreground hover:bg-accent"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div role="group" aria-label="Delivery rate" className="inline-flex flex-wrap gap-0.5 rounded-lg bg-white/60 p-0.5 ring-1 ring-black/5 dark:bg-white/5 dark:ring-white/10">
                  {RATE_SEGMENTS.map((segment) => {
                    const selected = activeSegment === segment.value;
                    return (
                      <button
                        key={segment.value}
                        type="button"
                        aria-pressed={selected}
                        title={"hint" in segment ? `Delivery rate ${segment.hint}` : "Any delivery rate"}
                        onClick={() => setRateRange(segment.min, segment.max)}
                        className={cn(
                          "inline-flex min-h-8 cursor-pointer items-center gap-1.5 rounded-md px-2.5 text-xs font-medium motion-safe:transition-colors",
                          selected ? segment.selected : segment.idle
                        )}
                      >
                        <span className={cn("size-2 rounded-full", segment.dot, selected && segment.value !== "all" && "bg-white")} aria-hidden />
                        {segment.label}
                      </button>
                    );
                  })}
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className={cn("h-9", hasCustomRange ? "border-violet-500 bg-violet-500 text-white hover:bg-violet-600 hover:text-white" : tone.violet)}
                    >
                      <SlidersHorizontal />
                      {hasCustomRange
                        ? `${minDeliveryRate ?? 0}–${maxDeliveryRate ?? 100}%`
                        : "Range"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="end" className="w-64 space-y-3">
                    <p className="text-sm font-medium">Delivery rate range</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1.5">
                        <Label htmlFor="crm-min-rate" className="text-xs">Min %</Label>
                        <Input
                          id="crm-min-rate"
                          type="number"
                          inputMode="decimal"
                          min={0}
                          max={100}
                          placeholder="0"
                          value={minDeliveryRate ?? ""}
                          onChange={(e) => setRateRange(e.target.value ? parseFloat(e.target.value) : undefined, maxDeliveryRate)}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="crm-max-rate" className="text-xs">Max %</Label>
                        <Input
                          id="crm-max-rate"
                          type="number"
                          inputMode="decimal"
                          min={0}
                          max={100}
                          placeholder="100"
                          value={maxDeliveryRate ?? ""}
                          onChange={(e) => setRateRange(minDeliveryRate, e.target.value ? parseFloat(e.target.value) : undefined)}
                        />
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                {hasFilters && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-9"
                    onClick={() => {
                      setSearchInput("");
                      updateParams({ search: undefined, min_delivery_rate: undefined, max_delivery_rate: undefined, page: 1 });
                    }}
                  >
                    <X />
                    Clear
                  </Button>
                )}
              </div>
            </div>
            <Separator />
            <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 space-y-0 px-3 py-2.5 sm:px-4">
              {selectedRows.length > 0 ? (
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="border-transparent bg-gradient-to-r from-indigo-500 to-violet-500 tabular-nums text-white">
                    {selectedRows.length} selected
                  </Badge>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className={tone.violet}
                    disabled={updateSelectedMut.isPending}
                    onClick={() => updateSelectedMut.mutate(selectedRows)}
                  >
                    {updateSelectedMut.isPending ? <Loader2 className="animate-spin" /> : <RefreshCcw />}
                    Refresh stats
                  </Button>
                  <Button type="button" size="sm" variant="ghost" onClick={() => setSelectedRows([])}>
                    Clear selection
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="flex size-7 items-center justify-center rounded-lg bg-indigo-200/80 text-indigo-800 dark:bg-indigo-400/20 dark:text-indigo-100">
                    <Users className="size-4" />
                  </span>
                  <CardTitle className="text-base">Customers</CardTitle>
                  <CardDescription className="flex items-center gap-1.5">
                    {totalCustomers != null
                      ? `${totalCustomers.toLocaleString()} · sorted by ${SORT_LABELS[sortBy] ?? sortBy}, ${sortOrder === "desc" ? "high to low" : "low to high"}`
                      : "Loading…"}
                    {isFetching && !isLoading && <Loader2 className="size-3.5 animate-spin text-indigo-500" aria-label="Updating" />}
                  </CardDescription>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Rows</span>
                <Select value={String(limit)} onValueChange={(value) => setLimit(Number(value))}>
                  <SelectTrigger className="h-8 w-[4.5rem] bg-background" aria-label="Rows per page">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <Separator />
            <CardContent className={cn("p-2 sm:p-3 motion-safe:transition-opacity", isFetching && !isLoading && "opacity-60")}>
              {isLoading ? (
                <div className="space-y-2" aria-busy="true" aria-live="polite">
                  {Array.from({ length: 8 }).map((_, index) => (
                    <Skeleton key={index} className="h-14 w-full rounded-xl" />
                  ))}
                </div>
              ) : (
                <DataTable
                  columns={getCustomersColumns(companyID)}
                  data={tableData}
                  searchColumn="phone"
                  searchBar={false}
                  sorting={sorting}
                  onSortingChange={handleSortingChange}
                  paginationMeta={
                    pagination
                      ? {
                          total_items: pagination.total,
                          per_page: pagination.limit,
                          current_page: pagination.page,
                          total_pages: pagination.total_pages || Math.ceil(pagination.total / pagination.limit),
                        }
                      : undefined
                  }
                  onPageChange={(newPage) => setPage(newPage + 1)}
                  currentPage={page - 1}
                  selectedRows={selectedRows}
                  setSelectedRows={setSelectedRows}
                  getRowId={(row) => row.customer.phone}
                  emptyState={hasFilters ? "No customers match these filters." : "No customers yet. Sync customers to build the list from orders."}
                  showSelectionSummary={false}
                />
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
