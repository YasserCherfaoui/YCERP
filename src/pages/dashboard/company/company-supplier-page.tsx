import CompanySupplierBillsTable from "@/components/feature-specific/company-supplier/company-supplier-bills-table";
import SupplierAppBar from "@/components/feature-specific/company-supplier/supplier-app-bar";
import { getSupplier } from "@/services/supplier-service";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";

export default function () {
  const { supplierID } = useParams();
  const { data } = useQuery({
    queryKey: ["supplier"],
    queryFn: () => getSupplier(parseInt(supplierID ?? "0")),
  });
  return (
    <div className="p-4">
      {data?.data != null ? <SupplierAppBar supplier={data?.data} /> : <></>}
      <CompanySupplierBillsTable />
    </div>
  );
}
