
export interface ProductSalesResponse {
  product_id: number;
  name: string;
  variants: VariantSalesResponse[];
  total_sold_quantity: number;
  total_sold_warehouse: number;
  total_sold_algiers: number;
  total_delivered_woo_orders_yalidine: number;
  total_delivered_woo_orders_my_companies: number;
}

export interface VariantSalesResponse {
  product_variant_id: number;
  color: string;
  size: number;
  sold_quantity: number;
  sold_warehouse: number;
  sold_algiers: number;
  total_delivered_woo_orders_yalidine: number;
  total_delivered_woo_orders_my_companies: number;
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


export interface ProductPurchasesResponse {
  products: ProductSupplierBillResponse[];
  pagination: PaginationMeta;
}

export interface ProductSupplierBillResponse {
  product_id: number;
  name: string;
  variants: VariantSupplierBillResult[];
  total_bill_quantity: number;
}

export interface VariantSupplierBillResult {
  product_variant_id: number;
  color: string;
  size: number;
  bill_quantity: number;
}
