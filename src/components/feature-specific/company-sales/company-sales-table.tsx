import { RootState } from "@/app/store";
import { DataTable } from "@/components/ui/data-table";
import { useToast } from "@/hooks/use-toast";
import { getCompanySales } from "@/services/sale-service";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { companySalesColumns } from "./company-sales-columns";

export default function () {
  const company = useSelector((state: RootState) => state.company.company);
  if (!company) return;

  const { data } = useQuery({
    queryKey: ["sales"],
    queryFn: () => getCompanySales(company.ID),
  });
  const { toast } = useToast();

  useEffect(() => {
    toast({
      title: "Sales Loaded",
      description: `Loaded ${data?.data?.length} sales`,
    });
  }, data?.data);

  return (
    <div>
      <DataTable
        data={data?.data ?? []}
        columns={companySalesColumns}
        searchColumn="sale_id"
      />
    </div>
  );
}
