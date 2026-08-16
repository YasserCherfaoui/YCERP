import { RootState } from "@/app/store";
import { ExitBillDisplayStatus } from "@/components/feature-specific/bills/exit-bill-status-badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { PaginationMeta } from "@/models/responses/company-stats.model";
import { getCompanyExitBills } from "@/services/bill-service";
import { getMyCompanyFranchises } from "@/services/franchise-service";
import { useQuery } from "@tanstack/react-query";
import { endOfDay, startOfDay } from "date-fns";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { companyBillColumns } from "./company-bills-columns";

const PAGE_SIZE = 10;

const STATUS_OPTIONS: { value: "all" | ExitBillDisplayStatus; label: string }[] =
  [
    { value: "all", label: "All statuses" },
    { value: "pending", label: "Pending" },
    { value: "preparing", label: "Preparing" },
    { value: "prepared", label: "Prepared" },
    { value: "acquired", label: "Acquired" },
  ];

export default function () {
  const companyFromStore = useSelector(
    (state: RootState) => state.company.company
  );
  const userCompany = useSelector((state: RootState) => state.user.company);
  const { pathname } = useLocation();
  const company = pathname.includes("moderator")
    ? userCompany
    : companyFromStore;

  const [franchiseId, setFranchiseId] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const next = searchValue.trim();
      if (next === debouncedSearch) return;
      setDebouncedSearch(next);
      setCurrentPage(0);
    }, 400);
    return () => window.clearTimeout(timeout);
  }, [searchValue, debouncedSearch]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: [
      "exit_bills",
      company?.ID,
      currentPage,
      PAGE_SIZE,
      franchiseId,
      status,
      dateRange?.from?.toISOString(),
      dateRange?.to?.toISOString(),
      debouncedSearch,
    ],
    queryFn: () =>
      getCompanyExitBills(company!.ID, {
        page: currentPage + 1,
        limit: PAGE_SIZE,
        franchise_id:
          franchiseId !== "all" ? Number(franchiseId) : undefined,
        status: status !== "all" ? status : undefined,
        start_date: dateRange?.from
          ? startOfDay(dateRange.from).toISOString()
          : undefined,
        end_date: dateRange?.from
          ? endOfDay(dateRange.to ?? dateRange.from).toISOString()
          : undefined,
        search: debouncedSearch || undefined,
      }),
    enabled: !!company,
    placeholderData: (previousData) => previousData,
  });

  const { data: franchisesData, isLoading: franchisesLoading } = useQuery({
    queryKey: ["company-franchises", company?.ID],
    queryFn: () => getMyCompanyFranchises(company!.ID),
    enabled: !!company,
  });

  const bills = data?.data?.bills ?? [];
  const pagination = data?.data?.pagination;
  const franchises = franchisesData?.data ?? [];

  const paginationMeta: PaginationMeta | undefined = pagination
    ? {
        total_items: pagination.total,
        total_pages: pagination.total_pages,
        current_page: pagination.page,
        per_page: pagination.limit,
      }
    : undefined;

  const filtersActive =
    franchiseId !== "all" ||
    status !== "all" ||
    Boolean(dateRange?.from) ||
    Boolean(debouncedSearch);

  const clearFilters = () => {
    setFranchiseId("all");
    setStatus("all");
    setDateRange(undefined);
    setSearchValue("");
    setDebouncedSearch("");
    setCurrentPage(0);
  };

  if (!company) return null;

  if (isLoading && !data) {
    return (
      <div
        className="flex flex-1 flex-col gap-3"
        aria-busy="true"
        aria-label="Loading bills"
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-20 w-full xl:col-span-2" />
        </div>
        <Skeleton className="h-14 w-full" />
        <Skeleton className="min-h-64 w-full flex-1 rounded-md" />
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="space-y-1.5">
          <Label htmlFor="bills-franchise-filter">Franchise</Label>
          <Select
            value={franchiseId}
            onValueChange={(value) => {
              setFranchiseId(value);
              setCurrentPage(0);
            }}
            disabled={franchisesLoading}
          >
            <SelectTrigger id="bills-franchise-filter" className="w-full">
              <SelectValue
                placeholder={franchisesLoading ? "Loading..." : "All franchises"}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All franchises</SelectItem>
              {franchises.map((franchise) => (
                <SelectItem key={franchise.ID} value={franchise.ID.toString()}>
                  {franchise.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="bills-status-filter">Status</Label>
          <Select
            value={status}
            onValueChange={(value) => {
              setStatus(value);
              setCurrentPage(0);
            }}
          >
            <SelectTrigger id="bills-status-filter" className="w-full">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="date">Date</Label>
          <DatePickerWithRange
            date={dateRange}
            onSelect={(range) => {
              setDateRange(range);
              setCurrentPage(0);
            }}
          />
        </div>
      </div>

      {filtersActive ? (
        <div className="flex flex-wrap items-center gap-2 pt-3">
          <p className="text-sm text-muted-foreground">
            {pagination?.total ?? 0} matching bills
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="min-h-11 sm:min-h-9"
            onClick={clearFilters}
          >
            <X className="mr-1 h-4 w-4" aria-hidden />
            Clear filters
          </Button>
        </div>
      ) : null}

      <div
        className={isFetching && data ? "min-h-0 flex-1 opacity-70" : "min-h-0 flex-1"}
        aria-busy={isFetching}
      >
        <DataTable
          searchColumn="bill_number"
          searchPlaceholder="Search bill number..."
          columns={companyBillColumns}
          data={bills}
          paginationMeta={paginationMeta}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          searchValue={searchValue}
          onSearchChange={setSearchValue}
        />
      </div>
    </div>
  );
}
