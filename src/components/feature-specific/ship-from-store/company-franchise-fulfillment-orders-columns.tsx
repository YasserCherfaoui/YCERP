import OrderDetailsDialog from "@/components/feature-specific/orders/order-details-dialog";
import { ShippingLabelPreviewDialog } from "@/components/feature-specific/ship-from-store/shipping-label-preview-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { yalidineBordereauUrl } from "@/lib/yalidine";
import {
  FranchiseOrderStatus,
  WooOrder,
  isFranchiseOrderStatus,
} from "@/models/data/woo-order.model";
import { uploadWooOrderShippingLabel } from "@/services/franchise-fulfillment-service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { Eye, FileSearch, Printer, Upload } from "lucide-react";
import { useRef, useState } from "react";

function orderStatusVariant(status: string): "default" | "secondary" | "outline" | "destructive" {
  const s = status?.toLowerCase() ?? "";
  if (s.includes("deliver")) return "default";
  if (s.includes("cancel") || s.includes("return")) return "destructive";
  if (s.includes("pack") || s.includes("dispatch") || s.includes("delivir")) return "secondary";
  return "outline";
}

const FRANCHISE_ORDER_STATUS_LABELS: Record<FranchiseOrderStatus, string> = {
  pending: "Pending",
  packed: "Packed",
  dispatched: "Dispatched",
  not_available: "Not Available",
};

function OrderNumberCell({ order }: { order: WooOrder }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        variant="link"
        className="h-auto justify-start p-0 font-medium"
        onClick={() => setOpen(true)}
      >
        #{order.number || order.id}
      </Button>
      <div className="text-xs text-muted-foreground">
        {new Date(order.date_created).toLocaleDateString()}
      </div>
      <OrderDetailsDialog order={order} open={open} setOpen={setOpen} />
    </>
  );
}

function ViewDetailsCell({ order }: { order: WooOrder }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        <Eye className="mr-1 h-4 w-4" />
        View
      </Button>
      <OrderDetailsDialog order={order} open={open} setOpen={setOpen} />
    </>
  );
}

function CompanyPrintLabelCell({ order }: { order: WooOrder }) {
  const tracking = order.tracking_number?.trim();
  if (!tracking) {
    return (
      <Button variant="ghost" size="sm" disabled>
        <Printer className="mr-1 h-4 w-4" />
        Print label
      </Button>
    );
  }

  return (
    <Button variant="ghost" size="sm" asChild>
      <a
        href={yalidineBordereauUrl(tracking)}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Printer className="mr-1 h-4 w-4" />
        Print label
      </a>
    </Button>
  );
}

function UploadLabelCell({
  order,
  companyId,
}: {
  order: WooOrder;
  companyId?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: (file: File) =>
      uploadWooOrderShippingLabel(order.id, file, companyId),
    onSuccess: () => {
      toast({
        title: "Label uploaded",
        description: `Shipping label saved for order #${order.number || order.id}.`,
      });
      queryClient.invalidateQueries({
        queryKey: ["company-franchise-fulfillment-orders"],
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Upload failed",
        description: error.message || "Could not upload shipping label.",
        variant: "destructive",
      });
    },
  });

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) mutation.mutate(file);
          e.target.value = "";
        }}
      />
      <Button
        variant="ghost"
        size="sm"
        disabled={mutation.isPending}
        onClick={() => inputRef.current?.click()}
      >
        <Upload className="mr-1 h-4 w-4" />
        Upload label
      </Button>
    </>
  );
}

function PreviewLabelCell({
  order,
  companyId,
}: {
  order: WooOrder;
  companyId?: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        <FileSearch className="mr-1 h-4 w-4" />
        Preview
      </Button>
      <ShippingLabelPreviewDialog
        order={order}
        companyId={companyId}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}

function ShippingLabelActionCell({
  order,
  companyId,
}: {
  order: WooOrder;
  companyId?: number;
}) {
  if (order.has_shipping_label) {
    return <PreviewLabelCell order={order} companyId={companyId} />;
  }
  return <UploadLabelCell order={order} companyId={companyId} />;
}

export const FRANCHISE_FULFILLMENT_ORDER_SEARCH_COLUMN = "order_search";

function franchiseFulfillmentOrderSearchText(order: WooOrder): string {
  return [
    order.id?.toString(),
    order.number,
    order.tracking_number,
    order.customer_phone,
    order.customer_phone_2,
  ]
    .filter((part) => part != null && String(part).trim() !== "")
    .join(" ")
    .toLowerCase();
}

export function createCompanyFranchiseFulfillmentOrdersColumns(options?: {
  companyId?: number;
}): ColumnDef<WooOrder>[] {
  const companyId = options?.companyId;

  return [
    {
      id: FRANCHISE_FULFILLMENT_ORDER_SEARCH_COLUMN,
      accessorFn: (row) => franchiseFulfillmentOrderSearchText(row),
      filterFn: (row, _id, value) => {
        const q = String(value ?? "")
          .trim()
          .toLowerCase();
        if (!q) return true;
        return franchiseFulfillmentOrderSearchText(row.original).includes(q);
      },
      enableHiding: false,
    },
    {
      accessorKey: "number",
      header: "Order",
      cell: ({ row }) => <OrderNumberCell order={row.original} />,
    },
    {
      id: "franchise",
      header: "Franchise",
      cell: ({ row }) => row.original.franchise?.name ?? "—",
    },
    {
      accessorKey: "order_status",
      header: "Status",
      cell: ({ row }) => {
        const s = row.original.order_status;
        return <Badge variant={orderStatusVariant(s)}>{s || "-"}</Badge>;
      },
    },
    {
      id: "customer",
      header: "Customer",
      cell: ({ row }) => {
        const o = row.original;
        return (
          <div className="flex flex-col">
            <span>{o.billing_name || "-"}</span>
            <span className="text-xs text-muted-foreground">
              {o.customer_phone || ""}
            </span>
          </div>
        );
      },
    },
    {
      id: "from_wilaya",
      header: "From wilaya",
      cell: ({ row }) => row.original.woo_shipping?.from_wilaya_name ?? "-",
    },
    {
      id: "to_wilaya",
      header: "To wilaya",
      cell: ({ row }) => row.original.woo_shipping?.wilaya_name ?? "-",
    },
    {
      accessorKey: "tracking_number",
      header: "Tracking",
      cell: ({ row }) =>
        row.original.tracking_number ? (
          <span className="font-mono text-sm">{row.original.tracking_number}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      id: "franchise_order_status",
      header: "Franchise status",
      cell: ({ row }) => {
        const raw = row.original.franchise_order_status;
        const status = isFranchiseOrderStatus(raw) ? raw : "pending";
        return (
          <Badge variant="outline">
            {FRANCHISE_ORDER_STATUS_LABELS[status] ??
              (raw ? String(raw) : "Pending")}
          </Badge>
        );
      },
    },
    {
      id: "items",
      header: "Items",
      cell: ({ row }) => {
        const items = row.original.confirmed_order_items ?? [];
        const total = items.reduce((sum, item) => sum + (item.quantity ?? 0), 0);
        return (
          <span className="tabular-nums">
            {total} unit{total === 1 ? "" : "s"}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => (
        <div className="flex justify-end gap-1">
          <CompanyPrintLabelCell order={row.original} />
          <ShippingLabelActionCell order={row.original} companyId={companyId} />
          <ViewDetailsCell order={row.original} />
        </div>
      ),
    },
  ];
}

/** @deprecated Use createCompanyFranchiseFulfillmentOrdersColumns instead */
export const companyFranchiseFulfillmentOrdersColumns =
  createCompanyFranchiseFulfillmentOrdersColumns();
