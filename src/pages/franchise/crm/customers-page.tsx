import { RootState } from "@/app/store";
import CrmBackdrop from "@/components/feature-specific/crm/crm-backdrop";
import { liquidGlass, tone } from "@/components/feature-specific/crm/crm-theme";
import { CustomerTableRow, getCustomersColumns } from "@/components/feature-specific/crm/customers-columns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
import { createFranchiseCustomer, getFranchiseCustomers, syncFranchiseCustomers } from "@/services/customer-service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { OnChangeFn, SortingState } from "@tanstack/react-table";
import {
  ArrowLeft,
  Loader2,
  RefreshCcw,
  Search,
  SlidersHorizontal,
  Store,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

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

const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: "updated_at", label: "recently synced" },
  { value: "sales_count", label: "store sales" },
  { value: "total_orders", label: "orders" },
  { value: "delivered_orders", label: "delivered orders" },
  { value: "delivery_rate", label: "delivery rate" },
  { value: "created_at", label: "first seen" },
  { value: "last_update", label: "last update" },
  { value: "name", label: "name" },
  { value: "phone", label: "phone" },
  { value: "email", label: "email" },
  { value: "birthday", label: "birthday" },
];

const EMPTY_CUSTOMER = { phone: "", first_name: "", last_name: "", email: "", birthday: "" };

export default function FranchiseCustomersPage() {
  const navigate = useNavigate();
  const franchise = useSelector((state: RootState) => state.franchise.franchise);
  const franchiseIdNum = franchise?.ID;
  const companyId = franchise?.company_id;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [searchInput, setSearchInput] = useState("");
  const search = useDebounce(searchInput, 300);
  const [minDeliveryRate, setMinDeliveryRate] = useState<number | undefined>();
  const [maxDeliveryRate, setMaxDeliveryRate] = useState<number | undefined>();
  const [sortBy, setSortBy] = useState<string>("updated_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const sorting: SortingState = [{ id: sortBy, desc: sortOrder === "desc" }];
  const handleSortingChange: OnChangeFn<SortingState> = (updater) => {
    const next = typeof updater === "function" ? updater(sorting) : updater;
    const first = next[0];
    setSortBy(first?.id ?? "updated_at");
    setSortOrder(first ? (first.desc ? "desc" : "asc") : "desc");
  };
  const setRateRange = (min: number | undefined, max: number | undefined) => {
    setMinDeliveryRate(min);
    setMaxDeliveryRate(max);
  };
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState(EMPTY_CUSTOMER);

  useEffect(() => {
    setPage(1);
  }, [search, minDeliveryRate, maxDeliveryRate, limit, sortBy, sortOrder]);

  const queryKeyBase = ["franchise-customers", franchiseIdNum, companyId];

  const syncMut = useMutation({
    mutationFn: () => syncFranchiseCustomers(franchiseIdNum!, companyId),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: queryKeyBase });
      toast({
        title: "Sync completed",
        description: `Synced ${(res.data?.synced || 0).toLocaleString()} customers from store sales.`,
      });
    },
    onError: (error: Error) => {
      toast({ title: "Sync failed", description: error.message, variant: "destructive" });
    },
  });

  const createMut = useMutation({
    mutationFn: () =>
      createFranchiseCustomer(
        franchiseIdNum!,
        {
          phone: newCustomer.phone,
          first_name: newCustomer.first_name,
          last_name: newCustomer.last_name,
          email: newCustomer.email,
          birthday: newCustomer.birthday || undefined,
        },
        companyId
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeyBase });
      setCreateDialogOpen(false);
      setNewCustomer(EMPTY_CUSTOMER);
      toast({ title: "Customer created", description: "The customer was added to your franchise." });
    },
    onError: (error: Error) => {
      toast({ title: "Create failed", description: error.message, variant: "destructive" });
    },
  });

  const { data, isLoading, isFetching, isError, error } = useQuery({
    queryKey: [...queryKeyBase, page, limit, search, minDeliveryRate, maxDeliveryRate, sortBy, sortOrder],
    queryFn: () =>
      getFranchiseCustomers(franchiseIdNum!, {
        page,
        limit,
        search: search || undefined,
        min_delivery_rate: minDeliveryRate,
        max_delivery_rate: maxDeliveryRate,
        company_id: companyId,
        sort_by: sortBy,
        sort_order: sortOrder,
      }),
    enabled: !!franchiseIdNum,
    placeholderData: (previous) => previous,
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

  if (!franchise) {
    return <div className="container mx-auto p-6">Franchise not found</div>;
  }

  const tableData: CustomerTableRow[] =
    data?.data?.customers?.map((item: { customer: Customer; delivery_rate: number; sales_count?: number }) => ({
      customer: item.customer,
      delivery_rate: item.delivery_rate,
      sales_count: item.sales_count,
    })) || [];
  const pagination = data?.data?.pagination;
  const totalCustomers = pagination?.total;

  const activeSegment = RATE_SEGMENTS.find(
    (segment) => segment.min === minDeliveryRate && segment.max === maxDeliveryRate
  )?.value;
  const hasCustomRange = !activeSegment;
  const hasFilters = Boolean(searchInput) || minDeliveryRate !== undefined || maxDeliveryRate !== undefined;
  const sortLabel = SORT_OPTIONS.find((option) => option.value === sortBy)?.label ?? sortBy;

  return (
    <div className="relative isolate min-h-full overflow-hidden">
      <CrmBackdrop />
      <div className="relative mx-auto flex max-w-[1600px] flex-col gap-4 px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <Button type="button" className="shrink-0" onClick={() => navigate("/myFranchise")}>
              <ArrowLeft />
              <span className="sm:hidden">Back</span>
              <span className="hidden sm:inline">Back to Menu</span>
            </Button>
            <div className="min-w-0 space-y-1">
              {franchise.name && (
                <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Store className="size-3.5 text-sky-600 dark:text-sky-300" />
                  {franchise.name}
                </p>
              )}
              <h1 className="truncate bg-gradient-to-r from-sky-600 via-indigo-600 to-violet-600 bg-clip-text text-2xl font-semibold tracking-tight text-transparent dark:from-sky-300 dark:via-indigo-300 dark:to-violet-300 sm:text-3xl">
                Franchise CRM
              </h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {totalCustomers != null && (
              <span className={cn("inline-flex min-h-9 items-center gap-2 rounded-xl px-3 text-sm font-medium", liquidGlass)}>
                <Users className="size-4 text-indigo-600 dark:text-indigo-300" />
                Customers
                <span className="rounded-md bg-indigo-100 px-1.5 text-xs tabular-nums text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-100">
                  {totalCustomers.toLocaleString()}
                </span>
              </span>
            )}
            <Button type="button" variant="outline" className={tone.violet} onClick={() => setCreateDialogOpen(true)}>
              <UserPlus />
              New customer
            </Button>
            <Button
              type="button"
              className="bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-md shadow-sky-500/20 hover:from-sky-500 hover:to-indigo-500"
              disabled={syncMut.isPending || !franchiseIdNum}
              onClick={() => syncMut.mutate()}
            >
              {syncMut.isPending ? <Loader2 className="animate-spin" /> : <RefreshCcw />}
              {syncMut.isPending ? "Syncing…" : "Sync from sales"}
            </Button>
          </div>
        </header>

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
                    {hasCustomRange ? `${minDeliveryRate ?? 0}–${maxDeliveryRate ?? 100}%` : "Range"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-64 space-y-3">
                  <p className="text-sm font-medium">Delivery rate range</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="franchise-crm-min-rate" className="text-xs">Min %</Label>
                      <Input
                        id="franchise-crm-min-rate"
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
                      <Label htmlFor="franchise-crm-max-rate" className="text-xs">Max %</Label>
                      <Input
                        id="franchise-crm-max-rate"
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
                    setRateRange(undefined, undefined);
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
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-sky-200/80 text-sky-800 dark:bg-sky-400/20 dark:text-sky-100">
                <Users className="size-4" />
              </span>
              <CardTitle className="text-base">Customers</CardTitle>
              <CardDescription className="flex items-center gap-1.5">
                {totalCustomers != null
                  ? `${totalCustomers.toLocaleString()} · sorted by ${sortLabel}, ${sortOrder === "desc" ? "high to low" : "low to high"}`
                  : "Loading…"}
                {isFetching && !isLoading && <Loader2 className="size-3.5 animate-spin text-indigo-500" aria-label="Updating" />}
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground">Sort</span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-8 w-[10.5rem] bg-background" aria-label="Sort by">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label.charAt(0).toUpperCase() + option.label.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as "asc" | "desc")}>
                <SelectTrigger className="h-8 w-[8.5rem] bg-background" aria-label="Sort order">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">High to low</SelectItem>
                  <SelectItem value="asc">Low to high</SelectItem>
                </SelectContent>
              </Select>
              <span className="ml-1 text-xs text-muted-foreground">Rows</span>
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
                columns={getCustomersColumns(companyId?.toString(), franchiseIdNum?.toString())}
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
                getRowId={(row) => row.customer.phone}
                emptyState={hasFilters ? "No customers match these filters." : "No customers yet. Sync from sales to build the list."}
                showSelectionSummary={false}
              />
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog
        open={createDialogOpen}
        onOpenChange={(open) => {
          setCreateDialogOpen(open);
          if (!open) setNewCustomer(EMPTY_CUSTOMER);
        }}
      >
        <DialogContent className={cn("flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-md sm:p-0", liquidGlass, "bg-white/85 dark:bg-slate-950/85")}>
          <DialogHeader className="border-b border-white/40 bg-gradient-to-r from-violet-100/80 via-indigo-100/60 to-sky-100/60 px-5 py-4 pr-12 text-left dark:border-white/10 dark:from-violet-500/20 dark:via-indigo-500/10 dark:to-sky-500/10">
            <div className="flex items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 text-white shadow-md shadow-violet-500/25">
                <UserPlus className="size-5" />
              </span>
              <div className="min-w-0 space-y-0.5">
                <DialogTitle>New customer</DialogTitle>
                <DialogDescription>Add a customer to {franchise.name || "your franchise"}.</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <form
            className="flex min-h-0 flex-1 flex-col"
            onSubmit={(e) => {
              e.preventDefault();
              if (newCustomer.phone) createMut.mutate();
            }}
          >
            <div className="grid gap-3 overflow-y-auto p-5 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="new-customer-phone">Phone *</Label>
                <Input
                  id="new-customer-phone"
                  inputMode="tel"
                  autoComplete="off"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                  placeholder="0555 12 34 56"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="new-customer-first-name">First name</Label>
                <Input
                  id="new-customer-first-name"
                  value={newCustomer.first_name}
                  onChange={(e) => setNewCustomer({ ...newCustomer, first_name: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="new-customer-last-name">Last name</Label>
                <Input
                  id="new-customer-last-name"
                  value={newCustomer.last_name}
                  onChange={(e) => setNewCustomer({ ...newCustomer, last_name: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="new-customer-email">Email</Label>
                <Input
                  id="new-customer-email"
                  type="email"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="new-customer-birthday">Birthday</Label>
                <Input
                  id="new-customer-birthday"
                  type="date"
                  value={newCustomer.birthday}
                  onChange={(e) => setNewCustomer({ ...newCustomer, birthday: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter className="border-t border-white/40 px-5 py-3 dark:border-white/10">
              <Button type="button" variant="ghost" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMut.isPending || !newCustomer.phone}
                className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/20 hover:from-violet-500 hover:to-indigo-500"
              >
                {createMut.isPending ? <Loader2 className="animate-spin" /> : <UserPlus />}
                {createMut.isPending ? "Creating…" : "Create customer"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
