import CompanyUnknwonReturnsActionsDropdown from "@/components/feature-specific/company-unknown-returns/company-unknwon-returns-actions-dropdown";
import { Return } from "@/models/data/return.model";
import { ColumnDef } from "@tanstack/react-table";

export const companyUnknownReturnsColumns: ColumnDef<Return>[] = [
  {
    accessorKey: "ID",
    id: "id",
    header: "ID",
  },
  {
    accessorKey: "CreatedAt",
    header: "Created At",
  },
  {
    accessorKey: "cost",
    header: "Cost",
  },
  {
    accessorKey: "total",
    header: "Total",
  },
  {
    header: "Actions",
    cell: ({row}) => <CompanyUnknwonReturnsActionsDropdown returnModel={row.original} />
  }
];
