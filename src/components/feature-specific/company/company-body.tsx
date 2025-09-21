import { getMyCompanies } from "@/services/company-service";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense } from "react";
import CompanyCard from "./company-card";

export default function () {
  const {
    data: { data: companies },
  } = useSuspenseQuery({
    queryKey: ["companies"],
    queryFn: getMyCompanies,
  });
  return (
    <div className="flex flex-col gap-4">
      <span className="text-xl">My Companies</span>
      <Suspense fallback={<p>Loading...</p>}>
        <div className="flex gap-2">
          {companies?.map((company, index) => (
            <CompanyCard key={company.ID} company={company} index={index} />
          ))}
        </div>
      </Suspense>
    </div>
  );
}
