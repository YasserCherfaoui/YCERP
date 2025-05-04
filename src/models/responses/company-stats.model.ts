
export interface ProductSalesResponse {
  product_id: number;
  name: string;
  variants: VariantSalesResponse[];
  total_sold_quantity: number;
}

export interface VariantSalesResponse {
  product_variant_id: number;
  color: string;
  size: number;
  sold_quantity: number;
}
export interface PaginationMeta {
  total_items: number;
  total_pages: number;
  current_page: number;
  per_page: number;
}

export interface CompanyStatsResponse {
  products: ProductSalesResponse[];
  pagination: PaginationMeta;
}
