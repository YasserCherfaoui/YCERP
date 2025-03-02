import { RootState } from "@/app/store";
import { getMyCompanyFranchises } from "@/services/franchise-service";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import FranchiseCard from "./franchise-card";

export default function () {
  const company = useSelector((state: RootState) => state.company.company);
  const { data } = useQuery({
    enabled: !!company,
    queryKey: ["franchises"],
    queryFn: () => getMyCompanyFranchises(company?.ID ?? 0),
  });

  return (
    <div className="flex gap-2 p-4">
      {data?.data?.map((franchise, index) => (
        <FranchiseCard key={index} franchise={franchise} />
      ))}
    </div>
  );
}
