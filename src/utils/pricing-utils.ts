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
