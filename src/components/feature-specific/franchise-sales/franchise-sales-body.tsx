import { RootState } from "@/app/store";
import { companySalesColumns } from "@/components/feature-specific/company-sales/company-sales-columns";
import { DataTable } from "@/components/ui/data-table";
import { useToast } from "@/hooks/use-toast";
import { getFranchiseSales } from "@/services/franchise-service";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useSelector } from "react-redux";


export default function () {
  const franchise = useSelector((state: RootState) => state.franchise.franchise);
  if (!franchise) return;

  const { data } = useQuery({
    queryKey: ["sales"],
    queryFn: () => getFranchiseSales(franchise.ID),
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
        data={
          data?.data?.sort(
            (a, b) =>
              new Date(b.CreatedAt).getTime() - new Date(a.CreatedAt).getTime()
          ) ?? []
        }
        columns={companySalesColumns}
        searchColumn="sale_id"
      />
    </div>
  );
}
