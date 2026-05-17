import { franchiseCommissionsColumns } from "@/components/feature-specific/ship-from-store/franchise-commissions-columns";
import { FranchiseCommission } from "@/models/data/franchise-commission.model";
import { ColumnDef } from "@tanstack/react-table";

const franchiseColumn: ColumnDef<FranchiseCommission> = {
  id: "franchise",
  header: "Franchise",
  cell: ({ row }) => row.original.franchise?.name ?? "—",
};

export const companyFranchiseCommissionsColumns: ColumnDef<FranchiseCommission>[] = [
  franchiseCommissionsColumns[0],
  franchiseColumn,
  ...franchiseCommissionsColumns.slice(1),
];
