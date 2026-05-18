import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FranchiseWooRefund } from "@/models/data/franchise-woo-refund.model";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Eye } from "lucide-react";
import { effectiveReimbursementStatus } from "./woo-refund-reimbursement";

const formatDZD = (n: number) =>
  new Intl.NumberFormat("en-DZ", {
    style: "currency",
    currency: "DZD",
    maximumFractionDigits: 0,
  }).format(n);

const resolutionLabel = (type: string) =>
  type === "local_exchange" ? "Local exchange" : "Cash refund";

function companyPaymentBadge(refund: FranchiseWooRefund) {
  const status = effectiveReimbursementStatus(refund);
  switch (status) {
    case "pending":
      return <Badge variant="outline">Awaiting company payment</Badge>;
    case "paid":
      return (
        <Badge variant="default" className="bg-emerald-600">
          Paid by company
        </Badge>
      );
    default:
      return <Badge variant="secondary">N/A</Badge>;
  }
}

export function createFranchiseWooRefundsColumns(
  onView: (refund: FranchiseWooRefund) => void
): ColumnDef<FranchiseWooRefund>[] {
  return [
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
      header: "Company payback",
      cell: ({ row }) => companyPaymentBadge(row.original),
    },
    {
      id: "amount",
      header: "Cash / exchange",
      cell: ({ row }) => {
        const r = row.original;
        if (r.resolution_type === "cash_refund") {
          return formatDZD(r.cash_paid_to_customer ?? 0);
        }
        return (
          <span className="text-xs">
            Pays {formatDZD(r.exchange_customer_pays)} / receives{" "}
            {formatDZD(r.exchange_customer_receives)}
          </span>
        );
      },
    },
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
