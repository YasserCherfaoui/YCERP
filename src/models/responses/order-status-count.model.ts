export interface OrderStatusCount {
  status: string;
  count: number;
}

export interface OrderStatusCountData {
  status_counts: OrderStatusCount[];
  total_orders: number;
  date_from: string;
  date_to: string;
  wilaya?: string;
  shipping_provider?: string;
}

export interface OrderStatusCountResponse {
  status: string;
  message: string;
  data: OrderStatusCountData;
}

