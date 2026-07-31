import { Button } from "@/components/ui/button";
import { DeliveryEmployee } from "@/models/data/delivery.model";
import { ColumnDef } from "@tanstack/react-table";

export function deliveryEmployeeColumns(opts?: {
  onViewProfile?: (employee: DeliveryEmployee) => void;
}): ColumnDef<DeliveryEmployee>[] {
  return [
    {
      header: "ID",
      accessorKey: "ID",
    },
    {
      header: "Name",
      accessorKey: "name",
      cell: ({ row }) => {
        const name = row.original.name;
        if (!opts?.onViewProfile) return name;
        return (
          <Button
            variant="link"
            className="h-auto p-0"
            onClick={() => opts.onViewProfile?.(row.original)}
          >
            {name}
          </Button>
        );
      },
    },
    {
      header: "Email",
      accessorKey: "email",
    },
    {
      header: "Created",
      accessorKey: "CreatedAt",
      cell: ({ row }) => new Date(row.original.CreatedAt).toLocaleDateString(),
    },
  ];
}
