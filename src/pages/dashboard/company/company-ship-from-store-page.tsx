import { RootState } from "@/app/store";
import AppBarBackButton from "@/components/common/app-bar-back-button";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { listShipFromStoreAdmin } from "@/services/ship-from-store-service";
import { getMyCompanyFranchises } from "@/services/franchise-service";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Package } from "lucide-react";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { ShipFromStore } from "@/models/data/ship-from-store.model";
import { createCompanyShipFromStoreColumns } from "@/components/feature-specific/ship-from-store/company-ship-from-store-columns";
import { CompanyShipFromStoreCreateDialog } from "@/components/feature-specific/ship-from-store/company-ship-from-store-create-dialog";
import { CompanyShipFromStoreEditDialog } from "@/components/feature-specific/ship-from-store/company-ship-from-store-edit-dialog";
import ConfirmDialog from "@/components/common/confirm-dialog";
import { deleteShipFromStoreAdmin } from "@/services/ship-from-store-service";
import { useToast } from "@/hooks/use-toast";

export default function CompanyShipFromStorePage() {
  let company = useSelector((state: RootState) => state.company.company);
  const { pathname } = useLocation();
  const isModerator = pathname.includes("moderator");
  if (isModerator) {
    company = useSelector((state: RootState) => state.user.company);
  }
  const companyId = company?.ID ?? 0;
  const [createOpen, setCreateOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<ShipFromStore | null>(null);
  const [deleteRecord, setDeleteRecord] = useState<ShipFromStore | null>(null);
  const [franchiseFilter, setFranchiseFilter] = useState<number | undefined>(undefined);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: franchisesData } = useQuery({
    queryKey: ["company-franchises", companyId],
    queryFn: () => getMyCompanyFranchises(companyId),
    enabled: !!companyId,
  });
  const franchises = franchisesData?.data ?? [];

  const { data } = useQuery({
    queryKey: ["company-ship-from-store", companyId, franchiseFilter],
    queryFn: () =>
      listShipFromStoreAdmin({
        company_id: companyId,
        franchise_id: franchiseFilter,
      }),
    enabled: !!companyId,
  });
  const records = data?.data ?? [];

  const handleDeleteConfirm = async () => {
    if (!deleteRecord) return;
    try {
      await deleteShipFromStoreAdmin(deleteRecord.ID);
      toast({ title: "Deleted", description: "Record deleted." });
      queryClient.invalidateQueries({ queryKey: ["company-ship-from-store", companyId] });
      setDeleteRecord(null);
    } catch (e) {
      toast({
        title: "Error",
        description: e instanceof Error ? e.message : "Failed to delete",
        variant: "destructive",
      });
    }
  };

  const columns = createCompanyShipFromStoreColumns(
    (record) => setEditRecord(record),
    (record) => setDeleteRecord(record)
  );

  if (!company) {
    return <div>No company selected</div>;
  }

  return (
    <div className="p-4">
      <div className="flex gap-2 items-center justify-between mb-4">
        <div className="flex gap-2 items-center">
          <AppBarBackButton destination="Control panel" />
          <span>{company.company_name} &gt; Ship from store</span>
        </div>
        <div className="flex gap-2 items-center">
          <Select
            value={franchiseFilter?.toString() ?? "all"}
            onValueChange={(v) => setFranchiseFilter(v === "all" ? undefined : parseInt(v, 10))}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All franchises" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All franchises</SelectItem>
              {franchises.map((f) => (
                <SelectItem key={f.ID} value={String(f.ID)}>
                  {f.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => setCreateOpen(true)}>
            <Package className="mr-2 h-4 w-4" />
            Create
          </Button>
        </div>
      </div>

      <DataTable
        data={records}
        searchColumn="tracking_number"
        columns={columns}
      />

      <CompanyShipFromStoreCreateDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        companyId={companyId}
      />
      <CompanyShipFromStoreEditDialog
        open={!!editRecord}
        onOpenChange={(open) => !open && setEditRecord(null)}
        record={editRecord}
        companyId={companyId}
      />
      <ConfirmDialog
        open={!!deleteRecord}
        onOpenChange={(open) => !open && setDeleteRecord(null)}
        title="Delete ship-from-store record?"
        description={
          deleteRecord
            ? `Tracking: ${deleteRecord.tracking_number}. This cannot be undone.`
            : undefined
        }
        confirmText="Delete"
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
