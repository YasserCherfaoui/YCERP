import {
  FranchiseWooRefund,
  WooRefundReimbursementStatus,
} from "@/models/data/franchise-woo-refund.model";

/** Amount the company owes the franchise (cash refund or exchange cash to customer). */
export function reimbursementAmountDue(refund: FranchiseWooRefund): number {
  if (refund.resolution_type === "cash_refund") {
    return refund.cash_paid_to_customer ?? 0;
  }
  if (refund.resolution_type === "local_exchange") {
    const due =
      (refund.exchange_customer_receives ?? 0) -
      (refund.exchange_customer_pays ?? 0);
    return due > 0 ? due : 0;
  }
  return 0;
}

/** Matches backend EffectiveReimbursementStatus (incl. legacy rows). */
export function effectiveReimbursementStatus(
  refund: FranchiseWooRefund
): WooRefundReimbursementStatus {
  if (
    refund.reimbursement_status === "paid" ||
    refund.reimbursed_at
  ) {
    return "paid";
  }
  if (reimbursementAmountDue(refund) <= 0) {
    return "not_applicable";
  }
  if (refund.reimbursement_status === "pending") {
    return "pending";
  }
  return "pending";
}

export function canSettleRefund(refund: FranchiseWooRefund): boolean {
  return effectiveReimbursementStatus(refund) === "pending";
}

/**
 * Customer cash paid to the franchise on a local exchange that is not already
 * netted inside a pending reimbursement row (receives − pays on the same refund).
 */
export function exchangePaysReducingOutstanding(
  refund: FranchiseWooRefund
): number {
  if (refund.resolution_type !== "local_exchange") {
    return 0;
  }
  if (effectiveReimbursementStatus(refund) === "paid") {
    return 0;
  }
  if (effectiveReimbursementStatus(refund) === "pending") {
    return 0;
  }
  return refund.exchange_customer_pays ?? 0;
}

/** Net outstanding: pending company owes minus franchise collections from customers. */
export function totalOutstandingReimbursement(
  refunds: FranchiseWooRefund[]
): number {
  let total = 0;
  for (const r of refunds) {
    if (effectiveReimbursementStatus(r) === "pending") {
      total += reimbursementAmountDue(r);
    }
    total -= exchangePaysReducingOutstanding(r);
  }
  return Math.max(0, total);
}
