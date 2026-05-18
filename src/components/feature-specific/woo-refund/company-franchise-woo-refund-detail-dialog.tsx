import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FranchiseWooRefund } from "@/models/data/franchise-woo-refund.model";
import { format } from "date-fns";
import { CheckCircle2 } from "lucide-react";
import {
  formatRefundDZD,
  formatRefundVariantLabel,
} from "./woo-refund-display-utils";
import { WooRefundLocalExchangeSummary } from "./woo-refund-local-exchange-summary";
import {
  canSettleRefund,
  effectiveReimbursementStatus,
  reimbursementAmountDue,
} from "./woo-refund-reimbursement";

type Props = {
  refund: FranchiseWooRefund | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRecordPayment?: (refund: FranchiseWooRefund) => void;
};

export function CompanyFranchiseWooRefundDetailDialog({
  refund,
  open,
  onOpenChange,
  onRecordPayment,
}: Props) {
  if (!refund) return null;

  const resolutionLabel =
    refund.resolution_type === "local_exchange" ? "Local exchange" : "Cash refund";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Refund #{refund.ID} — {refund.woo_order?.number ?? `order ${refund.woo_order_id}`}
          </DialogTitle>
        </DialogHeader>

        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <dt className="text-muted-foreground">Date</dt>
          <dd>
            {refund.CreatedAt
              ? format(new Date(refund.CreatedAt), "dd MMM yyyy HH:mm")
              : "—"}
          </dd>
          <dt className="text-muted-foreground">Return store</dt>
          <dd>{refund.franchise?.name ?? "—"}</dd>
          <dt className="text-muted-foreground">Resolution</dt>
          <dd>
            <Badge variant="outline">{resolutionLabel}</Badge>
          </dd>
          <dt className="text-muted-foreground">Eligible amount</dt>
          <dd>{formatRefundDZD(refund.eligible_amount)}</dd>
          {refund.resolution_type === "cash_refund" ? (
            <>
              <dt className="text-muted-foreground">Cash paid to customer</dt>
              <dd>{formatRefundDZD(refund.cash_paid_to_customer ?? 0)}</dd>
            </>
          ) : null}
          {refund.reason ? (
            <>
              <dt className="text-muted-foreground">Reason</dt>
              <dd className="col-span-1">{refund.reason}</dd>
            </>
          ) : null}
          {reimbursementAmountDue(refund) > 0 ? (
            <>
              <dt className="text-muted-foreground">Owed to franchise</dt>
              <dd>{formatRefundDZD(reimbursementAmountDue(refund))}</dd>
              <dt className="text-muted-foreground">Company reimbursement</dt>
              <dd>
                {effectiveReimbursementStatus(refund) === "paid"
                  ? "Paid to franchise"
                  : effectiveReimbursementStatus(refund) === "pending"
                    ? "Awaiting company payment"
                    : "—"}
              </dd>
              {refund.reimbursed_at ? (
                <>
                  <dt className="text-muted-foreground">Paid on</dt>
                  <dd>
                    {format(new Date(refund.reimbursed_at), "dd MMM yyyy HH:mm")}
                  </dd>
                </>
              ) : null}
              {refund.reimbursement_reference ? (
                <>
                  <dt className="text-muted-foreground">Payment reference</dt>
                  <dd>{refund.reimbursement_reference}</dd>
                </>
              ) : null}
            </>
          ) : null}
        </dl>

        {refund.resolution_type === "local_exchange" ? (
          <WooRefundLocalExchangeSummary refund={refund} />
        ) : null}

        {(refund.items?.length ?? 0) > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Returned items</p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Unit</TableHead>
                  <TableHead className="text-right">Line total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {refund.items!.map((item) => (
                  <TableRow key={item.ID}>
                    <TableCell className="text-sm">
                      {formatRefundVariantLabel(
                        item.product_variant,
                        item.product_variant_id
                      )}
                    </TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">
                      {formatRefundDZD(item.unit_price)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatRefundDZD(item.line_total)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {(refund.exchange_items?.length ?? 0) > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Exchange items</p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Unit</TableHead>
                  <TableHead className="text-right">Discount</TableHead>
                  <TableHead className="text-right">Line total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {refund.exchange_items!.map((item) => (
                  <TableRow key={item.ID}>
                    <TableCell className="text-sm">
                      {formatRefundVariantLabel(
                        item.product_variant,
                        item.product_variant_id
                      )}
                    </TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">
                      {formatRefundDZD(item.unit_price)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatRefundDZD(item.discount ?? 0)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatRefundDZD(item.line_total)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {canSettleRefund(refund) && onRecordPayment ? (
          <DialogFooter className="pt-2">
            <Button
              onClick={() => {
                onRecordPayment(refund);
                onOpenChange(false);
              }}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Record payment to franchise
            </Button>
          </DialogFooter>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
