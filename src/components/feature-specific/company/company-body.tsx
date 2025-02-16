import { RootState } from "@/app/store";
import { useSelector } from "react-redux";
import CompanyCard from "./company-card";

export default function () {
  const currentUser = useSelector((state: RootState) => state.auth.user);
  return (
    <div className="flex flex-col gap-4">
      <span className="text-xl">My Companies</span>
      <div className="flex gap-2">
        {currentUser?.companies.map((company, index) => (
          <CompanyCard company={company} index={index} />
        ))}
      </div>
    </div>
  );
}
