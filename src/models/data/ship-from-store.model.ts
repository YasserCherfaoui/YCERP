import { ProductVariant } from "./product.model";
import { Franchise } from "./franchise.model";

export interface ShipFromStore {
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt?: string;
  tracking_number: string;
  product_variant_id: number;
  product_variant?: ProductVariant;
  inventory_id: number;
  inventory_item_id: number;
  franchise_id?: number;
  franchise?: Franchise;
  franchise_administrator_id?: number;
  company_id?: number;
  quantity: number;
}
