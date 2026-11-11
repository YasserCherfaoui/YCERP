import { Product } from "@/models/data/product.model";

export type ProductSegment =
  | "all"
  | "active"
  | "inactive"
  | "bogo"
  | "combinable"
  | "pairable"
  | "no_photos";

export type PromoFilter = "all" | "bogo" | "combinable" | "pairable" | "none";
export type StatusFilter = "all" | "active" | "inactive";
export type PhotoFilter = "all" | "with_photos" | "missing_photos";

export interface ProductFiltersState {
  search: string;
  segment: ProductSegment;
  categoryId: string;
  promo: PromoFilter;
  status: StatusFilter;
  photo: PhotoFilter;
}

export const DEFAULT_PRODUCT_FILTERS: ProductFiltersState = {
  search: "",
  segment: "all",
  categoryId: "all",
  promo: "all",
  status: "all",
  photo: "all",
};

const dzdFormatter = new Intl.NumberFormat("en-DZ", {
  style: "currency",
  currency: "DZD",
  maximumFractionDigits: 0,
});

export function formatDzd(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "—";
  }
  return dzdFormatter.format(value);
}

/**
 * Collects unique, non-empty image URLs for a product, prioritizing product_images
 * and falling back to affiliate_props images when product_images is empty.
 */
export function getProductImageUrls(product: Product): string[] {
  const seen = new Set<string>();
  const urls: string[] = [];

  for (const img of product.product_images ?? []) {
    const url = img?.image_url?.trim();
    if (url && !seen.has(url)) {
      seen.add(url);
      urls.push(url);
    }
  }

  if (urls.length === 0) {
    for (const prop of product.affiliate_props ?? []) {
      for (const img of prop.images ?? []) {
        const url = img?.image_url?.trim();
        if (url && !seen.has(url)) {
          seen.add(url);
          urls.push(url);
        }
      }
    }
  }

  return urls;
}

export function filterProducts(
  products: Product[],
  filters: ProductFiltersState
): Product[] {
  const query = filters.search.trim().toLowerCase();

  return products.filter((product) => {
    const images = getProductImageUrls(product);

    if (filters.segment === "active" && product.is_active === false) return false;
    if (filters.segment === "inactive" && product.is_active !== false) return false;
    if (filters.segment === "bogo" && !product.is_bogo) return false;
    if (filters.segment === "combinable" && !product.combinable) return false;
    if (filters.segment === "pairable" && !product.pairable) return false;
    if (filters.segment === "no_photos" && images.length > 0) return false;

    if (filters.status === "active" && product.is_active === false) return false;
    if (filters.status === "inactive" && product.is_active !== false) return false;

    if (filters.promo === "bogo" && !product.is_bogo) return false;
    if (filters.promo === "combinable" && !product.combinable) return false;
    if (filters.promo === "pairable" && !product.pairable) return false;
    if (
      filters.promo === "none" &&
      (product.is_bogo || product.combinable || product.pairable)
    ) {
      return false;
    }

    if (filters.photo === "with_photos" && images.length === 0) return false;
    if (filters.photo === "missing_photos" && images.length > 0) return false;

    if (filters.categoryId !== "all") {
      const catId = product.product_category_id ?? product.product_category?.ID ?? null;
      if (filters.categoryId === "uncategorized") {
        if (catId !== null) return false;
      } else if (String(catId) !== filters.categoryId) {
        return false;
      }
    }

    if (query) {
      const nameMatch = product.name?.toLowerCase().includes(query);
      const descMatch = product.description?.toLowerCase().includes(query);
      const idMatch = String(product.ID) === query || `#${product.ID}` === query;
      const categoryMatch = product.product_category?.name
        ?.toLowerCase()
        .includes(query);
      const variantMatch = (product.product_variants ?? []).some(
        (variant) =>
          variant.color?.toLowerCase().includes(query) ||
          variant.qr_code?.toLowerCase().includes(query) ||
          String(variant.size).toLowerCase() === query
      );
      if (!nameMatch && !descMatch && !idMatch && !categoryMatch && !variantMatch) {
        return false;
      }
    }

    return true;
  });
}

