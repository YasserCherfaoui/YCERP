import { Button } from "@/components/ui/button";
import {
  FranchisePickupRequest,
  FranchisePickupStatus,
} from "@/models/data/franchise-pickup.model";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import {
  PickupStatusBadge,
  formatPickupItems,
  pickupEmployeeName,
  pickupFranchiseName,
} from "./pickup-status";

export const createCompanyPickupColumns = ({
  onView,
  onCancel,
}: {
  onView?: (request: FranchisePickupRequest) => void;
  onCancel?: (request: FranchisePickupRequest) => void;
} = {}): ColumnDef<FranchisePickupRequest>[] => [
  {
    accessorFn: (row) => pickupFranchiseName(row),
    id: "franchise",
    header: "Franchise",
    cell: ({ row }) => (
      <span className="font-medium">{pickupFranchiseName(row.original)}</span>
    ),
  },
  {
    accessorFn: (row) => pickupEmployeeName(row),
    id: "employee",
    header: "Courier",
  },
  {
    id: "items",
    header: "Items",
    cell: ({ row }) => (
      <span className="block max-w-[280px] truncate" title={formatPickupItems(row.original)}>
        {formatPickupItems(row.original) || "—"}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ getValue }) => (
      <PickupStatusBadge status={getValue() as FranchisePickupStatus} />
    ),
  },
  {
    accessorKey: "CreatedAt",
    header: "Created",
    cell: ({ getValue }) => format(new Date(getValue() as string), "MMM d, yyyy"),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <div className="flex flex-wrap items-center gap-2">
        {onView ? (
          <Button variant="outline" size="sm" onClick={() => onView(row.original)}>
            View
          </Button>
        ) : null}
        {row.original.status === "pending" && onCancel ? (
          <Button variant="outline" size="sm" onClick={() => onCancel(row.original)}>
            Cancel
          </Button>
        ) : null}
      </div>
    ),
  },
];

export const createFranchisePickupColumns = ({
  onView,
  onRespond,
}: {
  onView?: (request: FranchisePickupRequest) => void;
  onRespond?: (request: FranchisePickupRequest) => void;
} = {}): ColumnDef<FranchisePickupRequest>[] => [
  {
    accessorFn: (row) => pickupEmployeeName(row),
    id: "employee",
    header: "Courier",
    cell: ({ row }) => (
      <span className="font-medium">{pickupEmployeeName(row.original)}</span>
    ),
  },
  {
    id: "items",
    header: "Items",
    cell: ({ row }) => (
      <span className="block max-w-[280px] truncate" title={formatPickupItems(row.original)}>
        {formatPickupItems(row.original) || "—"}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ getValue }) => (
      <PickupStatusBadge status={getValue() as FranchisePickupStatus} />
    ),
  },
  {
    accessorKey: "notes",
    header: "Notes",
    cell: ({ getValue }) => {
      const notes = (getValue() as string) || "";
      return notes ? (
        <span className="line-clamp-2 max-w-[200px]">{notes}</span>
      ) : (
        <span className="text-muted-foreground">—</span>
      );
    },
  },
  {
    accessorKey: "CreatedAt",
    header: "Created",
    cell: ({ getValue }) => format(new Date(getValue() as string), "MMM d, yyyy"),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <div className="flex flex-wrap items-center gap-2">
        {onView ? (
          <Button variant="outline" size="sm" onClick={() => onView(row.original)}>
            View
          </Button>
        ) : null}
        {row.original.status === "pending" && onRespond ? (
          <Button size="sm" onClick={() => onRespond(row.original)}>
            Respond
          </Button>
        ) : null}
      </div>
    ),
  },
];
