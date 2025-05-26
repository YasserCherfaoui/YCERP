import { ClientStatus } from "@/models/data/client-status.model";
import { DeliveryCompany } from "@/models/data/delivery.model";
import { Product, ProductVariant } from "@/models/data/product.model";
import { User } from "./user.model";

export interface WooOrder {
  id: number;
  woo_id: number;
  number: string;
  status: string;
  total: string;
  currency: string;
  customer_id: number;
  customer_email: string;
  customer_phone: string;
  billing_name: string;
  billing_address_1: string;
  billing_city: string;
  shipping_name: string;
  shipping_address_1: string;
  shipping_city: string;
  date_created: string | Date;
  date_modified: string | Date;
  payment_method: string;
  payment_method_title: string;
  order_key: string;
  line_items: WooOrderItem[];
  meta_data: WooOrderMeta[];
  shipping_lines: WooOrderShippingLine[];
  created_at: string | Date;
  updated_at: string | Date;
  deleted_at?: string | Date | null;
  taken_by_id?: number | null;
  taken_by?: User | null;
  taken_at?: string | Date | null;
  client_statuses: ClientStatus[];
  order_status?: string;
  confirmed_order_items?: ConfirmedOrderItem[];
  woo_shipping?: WooShipping;
  tracking_number?: string;
  amount?: number;
  final_price?: number;
}

export interface WooOrderItem {
  id: number;
  order_id: number;
  woo_id: number;
  sku: string;
  name: string;
  price: number;
  quantity: number;
  total: string;
  product_id: number;
  variation_id: number;
}

export interface WooOrderMeta {
  id: number;
  order_id: number;
  meta_id: number;
  key: string;
  value: string;
}

export interface WooOrderShippingLine {
  id: number;
  order_id: number;
  woo_id: number;
  method_id: string;
  method_title: string;
  total: string;
}

export interface ConfirmedOrderItem {
  id?: number;
  woo_order_id: number;
  product_id: number;
  product?: Product;
  product_variant_id: number;
  product_variant?: ProductVariant;
  quantity: number;
}

export interface WooShipping {
  id?: number;
  woo_order_id: number;
  first_delivery_cost: number;
  second_delivery_cost: number;
  shipping_provider: string;
  delivery_type: string;
  selected_commune: string;
  selected_center: string;
  state_id: string;
  wilaya_name: string;
  commune_name: string;
  delivery_company_id?: number;
  delivery_company?: DeliveryCompany;
}

