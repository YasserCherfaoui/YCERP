import { RootState } from "@/app/store";
import AppBarBackButton from "@/components/common/app-bar-back-button";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { listShipFromStoreAdmin } from "@/services/ship-from-store-service";
import { useQuery } from "@tanstack/react-query";
import { Package } from "lucide-react";
import { useState } from "react";
import { useSelector } from "react-redux";
import { createCompanyShipFromStoreColumns } from "@/components/feature-specific/ship-from-store/company-ship-from-store-columns";
import { CompanyShipFromStoreCreateDialog } from "@/components/feature-specific/ship-from-store/company-ship-from-store-create-dialog";
import { CompanyShipFromStoreEditDialog } from "@/components/feature-specific/ship-from-store/company-ship-from-store-edit-dialog";
import ConfirmDialog from "@/components/common/confirm-dialog";
import { deleteShipFromStoreAdmin } from "@/services/ship-from-store-service";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { ShipFromStore } from "@/models/data/ship-from-store.model";

export default function CompanyFranchiseShipFromStorePage() {
  const company = useSelector((state: RootState) => state.company.company);
  const franchise = useSelector((state: RootState) => state.franchise.franchise);
  const companyId = company?.ID ?? 0;
  const franchiseId = franchise?.ID;
  const [createOpen, setCreateOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<ShipFromStore | null>(null);
  const [deleteRecord, setDeleteRecord] = useState<ShipFromStore | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ["company-ship-from-store", franchiseId],
    queryFn: () =>
      listShipFromStoreAdmin({
        franchise_id: franchiseId,
      }),
    enabled: !!franchiseId,
  });
  const records = data?.data ?? [];

  const handleDeleteConfirm = async () => {
    if (!deleteRecord) return;
    try {
      await deleteShipFromStoreAdmin(deleteRecord.ID);
      toast({ title: "Deleted", description: "Record deleted." });
      queryClient.invalidateQueries({
        queryKey: ["company-ship-from-store", franchiseId],
      });
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

  if (!company || !franchise) {
    return <div>No company or franchise selected</div>;
  }

  return (
    <div className="p-4">
      <div className="flex gap-2 items-center justify-between mb-4">
        <div className="flex gap-2 items-center">
          <AppBarBackButton destination="Franchise" />
          <span>
            {company.company_name} &gt; Franchises &gt; {franchise.name} &gt; Ship from store
          </span>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Package className="mr-2 h-4 w-4" />
          Create
        </Button>
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
        defaultFranchiseId={franchiseId}
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
