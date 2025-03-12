import { DataTable } from "@/components/ui/data-table";
import { getSupplierBills } from "@/services/supplier-service";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { supplierBillsColumns } from "./company-supplier-bills-columns";

export default function () {
  const { supplierID } = useParams();
  const { data } = useQuery({
    queryKey: ["supplier-bills"],
    queryFn: () => getSupplierBills(parseInt(supplierID ?? "0")),
    enabled: !!supplierID,
  });
  return (
    <div>
      <DataTable searchColumn="supplier_bill_id" columns={supplierBillsColumns} data={data?.data ?? []} />
    </div>
  );
}
