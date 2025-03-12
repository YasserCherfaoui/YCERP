import { RootState } from "@/app/store";
import { getSuppliers } from "@/services/supplier-service";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import SupplierCard from "./supplier-card";

export default function () {
  const company = useSelector((state: RootState) => state.company.company);
  if (!company) return;
  const { data: suppliers } = useQuery({
    queryKey: ["suppliers"],
    queryFn: () => getSuppliers(company.ID),
  });
  return (
    <div className="flex gap-2  w-[1000px] flex-wrap">
      {suppliers?.data?.map((supplier, idx) => (
        <SupplierCard key={idx} supplier={supplier} />
      ))}
    </div>
  );
}
