import { Review } from "./review.model";

export interface Customer {
  phone: string;
  birthday?: string | Date | null;
  first_name: string;
  last_name: string;
  email: string;
  name_history?: string[];
  address_history?: string[];
  created_at: string | Date;
  updated_at: string | Date;
  reviews?: Review[];
}

export interface CustomerStats {
  total_orders: number;
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
}

export interface UpcomingBirthday {
  customer: Customer;
  days_until: number;
  age: number;
  next_birthday: string;
}

