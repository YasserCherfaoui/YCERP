import { RootState } from "@/app/store";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { getMyCompanyFranchises } from "@/services/franchise-service";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

interface FranchiseFilterProps {
  selectedFranchiseId?: number;
  onFranchiseChange: (franchiseId: number | undefined) => void;
  companyId: number;
}

export default function FranchiseFilter({ 
  selectedFranchiseId, 
  onFranchiseChange, 
  companyId 
}: FranchiseFilterProps) {
  let company = useSelector((state: RootState) => state.company.company);
  const { pathname } = useLocation();
  if (pathname.includes("moderator")) {
    company = useSelector((state: RootState) => state.user.company);
  }

  const { data: franchisesData, isLoading } = useQuery({
    queryKey: ["company-franchises", companyId],
    queryFn: () => getMyCompanyFranchises(companyId),
    enabled: !!companyId,
  });

  const franchises = franchisesData?.data || [];

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Filter by Franchise:</span>
        <Select
          value={selectedFranchiseId?.toString() || "all"}
          onValueChange={(value) => {
            if (value === "all") {
              onFranchiseChange(undefined);
            } else {
              onFranchiseChange(Number(value));
            }
          }}
          disabled={isLoading}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder={isLoading ? "Loading..." : "Select franchise"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Franchises</SelectItem>
            {franchises.map((franchise) => (
              <SelectItem key={franchise.ID} value={franchise.ID.toString()}>
                {franchise.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {selectedFranchiseId && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onFranchiseChange(undefined)}
        >
          Clear Filter
        </Button>
      )}
    </div>
  );
}
