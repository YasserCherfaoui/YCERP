import { RootState } from "@/app/store";
import { DataTable } from "@/components/ui/data-table";
import { getCompanyExitBills } from "@/services/bill-service";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { companyBillColumns } from "./company-bills-columns";

export default function () {
  const company = useSelector((state: RootState) => state.company.company);
  if (!company) return;
  const {data} = useQuery({
    queryKey: ["exit_bills"],
    queryFn: () => getCompanyExitBills(company.ID),
  });
  return <div>
    <DataTable searchColumn="franchise_name" columns={companyBillColumns} data={data?.data ?? []} />
  </div>;
}
