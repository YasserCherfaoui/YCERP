import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FranchiseWooRefund } from "@/models/data/franchise-woo-refund.model";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Eye } from "lucide-react";
import {
  effectiveReimbursementStatus,
  reimbursementAmountDue,
} from "./woo-refund-reimbursement";
import { WooRefundLocalExchangeSummary } from "./woo-refund-local-exchange-summary";

const formatDZD = (n: number) =>
  new Intl.NumberFormat("en-DZ", {
    style: "currency",
    currency: "DZD",
    maximumFractionDigits: 0,
  }).format(n);

const resolutionLabel = (type: string) =>
  type === "local_exchange" ? "Local exchange" : "Cash refund";

function reimbursementBadge(refund: FranchiseWooRefund) {
  const status = effectiveReimbursementStatus(refund);
  switch (status) {
    case "pending":
      return <Badge variant="outline">Awaiting payment</Badge>;
    case "paid":
      return (
        <Badge variant="default" className="bg-emerald-600">
          Paid to franchise
        </Badge>
      );
    default:
      return <Badge variant="secondary">N/A</Badge>;
  }
}

export const companyFranchiseWooRefundsColumns: ColumnDef<FranchiseWooRefund>[] =
  [
    {
      id: "date",
      header: "Date",
      accessorFn: (row) => row.CreatedAt,
      cell: ({ row }) =>
        row.original.CreatedAt
          ? format(new Date(row.original.CreatedAt), "dd MMM yyyy HH:mm")
          : "—",
    },
    {
      id: "order",
      header: "Order",
      accessorFn: (row) => row.woo_order?.number ?? "",
      cell: ({ row }) => (
        <>
          <span className="font-medium block">
            {row.original.woo_order?.number ?? `#${row.original.woo_order_id}`}
          </span>
          {row.original.woo_order?.tracking_number ? (
            <span className="text-xs text-muted-foreground block">
              {row.original.woo_order.tracking_number}
            </span>
          ) : null}
        </>
      ),
    },
    {
      id: "franchise",
      header: "Return store",
      accessorFn: (row) => row.franchise?.name ?? "",
      cell: ({ row }) => row.original.franchise?.name ?? "—",
    },
    {
      id: "resolution",
      header: "Resolution",
      accessorKey: "resolution_type",
      cell: ({ row }) => (
        <Badge
          variant={
            row.original.resolution_type === "cash_refund"
              ? "default"
              : "secondary"
          }
        >
          {resolutionLabel(row.original.resolution_type)}
        </Badge>
      ),
    },
    {
      id: "reimbursement",
      header: "Payment status",
      cell: ({ row }) => reimbursementBadge(row.original),
    },
    {
      id: "exchange_details",
      header: "Local exchange",
      cell: ({ row }) => {
        const r = row.original;
        if (r.resolution_type !== "local_exchange") {
          return <span className="text-xs text-muted-foreground">—</span>;
        }
        return <WooRefundLocalExchangeSummary refund={r} compact />;
      },
    },
    {
      id: "amount",
      header: "Owed to franchise",
      cell: ({ row }) => {
        const due = reimbursementAmountDue(row.original);
        if (due <= 0) {
          return <span className="text-xs text-muted-foreground">—</span>;
        }
        return formatDZD(due);
      },
    },
  ];

/** Columns with view action — pass onView from parent. */
export function createCompanyFranchiseWooRefundsColumns(
  onView: (refund: FranchiseWooRefund) => void
): ColumnDef<FranchiseWooRefund>[] {
  return [
    ...companyFranchiseWooRefundsColumns.filter((c) => c.id !== "actions"),
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onView(row.original)}
          aria-label="View refund details"
        >
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ];
}
