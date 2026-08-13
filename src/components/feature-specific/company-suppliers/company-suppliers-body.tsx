import { RootState } from "@/app/store";
import { getSuppliers } from "@/services/supplier-service";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import SupplierCard from "./supplier-card";

export default function () {
  let company = useSelector((state: RootState) => state.company.company);
  const { pathname } = useLocation();
  if (pathname.includes("moderator")) {
    company = useSelector((state: RootState) => state.user.company);
  }
  if (!company) return;
  const { data: suppliers } = useQuery({
    queryKey: ["suppliers"],
    queryFn: () => getSuppliers(company.ID),
  });
  return (
    <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {suppliers?.data?.map((supplier) => (
        <SupplierCard key={supplier.ID} supplier={supplier} />
      ))}
    </div>
  );
}
