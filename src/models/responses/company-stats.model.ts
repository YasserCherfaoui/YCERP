
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

export interface CompanyStats {
  productSales: ProductSalesResponse[];
}
