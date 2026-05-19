import { Product } from "@/models/data/product.model";
import { FranchiseWooRefundExchangeItemInput } from "@/models/data/franchise-woo-refund.model";
import { InventoryItemWithCost } from "@/models/responses/inventory-with-cost.model";

/** Retail unit price for exchange lines (matches backend refund items). */
export function getProductUnitPrice(product: Product | undefined): number {
  return product?.price ?? 0;
}

export function unitPriceFromInventoryRow(row: InventoryItemWithCost): number {
  return getProductUnitPrice(row.product);
}

export function buildVariantUnitPriceMap(
  inventoryRows: InventoryItemWithCost[]
): Map<number, number> {
  const map = new Map<number, number>();
  for (const row of inventoryRows) {
    const variantId = row.product_variant_id ?? row.product_variant?.ID;
    if (!variantId || map.has(variantId)) continue;
    map.set(variantId, unitPriceFromInventoryRow(row));
  }
  return map;
}

export type ReturnedLinePricing = {
  id: number;
  label: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export function computeReturnedLinesTotal(
  lines: ReturnedLinePricing[]
): number {
  return lines.reduce((sum, l) => sum + l.lineTotal, 0);
}

export function computeExchangeLinesTotal(
  items: FranchiseWooRefundExchangeItemInput[],
  variantUnitPrice: Map<number, number>
): number {
  return items.reduce((sum, ex) => {
    if (!ex.product_variant_id || ex.quantity <= 0) return sum;
    const unit = variantUnitPrice.get(ex.product_variant_id) ?? 0;
    const discount = ex.discount ?? 0;
    return sum + Math.max(0, unit - discount) * ex.quantity;
  }, 0);
}

/** Positive delta → customer pays franchise; negative → customer receives. */
export function computeExchangeCashDelta(
  exchangeTotal: number,
  returnedTotal: number
): { customerPays: number; customerReceives: number } {
  const delta = exchangeTotal - returnedTotal;
  if (delta > 0) return { customerPays: delta, customerReceives: 0 };
  if (delta < 0) return { customerPays: 0, customerReceives: -delta };
  return { customerPays: 0, customerReceives: 0 };
}
