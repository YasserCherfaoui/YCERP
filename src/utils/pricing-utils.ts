import { Franchise, FRANCHISE_TYPES, FranchiseType } from "@/models/data/franchise.model";
import { Product } from "@/models/data/product.model";

/**
 * Get the appropriate franchise price based on franchise type
 * @param product - The product containing pricing information
 * @param franchiseType - The type of franchise (normal or vip)
 * @returns The correct price for the franchise type
 */
export function getFranchisePriceByType(product: Product, franchiseType: FranchiseType): number {
  if (franchiseType === FRANCHISE_TYPES.VIP && product.vip_franchise_price) {
    return product.vip_franchise_price;
  }
  return product.franchise_price;
}

/**
 * Get the appropriate franchise price based on franchise object
 * @param product - The product containing pricing information
 * @param franchise - The franchise object containing the type
 * @returns The correct price for the franchise
 */
export function getFranchisePrice(product: Product, franchise: Franchise): number {
  return getFranchisePriceByType(product, franchise.franchise_type);
}

/**
 * Check if a franchise is VIP type
 * @param franchise - The franchise to check
 * @returns True if the franchise is VIP type
 */
export function isVipFranchise(franchise: Franchise): boolean {
  return franchise.franchise_type === FRANCHISE_TYPES.VIP;
}

/**
 * Get display label for franchise type
 * @param franchiseType - The franchise type
 * @returns Human readable label
 */
export function getFranchiseTypeLabel(franchiseType: FranchiseType): string {
  return franchiseType === FRANCHISE_TYPES.VIP ? "VIP Franchise" : "Normal Franchise";
}

/**
 * BOGO (buy one get second at half price): total sale amount for a line.
 * fullUnits = ceil(qty/2), halfUnits = floor(qty/2); total = fullPrice * fullUnits + halfPrice * halfUnits.
 */
export function getBOGOLineTotal(unitPrice: number, quantity: number): number {
  if (quantity < 2) return unitPrice * quantity;
  const fullUnits = Math.floor((quantity + 1) / 2);
  const halfUnits = Math.floor(quantity / 2);
  const halfPrice = Math.floor(unitPrice / 2);
  return unitPrice * fullUnits + halfPrice * halfUnits;
}

/** One physical unit in the pairable pool (mirrors backend PairableUnitInput). */
export type PairableUnitInput = {
  lineIndex: number;
  unitIndex: number;
  variantId: number;
  productId: number;
  firstPrice: number;
  listPrice: number;
  franchisePrice: number;
  discountPerUnit: number;
};

function comparePairableMin(a: PairableUnitInput, b: PairableUnitInput): boolean {
  if (a.firstPrice !== b.firstPrice) return a.firstPrice < b.firstPrice;
  if (a.productId !== b.productId) return a.productId < b.productId;
  if (a.variantId !== b.variantId) return a.variantId < b.variantId;
  if (a.lineIndex !== b.lineIndex) return a.lineIndex < b.lineIndex;
  return a.unitIndex < b.unitIndex;
}

function comparePairableMax(a: PairableUnitInput, b: PairableUnitInput): boolean {
  if (a.firstPrice !== b.firstPrice) return a.firstPrice > b.firstPrice;
  if (a.productId !== b.productId) return a.productId > b.productId;
  if (a.variantId !== b.variantId) return a.variantId > b.variantId;
  if (a.lineIndex !== b.lineIndex) return a.lineIndex > b.lineIndex;
  return a.unitIndex > b.unitIndex;
}

/** Per-unit outcomes in the same order as `units`. */
export function applyPairablePairing(units: PairableUnitInput[]): Array<{
  lineIndex: number;
  salePrice: number;
  discountPerUnit: number;
}> {
  const n = units.length;
  const pairs = Math.floor(n / 2);
  const isHalf = new Array<boolean>(n).fill(false);
  let remaining = units.map((_, i) => i);
  for (let p = 0; p < pairs; p++) {
    if (remaining.length < 2) break;
    let minPos = 0;
    for (let i = 1; i < remaining.length; i++) {
      if (comparePairableMin(units[remaining[i]], units[remaining[minPos]])) minPos = i;
    }
    let maxPos = 0;
    for (let i = 1; i < remaining.length; i++) {
      if (comparePairableMax(units[remaining[i]], units[remaining[maxPos]])) maxPos = i;
    }
    const minIdx = remaining[minPos];
    isHalf[minIdx] = true;
    const nextRem: number[] = [];
    for (let i = 0; i < remaining.length; i++) {
      if (i !== minPos && i !== maxPos) nextRem.push(remaining[i]);
    }
    remaining = nextRem;
  }
  const out: Array<{ lineIndex: number; salePrice: number; discountPerUnit: number }> = [];
  for (let i = 0; i < n; i++) {
    const u = units[i];
    const salePrice = isHalf[i] ? Math.floor(u.listPrice / 2) : u.listPrice;
    out.push({ lineIndex: u.lineIndex, salePrice, discountPerUnit: u.discountPerUnit });
  }
  return out;
}

export type SaleLineForPair = {
  product_variant_id: number;
  quantity: number;
  price: number;
  discount: number;
};

export type InventoryRowForPair = {
  product_variant_id: number;
  product_id: number;
  product?: Product;
};

/**
 * When 2+ pairable units in the cart, returns per-line net totals (sale − per-unit discount × units counted).
 * Otherwise `active` is false (use BOGO / list pricing).
 */
export function computePairPromoLineTotals(
  saleItems: SaleLineForPair[],
  inventoryItems: InventoryRowForPair[],
  franchise: Franchise
): { active: boolean; lineTotals: number[] } {
  const lineTotals = saleItems.map(() => 0);
  let pairableUnits = 0;
  for (let i = 0; i < saleItems.length; i++) {
    const inv = inventoryItems.find((x) => x.product_variant_id === saleItems[i].product_variant_id);
    if (inv?.product?.pairable) pairableUnits += saleItems[i].quantity;
  }
  if (pairableUnits < 2) {
    return { active: false, lineTotals };
  }
  const pool: PairableUnitInput[] = [];
  for (let li = 0; li < saleItems.length; li++) {
    const inv = inventoryItems.find((x) => x.product_variant_id === saleItems[li].product_variant_id);
    const p = inv?.product;
    if (!inv || !p?.pairable) continue;
    const fp = getFranchisePrice(p, franchise);
    for (let u = 0; u < saleItems[li].quantity; u++) {
      pool.push({
        lineIndex: li,
        unitIndex: u,
        variantId: saleItems[li].product_variant_id,
        productId: inv.product_id,
        firstPrice: p.first_price,
        listPrice: p.price,
        franchisePrice: fp,
        discountPerUnit: saleItems[li].discount,
      });
    }
  }
  const outcomes = applyPairablePairing(pool);
  for (const o of outcomes) {
    lineTotals[o.lineIndex] += o.salePrice - o.discountPerUnit;
  }
  return { active: true, lineTotals };
}
