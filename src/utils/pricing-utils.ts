import type { Company } from "@/models/data/company.model";
import { Franchise, FRANCHISE_TYPES, FranchiseType } from "@/models/data/franchise.model";
import { Product, ProductPack } from "@/models/data/product.model";

export function pairableEligibleForFranchiseSale(
  franchise: Franchise,
  company: Company | null | undefined,
  product: Product | undefined
): boolean {
  if (!product?.pairable) return false;
  if (franchise.franchise_type !== FRANCHISE_TYPES.VIP) return true;
  return company?.vip_allow_pairable !== false;
}

export function combinableEligibleForFranchiseSale(
  franchise: Franchise,
  company: Company | null | undefined,
  product: Product | undefined
): boolean {
  if (!product?.combinable) return false;
  if (franchise.franchise_type !== FRANCHISE_TYPES.VIP) return true;
  return company?.vip_allow_combinable !== false;
}

export function bogoEligibleForFranchiseSale(
  franchise: Franchise,
  company: Company | null | undefined,
  product: Product | undefined,
  totalQtyForProduct: number
): boolean {
  if (totalQtyForProduct < 2 || !product?.is_bogo) return false;
  if (franchise.franchise_type !== FRANCHISE_TYPES.VIP) return true;
  return company?.vip_allow_bogo !== false;
}

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
  franchise: Franchise,
  excludedProductIds?: Set<number>
): { active: boolean; lineTotals: number[] } {
  const lineTotals = saleItems.map(() => 0);
  let pairableUnits = 0;
  const co = franchise.company;
  for (let i = 0; i < saleItems.length; i++) {
    const inv = inventoryItems.find((x) => x.product_variant_id === saleItems[i].product_variant_id);
    if (inv && excludedProductIds?.has(inv.product_id)) continue;
    if (pairableEligibleForFranchiseSale(franchise, co, inv?.product)) {
      pairableUnits += saleItems[i].quantity;
    }
  }
  if (pairableUnits < 2) {
    return { active: false, lineTotals };
  }
  const pool: PairableUnitInput[] = [];
  for (let li = 0; li < saleItems.length; li++) {
    const inv = inventoryItems.find((x) => x.product_variant_id === saleItems[li].product_variant_id);
    const p = inv?.product;
    if (!inv || excludedProductIds?.has(inv.product_id) || !pairableEligibleForFranchiseSale(franchise, co, p)) continue;
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

/**
 * Combinable anchor promo: 2+ combinable units → one anchor unit at first_price (franchise 0 on server);
 * preview uses first_price / list price minus per-line discount. Non-combinable lines use list line total.
 */
export function computeCombinableLineTotals(
  franchise: Franchise,
  saleItems: SaleLineForPair[],
  inventoryItems: InventoryRowForPair[],
  excludedProductIds?: Set<number>
): { active: boolean; lineTotals: number[] } {
  const lineTotals = saleItems.map(() => 0);
  const co = franchise.company;
  let combinableUnits = 0;
  for (let i = 0; i < saleItems.length; i++) {
    const inv = inventoryItems.find((x) => x.product_variant_id === saleItems[i].product_variant_id);
    if (inv && excludedProductIds?.has(inv.product_id)) continue;
    if (combinableEligibleForFranchiseSale(franchise, co, inv?.product)) {
      combinableUnits += saleItems[i].quantity;
    }
  }
  if (combinableUnits < 2) {
    return { active: false, lineTotals };
  }

  let anchorPid: number | null = null;
  let bestFp = 0;
  let hasAnchor = false;
  for (let i = 0; i < saleItems.length; i++) {
    const inv = inventoryItems.find((x) => x.product_variant_id === saleItems[i].product_variant_id);
    const p = inv?.product;
    if (!inv || excludedProductIds?.has(inv.product_id) || !combinableEligibleForFranchiseSale(franchise, co, p) || saleItems[i].quantity <= 0) continue;
    const fp = p.first_price;
    if (
      !hasAnchor ||
      fp < bestFp ||
      (fp === bestFp && inv.product_id < (anchorPid ?? Infinity))
    ) {
      bestFp = fp;
      anchorPid = inv.product_id;
      hasAnchor = true;
    }
  }
  if (!hasAnchor || anchorPid === null) {
    return { active: false, lineTotals };
  }

  let anchorTaken = false;
  for (let li = 0; li < saleItems.length; li++) {
    const inv = inventoryItems.find((x) => x.product_variant_id === saleItems[li].product_variant_id);
    const p = inv?.product;
    const qty = saleItems[li].quantity;
    const disc = saleItems[li].discount;
    if (!inv || excludedProductIds?.has(inv.product_id) || !combinableEligibleForFranchiseSale(franchise, co, p)) {
      lineTotals[li] = (saleItems[li].price - disc) * qty;
      continue;
    }
    let promoQty = 0;
    if (inv.product_id === anchorPid && !anchorTaken && qty > 0) {
      promoQty = 1;
      anchorTaken = true;
    }
    const normalQty = qty - promoQty;
    let net = 0;
    if (promoQty > 0) {
      net += (p.first_price - disc) * promoQty;
    }
    if (normalQty > 0) {
      net += (p.price - disc) * normalQty;
    }
    lineTotals[li] = net;
  }
  return { active: true, lineTotals };
}

export function isPackConfigured(product: Product | undefined | null): boolean {
  return Boolean(
    product?.is_pack &&
    (product.pack_quantity ?? 0) >= 2 &&
    product.pack_price != null &&
    product.pack_price > 0
  );
}

export function isPackEligibleForSale(
  product: Product | undefined | null,
  totalQtyForProduct: number
): boolean {
  return isPackConfigured(product) && totalQtyForProduct >= (product?.pack_quantity ?? 2);
}

export function computePackExtraMargin(
  normalFranchiseTotal: number,
  marginType: "fixed" | "percent" | string | undefined,
  marginValue: number | undefined
): number {
  const val = marginValue ?? 0;
  if (val <= 0) return 0;
  if (marginType === "percent") {
    if (normalFranchiseTotal <= 0) return 0;
    return Math.round((normalFranchiseTotal * val) / 100);
  }
  return Math.round(val);
}

export interface PackBreakdown {
  packQuantity: number;
  packPrice: number;
  normalRetailTotal: number;
  normalFranchiseTotal: number;
  baseMargin: number;
  baseMarginPct: number;
  extraMargin: number;
  extraMarginPct: number;
  totalMargin: number;
  totalMarginPct: number;
  packFranchiseTotal: number;
  perUnitSalePrice: number;
  perUnitFranchisePrice: number;
}

export function computePackBreakdown(params: {
  packQuantity: number;
  packPrice: number;
  unitPrice: number;
  unitFranchisePrice: number;
  marginType?: "fixed" | "percent" | string;
  marginValue?: number;
}): PackBreakdown {
  const packQuantity = Math.max(2, Math.floor(params.packQuantity || 2));
  const packPrice = Math.max(0, params.packPrice || 0);
  const normalRetailTotal = packQuantity * (params.unitPrice || 0);
  const normalFranchiseTotal = packQuantity * (params.unitFranchisePrice || 0);
  const baseMargin = packPrice - normalFranchiseTotal;
  const extraMargin = computePackExtraMargin(
    normalFranchiseTotal,
    params.marginType,
    params.marginValue
  );
  const packFranchiseTotal = Math.max(0, normalFranchiseTotal - extraMargin);
  const totalMargin = packPrice - packFranchiseTotal;
  const pctOf = (amount: number) =>
    normalFranchiseTotal > 0 ? (amount / normalFranchiseTotal) * 100 : 0;

  return {
    packQuantity,
    packPrice,
    normalRetailTotal,
    normalFranchiseTotal,
    baseMargin,
    baseMarginPct: pctOf(baseMargin),
    extraMargin,
    extraMarginPct: pctOf(extraMargin),
    totalMargin,
    totalMarginPct: pctOf(totalMargin),
    packFranchiseTotal,
    perUnitSalePrice: packPrice / packQuantity,
    perUnitFranchisePrice: packFranchiseTotal / packQuantity,
  };
}

/**
 * Mirrors backend BuildCartPackSegmentsByLine for customer-side line totals.
 * Multiples of pack_quantity get pack_price; remainder units use line.price.
 */
export function computePackCartTotals(
  saleItems: SaleLineForPair[],
  inventoryItems: InventoryRowForPair[]
): {
  activeProductIds: Set<number>;
  lineTotals: number[];
  productSummary: Map<number, { totalQty: number; numPacks: number; packQty: number; packPrice: number }>;
} {
  const lineTotals = saleItems.map((l) => (l.price - l.discount) * l.quantity);
  const activeProductIds = new Set<number>();
  const productSummary = new Map<
    number,
    { totalQty: number; numPacks: number; packQty: number; packPrice: number }
  >();

  const lineIndicesByProduct = new Map<number, number[]>();
  const productById = new Map<number, Product>();
  const qtyByProduct = new Map<number, number>();

  for (let i = 0; i < saleItems.length; i++) {
    const inv = inventoryItems.find(
      (x) => x.product_variant_id === saleItems[i].product_variant_id
    );
    if (!inv?.product) continue;
    const pid = inv.product_id;
    productById.set(pid, inv.product);
    if (!lineIndicesByProduct.has(pid)) lineIndicesByProduct.set(pid, []);
    lineIndicesByProduct.get(pid)!.push(i);
    qtyByProduct.set(pid, (qtyByProduct.get(pid) ?? 0) + saleItems[i].quantity);
  }

  for (const [pid, indices] of lineIndicesByProduct.entries()) {
    const product = productById.get(pid);
    const totalQty = qtyByProduct.get(pid) ?? 0;
    if (!product || !isPackEligibleForSale(product, totalQty)) continue;

    const packQty = product.pack_quantity ?? 2;
    const packPrice = product.pack_price ?? 0;
    const numPacks = Math.floor(totalQty / packQty);
    const totalPackUnits = numPacks * packQty;
    const baseSale = Math.floor(packPrice / packQty);
    const remSale = packPrice % packQty;

    activeProductIds.add(pid);
    productSummary.set(pid, { totalQty, numPacks, packQty, packPrice });

    let globalUnitIdx = 0;
    for (const li of indices) {
      const line = saleItems[li];
      let net = 0;
      for (let u = 0; u < line.quantity; u++) {
        let unitSalePrice = line.price;
        if (globalUnitIdx < totalPackUnits) {
          const posInPack = globalUnitIdx % packQty;
          unitSalePrice = baseSale + (posInPack === packQty - 1 ? remSale : 0);
        }
        net += unitSalePrice - line.discount;
        globalUnitIdx++;
      }
      lineTotals[li] = net;
    }
  }

  return { activeProductIds, lineTotals, productSummary };
}

/**
 * Largest-remainder proportional integer allocation so sum(out) === total.
 */
export function allocateWeightedInteger(total: number, weights: number[]): number[] {
  const n = weights.length;
  const out = new Array<number>(n).fill(0);
  if (n === 0 || total <= 0) return out;

  let weightSum = 0;
  const effectiveWeights = weights.map((w) => {
    const val = w > 0 ? w : 0;
    weightSum += val;
    return val;
  });
  if (weightSum <= 0) {
    weightSum = n;
    for (let i = 0; i < n; i++) effectiveWeights[i] = 1;
  }

  const rems: Array<{ idx: number; rem: number }> = [];
  let allocated = 0;
  for (let i = 0; i < n; i++) {
    const num = total * effectiveWeights[i];
    const floorVal = Math.floor(num / weightSum);
    out[i] = floorVal;
    allocated += floorVal;
    rems.push({ idx: i, rem: num % weightSum });
  }

  const leftover = total - allocated;
  rems.sort((a, b) => (b.rem !== a.rem ? b.rem - a.rem : a.idx - b.idx));
  for (let i = 0; i < leftover && i < n; i++) {
    out[rems[i].idx] += 1;
  }

  return out;
}

export interface MultiPackBreakdown {
  totalUnits: number;
  packPrice: number;
  normalRetailTotal: number;
  normalFranchiseTotal: number;
  baseMargin: number;
  baseMarginPct: number;
  extraMargin: number;
  extraMarginPct: number;
  totalMargin: number;
  totalMarginPct: number;
  packFranchiseTotal: number;
  allocatedItems: Array<{
    productId: number;
    quantity: number;
    allocatedPriceTotal: number;
    allocatedFranchiseTotal: number;
  }>;
}

export function computeMultiPackBreakdown(params: {
  packPrice: number;
  marginType: "fixed" | "percent" | string;
  marginValue: number;
  items: Array<{
    productId: number;
    quantity: number;
    unitPrice: number;
    unitFranchisePrice: number;
  }>;
}): MultiPackBreakdown {
  const totalUnits = params.items.reduce((s, it) => s + Math.max(0, it.quantity), 0);
  const normalRetailTotal = params.items.reduce(
    (s, it) => s + Math.max(0, it.quantity) * (it.unitPrice || 0),
    0
  );
  const normalFranchiseTotal = params.items.reduce(
    (s, it) => s + Math.max(0, it.quantity) * (it.unitFranchisePrice || 0),
    0
  );
  const packPrice = Math.max(0, params.packPrice || 0);
  const baseMargin = packPrice - normalFranchiseTotal;
  const extraMargin = computePackExtraMargin(
    normalFranchiseTotal,
    params.marginType,
    params.marginValue
  );
  const packFranchiseTotal = Math.max(0, normalFranchiseTotal - extraMargin);
  const totalMargin = packPrice - packFranchiseTotal;
  const pctOf = (amount: number) =>
    normalFranchiseTotal > 0 ? (amount / normalFranchiseTotal) * 100 : 0;

  const saleWeights = params.items.map(
    (it) => Math.max(0, it.quantity) * (it.unitPrice || 0)
  );
  const fpWeights = params.items.map(
    (it) => Math.max(0, it.quantity) * (it.unitFranchisePrice || 0)
  );
  const allocSale = allocateWeightedInteger(packPrice, saleWeights);
  const allocFP = allocateWeightedInteger(packFranchiseTotal, fpWeights);

  return {
    totalUnits,
    packPrice,
    normalRetailTotal,
    normalFranchiseTotal,
    baseMargin,
    baseMarginPct: pctOf(baseMargin),
    extraMargin,
    extraMarginPct: pctOf(extraMargin),
    totalMargin,
    totalMarginPct: pctOf(totalMargin),
    packFranchiseTotal,
    allocatedItems: params.items.map((it, idx) => ({
      productId: it.productId,
      quantity: it.quantity,
      allocatedPriceTotal: allocSale[idx] ?? 0,
      allocatedFranchiseTotal: allocFP[idx] ?? 0,
    })),
  };
}

export interface MultiPackLineMatch {
  packId: number;
  packName: string;
  units: number;
  netTotal: number;
}

export interface MultiPackCartAllocation {
  consumedTotalsByLine: number[];
  remainingSaleItems: SaleLineForPair[];
  matchesByLine: MultiPackLineMatch[][];
}

/**
 * Mirrors backend AllocateMultiProductPacks:
 * Prioritizes packs by totalUnits desc, customer savings desc, pack.ID asc.
 */
export function computeMultiPackCartAllocation(
  saleItems: SaleLineForPair[],
  inventoryItems: InventoryRowForPair[],
  packs: ProductPack[]
): MultiPackCartAllocation {
  const consumedTotalsByLine = saleItems.map(() => 0);
  const matchesByLine: MultiPackLineMatch[][] = saleItems.map(() => []);
  const remainingSaleItems = saleItems.map((it) => ({ ...it }));

  const activePacks = packs.filter((p) => p.is_active && p.pack_price > 0 && p.items?.length);
  if (saleItems.length === 0 || activePacks.length === 0) {
    return { consumedTotalsByLine, remainingSaleItems, matchesByLine };
  }

  const productById = new Map<number, Product>();
  type UnitSlot = {
    lineIndex: number;
    discountPerUnit: number;
    consumed: boolean;
    packId: number;
    packName: string;
    price: number;
  };
  const slotsByProduct = new Map<number, UnitSlot[]>();
  const allSlots: UnitSlot[] = [];

  for (let li = 0; li < saleItems.length; li++) {
    const line = saleItems[li];
    const inv = inventoryItems.find((x) => x.product_variant_id === line.product_variant_id);
    if (!inv?.product || line.quantity <= 0) continue;
    productById.set(inv.product_id, inv.product);
    if (!slotsByProduct.has(inv.product_id)) slotsByProduct.set(inv.product_id, []);
    const arr = slotsByProduct.get(inv.product_id)!;
    for (let u = 0; u < line.quantity; u++) {
      const slot: UnitSlot = {
        lineIndex: li,
        discountPerUnit: line.discount,
        consumed: false,
        packId: 0,
        packName: "",
        price: 0,
      };
      arr.push(slot);
      allSlots.push(slot);
    }
  }

  const scored = activePacks
    .map((pack) => {
      const seen = new Set<number>();
      let totalUnits = 0;
      let normalRetail = 0;
      let valid = true;
      for (const item of pack.items) {
        const prod = productById.get(item.product_id);
        if (!prod || item.quantity < 1 || seen.has(item.product_id)) {
          valid = false;
          break;
        }
        seen.add(item.product_id);
        totalUnits += item.quantity;
        normalRetail += item.quantity * prod.price;
      }
      if (!valid || totalUnits < 2) return null;
      return { pack, totalUnits, savings: normalRetail - pack.pack_price };
    })
    .filter((x): x is { pack: ProductPack; totalUnits: number; savings: number } => Boolean(x));

  scored.sort((a, b) => {
    if (b.totalUnits !== a.totalUnits) return b.totalUnits - a.totalUnits;
    if (b.savings !== a.savings) return b.savings - a.savings;
    return a.pack.ID - b.pack.ID;
  });

  const nextCursor = new Map<number, number>();
  for (const { pack } of scored) {
    while (true) {
      let canForm = true;
      for (const item of pack.items) {
        const slots = slotsByProduct.get(item.product_id) ?? [];
        const cur = nextCursor.get(item.product_id) ?? 0;
        if (slots.length - cur < item.quantity) {
          canForm = false;
          break;
        }
      }
      if (!canForm) break;

      const weights = pack.items.map(
        (it) => it.quantity * (productById.get(it.product_id)?.price ?? 0)
      );
      const allocSale = allocateWeightedInteger(pack.pack_price, weights);

      pack.items.forEach((item, idx) => {
        const itemSale = allocSale[idx] ?? 0;
        const baseSale = Math.floor(itemSale / item.quantity);
        const remSale = itemSale % item.quantity;
        const slots = slotsByProduct.get(item.product_id)!;
        const cur = nextCursor.get(item.product_id) ?? 0;
        for (let k = 0; k < item.quantity; k++) {
          const slot = slots[cur + k];
          slot.consumed = true;
          slot.packId = pack.ID;
          slot.packName = pack.name;
          slot.price = baseSale + (k === item.quantity - 1 ? remSale : 0);
        }
        nextCursor.set(item.product_id, cur + item.quantity);
      });
    }
  }

  const remainingQty = saleItems.map(() => 0);
  for (const slot of allSlots) {
    if (!slot.consumed) {
      remainingQty[slot.lineIndex] += 1;
      continue;
    }
    const netUnit = slot.price - slot.discountPerUnit;
    consumedTotalsByLine[slot.lineIndex] += netUnit;
    const lineMatches = matchesByLine[slot.lineIndex];
    const existing = lineMatches.find((m) => m.packId === slot.packId);
    if (existing) {
      existing.units += 1;
      existing.netTotal += netUnit;
    } else {
      lineMatches.push({
        packId: slot.packId,
        packName: slot.packName,
        units: 1,
        netTotal: netUnit,
      });
    }
  }

  for (let li = 0; li < remainingSaleItems.length; li++) {
    const inv = inventoryItems.find((x) => x.product_variant_id === saleItems[li].product_variant_id);
    remainingSaleItems[li].quantity = inv?.product ? remainingQty[li] : saleItems[li].quantity;
  }

  return { consumedTotalsByLine, remainingSaleItems, matchesByLine };
}

export function computeCompanyCartTotals(
  saleItems: SaleLineForPair[],
  inventoryItems: InventoryRowForPair[],
  multiPacks: ProductPack[]
) {
  const multi = computeMultiPackCartAllocation(saleItems, inventoryItems, multiPacks);
  const singlePack = computePackCartTotals(multi.remainingSaleItems, inventoryItems);
  const lineTotals = saleItems.map(
    (_, idx) => (multi.consumedTotalsByLine[idx] ?? 0) + (singlePack.lineTotals[idx] ?? 0)
  );
  const subtotal = lineTotals.reduce((a, b) => a + b, 0);
  return { multi, singlePack, lineTotals, subtotal };
}

export function computeFranchiseCartTotals(
  saleItems: SaleLineForPair[],
  inventoryItems: InventoryRowForPair[],
  franchise: Franchise,
  multiPacks: ProductPack[]
) {
  const multi = computeMultiPackCartAllocation(saleItems, inventoryItems, multiPacks);
  const rem = multi.remainingSaleItems;
  const singlePack = computePackCartTotals(rem, inventoryItems);
  const pairTotals = computePairPromoLineTotals(
    rem,
    inventoryItems,
    franchise,
    singlePack.activeProductIds
  );
  const combTotals = computeCombinableLineTotals(
    franchise,
    rem,
    inventoryItems,
    singlePack.activeProductIds
  );

  const remainingProductTotalQty: Record<number, number> = {};
  rem.forEach((curr) => {
    const inv = inventoryItems.find((s) => s.product_variant_id === curr.product_variant_id);
    if (inv) {
      remainingProductTotalQty[inv.product_id] =
        (remainingProductTotalQty[inv.product_id] ?? 0) + curr.quantity;
    }
  });

  const co = franchise.company;
  const lineTotals = saleItems.map((_, idx) => {
    const invItem = inventoryItems.find((s) => s.product_variant_id === rem[idx].product_variant_id);
    const prod = invItem?.product;
    const pid = invItem?.product_id;
    const totalQty = pid != null ? remainingProductTotalQty[pid] ?? 0 : 0;

    let remTotal = 0;
    if (rem[idx].quantity > 0) {
      if (pid != null && singlePack.activeProductIds.has(pid)) {
        remTotal = singlePack.lineTotals[idx] ?? 0;
      } else if (combTotals.active && combinableEligibleForFranchiseSale(franchise, co, prod)) {
        remTotal = combTotals.lineTotals[idx] ?? 0;
      } else if (
        pairTotals.active &&
        pairableEligibleForFranchiseSale(franchise, co, prod) &&
        !(combTotals.active && combinableEligibleForFranchiseSale(franchise, co, prod))
      ) {
        remTotal = pairTotals.lineTotals[idx] ?? 0;
      } else if (bogoEligibleForFranchiseSale(franchise, co, prod, totalQty) && prod && totalQty > 0) {
        remTotal =
          Math.round((getBOGOLineTotal(prod.price, totalQty) / totalQty) * rem[idx].quantity) -
          rem[idx].discount * rem[idx].quantity;
      } else {
        remTotal = (rem[idx].price - rem[idx].discount) * rem[idx].quantity;
      }
    }

    return (multi.consumedTotalsByLine[idx] ?? 0) + remTotal;
  });

  const subtotal = lineTotals.reduce((a, b) => a + b, 0);
  return {
    multi,
    singlePack,
    pairTotals,
    combTotals,
    remainingProductTotalQty,
    lineTotals,
    subtotal,
  };
}
