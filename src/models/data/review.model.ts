import { Customer } from "./customer.model";
import { WooOrder } from "./woo-order.model";
import { User } from "./user.model";

export interface Review {
  ID: number;
  CreatedAt: string | Date;
  UpdatedAt: string | Date;
  DeletedAt?: string | Date | null;
  customer_phone: string;
  customer?: Customer | null;
  woo_order_id?: number | null;
  woo_order?: WooOrder | null;
  rating: number;
  comment: string;
  reviewed_by: number;
  reviewed_by_user?: User | null;
  reviewed_at: string | Date;
  follow_up_call_date?: string | Date | null;
}

export interface CreateReviewRequest {
  customer_phone: string;
  woo_order_id?: number | null;
  rating: number;
  comment?: string;
  follow_up_call_date?: string | Date | null;
}

