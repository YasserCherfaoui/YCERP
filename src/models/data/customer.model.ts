import { Review } from "./review.model";
import { Franchise } from "./franchise.model";

export interface Customer {
  phone: string;
  company_id: number;
  franchise_id?: number | null;
  franchise?: Franchise | null;
  birthday?: string | Date | null;
  first_name: string;
  last_name: string;
  email: string;
  name_history?: string[];
  address_history?: string[];
  // Cached delivery statistics
  total_orders?: number;
  delivered_orders?: number;
  delivery_rate?: number; // Percentage (0-100)
  stats_updated_at?: string | Date;
  created_at: string | Date;
  updated_at: string | Date;
  reviews?: Review[];
}

export interface CustomerStats {
  total_orders: number;
  total_sales: number;
  total_sales_count: number;
  delivered_orders: number;
  delivery_rate: number;
  last_order_date?: string | Date | null;
  first_order_date?: string | Date | null;
  last_delivered_date?: string | Date | null;
  average_order_value: number;
}

export interface DailyDelivery {
  date: string;
  total_orders: number;
  unique_customers: number;
  deliveries: CustomerDeliveryInfo[];
  pagination: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface CustomerDeliveryInfo {
  customer_phone: string;
  customer_name: string;
  orders: OrderDeliveryInfo[];
}

export interface OrderDeliveryInfo {
  id: number;
  delivered_at: string | Date;
  order_number: string;
  amount: number;
  shipping_address?: string;
  shipping_city?: string;
  billing_address?: string;
  billing_city?: string;
  payment_method?: string;
  payment_method_title?: string;
  date_created?: string | Date;
  line_items?: OrderLineItemInfo[];
  has_review?: boolean;
}

export interface OrderLineItemInfo {
  name: string;
  sku: string;
  quantity: number;
  price: number;
  total: string;
}

export interface UpcomingBirthday {
  customer: Customer;
  days_until: number;
  age: number;
  next_birthday: string;
}

