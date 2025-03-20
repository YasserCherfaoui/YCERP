import { RootState } from "@/app/store";
import { companyUnknownReturnsColumns } from "@/components/feature-specific/company-unknown-returns/company-unknown-returns-columns";
import { DataTable } from "@/components/ui/data-table";
import { getCompanyUnknownReturns } from "@/services/return-service";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";

export default function () {
  const company = useSelector((state: RootState) => state.company.company);
  const { data } = useQuery({
    queryKey: ["company-unknown-returns"],
    queryFn: () => getCompanyUnknownReturns(company?.ID ?? 0),
  });
  return (
    <div>
      <DataTable
        searchColumn="id"
        data={data?.data ?? []}
        columns={companyUnknownReturnsColumns}
      />
    </div>
  );
}
