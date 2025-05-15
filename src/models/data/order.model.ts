import { Product, ProductVariant } from "@/models/data/product.model";
import { Return } from "@/models/data/return.model";
import { User } from "@/models/data/user.model";

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product: Product;
  product_variant_id: number;
  product_variant: ProductVariant;
  discount: number;
  quantity: number;
}

export interface ShippingHistory {
  id: number;
  shipping_id: number;
  status: string;
  comment: string;
}

export interface CommentHistory {
  id: number;
  shipping_id: number;
  status: string;
  comment: string;
}

export interface DeliveryCost {
  id: number;
  delivery_id: number;
  city: string;
  state: string;
  stop_desk_cost: number;
  express_cost: number;
}

export interface Delivery {
  id: number;
  name: string;
  email: string;
  password: string;
  costs: DeliveryCost[];
}

export interface Shipping {
  id: number;
  order_id: number;
  full_name: string;
  phone_number: string;
  address: string;
  city: string;
  state: string;
  delivery_id?: number;
  delivery?: Delivery;
  delivery_cost_id?: number;
  delivery_cost?: DeliveryCost;
  shipping_histories?: ShippingHistory[];
  comment_histories?: CommentHistory[];
}

export interface Order {
  id: number;
  company_id: number;
  shipping: Shipping;
  order_items: OrderItem[];
  total: number;
  status: string;
  returns: Return[];
  discount: number;
  taken_by_id?: number;
  taken_by?: User;
  taken_at?: string;
}

export enum OrderStatus {
  Unconfirmed = 'unconfirmed',
  Packing = 'packing',
  Dispaching = 'dispaching',
  Deliviring = 'deliviring',
  Delivered = 'delivered',
  Returning = 'returning',
  Returned = 'returned',
  Cancelled = 'cancelled',
}
