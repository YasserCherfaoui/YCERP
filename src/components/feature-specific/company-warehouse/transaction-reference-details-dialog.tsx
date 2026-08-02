import OrderDetailsDialog from "@/components/feature-specific/orders/order-details-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ExitBill, EntryBill, BillItemModel } from "@/models/data/bill.model";
import { InventoryItem } from "@/models/data/inventory.model";
import { Sale } from "@/models/data/sale.model";
import { Return } from "@/models/data/return.model";
import { WooOrder } from "@/models/data/woo-order.model";
import { ProductVariant } from "@/models/data/product.model";
import { getInventoryReference } from "@/services/inventory-service";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  referenceType: string;
  referenceId: number;
}

function formatMoney(amount: number) {
  return new Intl.NumberFormat("en-DZ", {
    style: "currency",
    currency: "DZD",
  }).format(amount);
}

function variantLabel(variant?: ProductVariant | null, productName?: string) {
  if (!variant) return productName || "—";
  const parts = [
    productName || variant.product?.name,
    variant.qr_code,
    variant.color,
    variant.size,
  ].filter(Boolean);
  return parts.join(" · ") || "—";
}

function MetaRow({ label, value }: { label: string; value?: ReactNode }) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div className="flex gap-2 text-sm">
      <span className="text-muted-foreground min-w-[120px]">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function LineItemsTable({
  rows,
}: {
  rows: Array<{ key: string | number; label: string; qty: number; amount?: number }>;
}) {
  if (rows.length === 0) {
    return <p className="text-sm text-muted-foreground">No line items.</p>;
  }
  const showAmount = rows.some((r) => r.amount !== undefined);
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Item</TableHead>
          <TableHead className="text-right">Qty</TableHead>
          {showAmount && <TableHead className="text-right">Amount</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.key}>
            <TableCell>{row.label}</TableCell>
            <TableCell className="text-right">{row.qty}</TableCell>
            {showAmount && (
              <TableCell className="text-right">
                {row.amount !== undefined ? formatMoney(row.amount) : "—"}
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function billItemRows(items?: BillItemModel[] | null) {
  return (items ?? []).map((item, idx) => ({
    key: item.id ?? idx,
    label: variantLabel(item.product_variant, item.product_variant?.product?.name),
    qty: item.quantity,
    amount:
      item.franchise_price != null
        ? item.franchise_price * item.quantity
        : item.first_price != null
          ? item.first_price * item.quantity
          : undefined,
  }));
}

function SaleDetails({ sale }: { sale: Sale }) {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <MetaRow label="Sale type" value={(sale as Sale & { sale_type?: string }).sale_type} />
        <MetaRow
          label="Created"
          value={sale.CreatedAt ? new Date(sale.CreatedAt).toLocaleString() : undefined}
        />
        <MetaRow label="Amount" value={formatMoney(sale.amount)} />
        <MetaRow label="Discount" value={formatMoney(sale.discount)} />
        <MetaRow label="Total" value={formatMoney(sale.total)} />
      </div>
      <LineItemsTable
        rows={(sale.sale_items ?? []).map((item) => ({
          key: item.ID,
          label: variantLabel(item.product_variant, item.product?.name),
          qty: item.quantity,
          amount: ((item.product?.price ?? item.price ?? 0) - (item.discount ?? 0)) * item.quantity,
        }))}
      />
    </div>
  );
}

function ExitBillDetails({ bill }: { bill: ExitBill }) {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <MetaRow label="Status" value={bill.status} />
        <MetaRow label="Company" value={bill.company?.company_name} />
        <MetaRow label="Franchise" value={bill.franchise?.name} />
        <MetaRow
          label="Created"
          value={bill.CreatedAt ? new Date(bill.CreatedAt).toLocaleString() : undefined}
        />
        <MetaRow label="Franchise total" value={formatMoney(bill.franchise_total_amount)} />
        <MetaRow label="Company total" value={formatMoney(bill.company_total_amount)} />
      </div>
      <LineItemsTable rows={billItemRows(bill.bill_items)} />
    </div>
  );
}

function EntryBillDetails({ bill }: { bill: EntryBill }) {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <MetaRow label="Status" value={(bill as EntryBill & { status?: string }).status} />
        <MetaRow label="Company" value={bill.company?.company_name} />
        <MetaRow label="Franchise" value={bill.franchise?.name} />
        <MetaRow label="Exit bill" value={bill.exit_bill_id ? `#${bill.exit_bill_id}` : undefined} />
        <MetaRow label="Total" value={formatMoney(bill.total)} />
        <MetaRow
          label="Created"
          value={bill.CreatedAt ? new Date(bill.CreatedAt).toLocaleString() : undefined}
        />
      </div>
      <LineItemsTable rows={billItemRows(bill.confirmed_bill_items)} />
    </div>
  );
}

function ReturnDetails({ ret }: { ret: Return }) {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <MetaRow label="Type" value={ret.type} />
        <MetaRow label="Reason" value={ret.reason} />
        <MetaRow label="Comment" value={ret.comment} />
        <MetaRow label="Total" value={formatMoney(ret.total)} />
        <MetaRow
          label="Created"
          value={ret.CreatedAt ? new Date(ret.CreatedAt).toLocaleString() : undefined}
        />
      </div>
      <LineItemsTable
        rows={(ret.items ?? []).map((item) => ({
          key: item.ID,
          label: variantLabel(item.product_variant, item.product_variant?.product?.name),
          qty: item.quantity,
          amount:
            item.return_price != null
              ? item.return_price * item.quantity
              : item.product_variant?.product?.price != null
                ? item.product_variant.product.price * item.quantity
                : undefined,
        }))}
      />
    </div>
  );
}

function InventoryItemDetails({ item }: { item: InventoryItem }) {
  return (
    <div className="space-y-1">
      <MetaRow label="Name" value={item.name} />
      <MetaRow label="Product" value={item.product?.name} />
      <MetaRow
        label="Variant"
        value={variantLabel(item.product_variant, item.product?.name)}
      />
      <MetaRow label="Quantity" value={item.quantity} />
      <MetaRow label="Broken" value={item.broken_count} />
      <MetaRow label="Inventory" value={item.inventory?.name} />
    </div>
  );
}

function GenericObjectDetails({ data }: { data: Record<string, unknown> }) {
  const skip = new Set(["DeletedAt", "deleted_at"]);
  const entries = Object.entries(data).filter(([key, value]) => {
    if (skip.has(key)) return false;
    if (value === null || value === undefined) return false;
    if (typeof value === "object") return false;
    return true;
  });

  const nestedArrays = Object.entries(data).filter(
    ([, value]) => Array.isArray(value) && value.length > 0
  );

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        {entries.map(([key, value]) => (
          <MetaRow
            key={key}
            label={key.replace(/_/g, " ")}
            value={
              typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)
                ? new Date(value).toLocaleString()
                : String(value)
            }
          />
        ))}
      </div>
      {nestedArrays.map(([key, value]) => {
        const arr = value as Array<Record<string, unknown>>;
        const first = arr[0];
        const variant =
          first?.product_variant && typeof first.product_variant === "object"
            ? (first.product_variant as ProductVariant)
            : first?.broken_item &&
                typeof first.broken_item === "object" &&
                (first.broken_item as { product_variant?: ProductVariant }).product_variant
              ? (first.broken_item as { product_variant?: ProductVariant }).product_variant
              : undefined;
        if (!variant && typeof first?.quantity !== "number") {
          return null;
        }
        return (
          <div key={key} className="space-y-2">
            <p className="text-sm font-medium capitalize">{key.replace(/_/g, " ")}</p>
            <LineItemsTable
              rows={arr.map((row, idx) => {
                const pv =
                  (row.product_variant as ProductVariant | undefined) ??
                  ((row.broken_item as { product_variant?: ProductVariant } | undefined)
                    ?.product_variant);
                const productName =
                  pv?.product?.name ??
                  (row.product as { name?: string } | undefined)?.name;
                return {
                  key: (row.ID as number) ?? (row.id as number) ?? idx,
                  label: variantLabel(pv, productName),
                  qty: Number(row.quantity ?? row.broken_quantity ?? 0),
                };
              })}
            />
          </div>
        );
      })}
    </div>
  );
}

function ReferenceBody({
  referenceType,
  data,
}: {
  referenceType: string;
  data: unknown;
}) {
  if (!data || typeof data !== "object") {
    return <p className="text-sm text-muted-foreground">No details available.</p>;
  }

  switch (referenceType) {
    case "sale":
      return <SaleDetails sale={data as Sale} />;
    case "exit_bill":
      return <ExitBillDetails bill={data as ExitBill} />;
    case "entry_bill":
      return <EntryBillDetails bill={data as EntryBill} />;
    case "return":
      return <ReturnDetails ret={data as Return} />;
    case "inventory_item":
      return <InventoryItemDetails item={data as InventoryItem} />;
    default:
      return <GenericObjectDetails data={data as Record<string, unknown>} />;
  }
}

function titleForType(referenceType: string, referenceId: number) {
  const labels: Record<string, string> = {
    sale: "Sale",
    exit_bill: "Exit Bill",
    entry_bill: "Entry Bill",
    woo_order: "WooCommerce Order",
    woo_order_not_available: "WooCommerce Order (restored)",
    return: "Return",
    exchange: "Exchange",
    supplier_bill: "Supplier Bill",
    bill: "Supplier Bill",
    broken_item: "Broken Item",
    broken_item_transfer: "Broken Item Transfer",
    broken_item_transfer_heal: "Broken Item Transfer Heal",
    ship_from_store: "Ship From Store",
    inventory_item: "Inventory Item",
  };
  return `${labels[referenceType] ?? referenceType} #${referenceId}`;
}

export default function TransactionReferenceDetailsDialog({
  open,
  onOpenChange,
  referenceType,
  referenceId,
}: Props) {
  const normalizedType = referenceType.trim().toLowerCase();
  const isWooOrder =
    normalizedType === "woo_order" || normalizedType === "woo_order_not_available";

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["inventory-reference", normalizedType, referenceId],
    queryFn: () => getInventoryReference(normalizedType, referenceId),
    enabled: open && !!normalizedType && referenceId > 0,
  });

  const payload = data?.data;
  const entity = payload?.data;
  const isDeleted = !!payload?.deleted;
  const wooOrder =
    isWooOrder && entity && !isLoading && !isError ? (entity as WooOrder) : null;

  if (wooOrder) {
    return (
      <OrderDetailsDialog
        order={wooOrder}
        open={open}
        setOpen={onOpenChange}
        isDeleted={isDeleted}
      />
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {titleForType(normalizedType, referenceId)}
            {isDeleted && <Badge variant="destructive">DELETED</Badge>}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-2">
          {isLoading && (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}
          {isError && (
            <p className="text-sm text-destructive">
              {(error as Error)?.message || "Failed to load reference details."}
            </p>
          )}
          {!isLoading && !isError && !isWooOrder && (
            <ReferenceBody referenceType={normalizedType} data={entity} />
          )}
          {!isLoading && !isError && isWooOrder && !wooOrder && (
            <p className="text-sm text-muted-foreground">No order details available.</p>
          )}
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
