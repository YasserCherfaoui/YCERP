import { RootState } from "@/app/store";
import { Button } from "@/components/ui/button";
import InventoryDiscrepanciesDialog from "@/components/feature-specific/inventory-discrepancies-dialog";
import { getCompanyInventory } from "@/services/inventory-service";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import AddInventoryItemForm from "./add-inventory-item-form";

interface Props {
  setSelectedRow: Dispatch<SetStateAction<number | null>>;
  selectedRow: number | null;
}
export default function ({ selectedRow }: Props) {
  const companyFromStore = useSelector((state: RootState) => state.company.company);
  const userCompany = useSelector((state: RootState) => state.user.company);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [discrepanciesOpen, setDiscrepanciesOpen] = useState(false);
  const isModerator = pathname.includes("moderator");
  const company = isModerator ? userCompany : companyFromStore;

  const { data: inventoryData } = useQuery({
    queryKey: ["company-inventory", company?.ID],
    queryFn: () => getCompanyInventory(company?.ID ?? 0),
    enabled: !!company,
  });
  const inventoryId = inventoryData?.data?.ID ?? null;
  const lastLocation = pathname.substring(0, pathname.lastIndexOf("/"));

  if (!company) return null;
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
        <Button className="w-fit shrink-0" onClick={() => navigate(lastLocation)}>
          <ArrowLeft />
          <span className="sm:hidden">Back</span>
          <span className="hidden sm:inline">Back to Menu</span>
        </Button>
        <span className="truncate text-lg sm:text-2xl">{company.company_name} &gt; Warehouse</span>
      </div>
      <div className="flex flex-wrap gap-2 sm:gap-4">
        <Button
          variant="outline"
          size="sm"
          disabled={inventoryId == null}
          onClick={() => setDiscrepanciesOpen(true)}
        >
          <AlertCircle className="h-4 w-4 sm:mr-2" />
          Discrepancies
        </Button>
        <AddInventoryItemForm disabled={selectedRow == null} />
      </div>
      <InventoryDiscrepanciesDialog
        open={discrepanciesOpen}
        onOpenChange={setDiscrepanciesOpen}
        inventoryId={inventoryId}
      />
    </div>
  );
}
