import { RootState } from "@/app/store";
import { DataTable } from "@/components/ui/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { getCompanyExitBills } from "@/services/bill-service";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { companyBillColumns } from "./company-bills-columns";

export default function () {
  const companyFromStore = useSelector(
    (state: RootState) => state.company.company
  );
  const userCompany = useSelector((state: RootState) => state.user.company);
  const { pathname } = useLocation();
  const company = pathname.includes("moderator")
    ? userCompany
    : companyFromStore;

  const { data, isLoading } = useQuery({
    queryKey: ["exit_bills", company?.ID],
    queryFn: () => getCompanyExitBills(company!.ID),
    enabled: !!company,
  });

  if (!company) return null;

  if (isLoading) {
    return (
      <div
        className="flex flex-1 flex-col gap-3"
        aria-busy="true"
        aria-label="Loading bills"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Skeleton className="h-11 w-full max-w-sm" />
          <Skeleton className="h-11 w-24 sm:ml-auto" />
        </div>
        <Skeleton className="h-14 w-full" />
        <Skeleton className="min-h-64 w-full flex-1 rounded-md" />
      </div>
    );
  }

  return (
    <DataTable
      searchColumn="franchise_name"
      searchPlaceholder="Filter by franchise..."
      columns={companyBillColumns}
      data={data?.data ?? []}
    />
  );
}
