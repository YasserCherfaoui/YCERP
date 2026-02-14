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
  let company = useSelector((state: RootState) => state.company.company);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [discrepanciesOpen, setDiscrepanciesOpen] = useState(false);
  if (pathname.includes("moderator")) {
    company = useSelector((state: RootState) => state.user.company);
  }

  const { data: inventoryData } = useQuery({
    queryKey: ["company-inventory", company?.ID],
    queryFn: () => getCompanyInventory(company?.ID ?? 0),
    enabled: !!company,
  });
  const inventoryId = inventoryData?.data?.ID ?? null;
  const lastLocation = pathname.substring(0, pathname.lastIndexOf("/"));

  if (!company) return null;
  return (
    <div className="flex justify-between">
      <div className="flex gap-4">
        <Button onClick={() => navigate(lastLocation)}>
          <ArrowLeft />
          Back to Menu
        </Button>
        <span className="text-2xl">{company.company_name} &gt; Warehouse</span>
      </div>
      <div className="flex gap-4">
        <Button
          variant="outline"
          size="sm"
          disabled={inventoryId == null}
          onClick={() => setDiscrepanciesOpen(true)}
        >
          <AlertCircle className="mr-2 h-4 w-4" />
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
