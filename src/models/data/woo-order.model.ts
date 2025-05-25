import { ClientStatus } from "@/models/data/client-status.model";
import { User } from "./user.model";

export interface WooOrder {
  id: number;
  woo_id: number;
  number: string;
  order_status: string;
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
  date_created: string;
  date_modified: string;
  payment_method: string;
  payment_method_title: string;
  order_key: string;
  line_items: WooOrderItem[];
  meta_data: WooOrderMeta[];
  shipping_lines: WooOrderShippingLine[];
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  taken_by_id?: number | null;
  taken_by?: User | null;
  taken_at?: string | null;
  client_statuses: ClientStatus[];
}

export interface WooOrderItem {
  ID: number;
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
  ID: number;
  order_id: number;
  meta_id: number;
  key: string;
  value: string;
}

export interface WooOrderShippingLine {
  ID: number;
  order_id: number;
  woo_id: number;
  method_id: string;
  method_title: string;
  total: string;
} 