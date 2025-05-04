import UsersActionsMenu from "@/components/feature-specific/iam/users-actions-menu";
import { User } from "@/models/data/user.model";
import { ColumnDef } from "@tanstack/react-table";

export const usersColumns: ColumnDef<User>[] = [
  {
    header: "Full Name",
    id: "full_name",
    accessorKey: "full_name",
  },
  {
    header: "Email",
    accessorKey: "email",
  },
  {
    header: "Phone Number",
    accessorKey: "phone_number",
  },
  {
    header: "Actions",
    cell: ({ row }) => <UsersActionsMenu user={row.original} />,
  },
];
