import {
  FranchiseWooRefund,
  FranchiseWooRefundExchangeItem,
  FranchiseWooRefundItem,
} from "@/models/data/franchise-woo-refund.model";
type RefundVariantLike = {
  color?: string;
  size?: number;
  qr_code?: string;
  product?: { name?: string };
};

export const formatRefundDZD = (n: number) =>
  new Intl.NumberFormat("en-DZ", {
    style: "currency",
    currency: "DZD",
    maximumFractionDigits: 0,
  }).format(n);

export function formatRefundVariantLabel(
  variant?: RefundVariantLike | null,
  variantId?: number
): string {
  if (variant) {
    const name = variant.product?.name;
    const parts = [
      name,
      variant.color,
      variant.size != null ? String(variant.size) : null,
    ].filter(Boolean);
    if (parts.length > 0) {
      return parts.join(" · ");
    }
    if (variant.qr_code) {
      return variant.qr_code;
    }
  }
  return variantId ? `#${variantId}` : "—";
}

export function sumRefundItemLines(items: FranchiseWooRefundItem[] | undefined): number {
  return (items ?? []).reduce((s, i) => s + (i.line_total ?? 0), 0);
}

export function sumExchangeItemLines(
  items: FranchiseWooRefundExchangeItem[] | undefined
): number {
  return (items ?? []).reduce((s, i) => s + (i.line_total ?? 0), 0);
}

export function localExchangeCashDelta(refund: FranchiseWooRefund): {
  pays: number;
  receives: number;
  netLabel: string;
  netAmount: number;
} {
  const pays = refund.exchange_customer_pays ?? 0;
  const receives = refund.exchange_customer_receives ?? 0;
  const returned = sumRefundItemLines(refund.items);
  const exchange = sumExchangeItemLines(refund.exchange_items);

  if (pays > 0) {
    return {
      pays,
      receives,
      netLabel: "Customer pays franchise",
      netAmount: pays,
    };
  }
  if (receives > 0) {
    return {
      pays,
      receives,
      netLabel: "Customer receives from franchise",
      netAmount: receives,
    };
  }
  return {
    pays,
    receives,
    netLabel: "No cash difference",
    netAmount: 0,
  };
}
