export type DeliveredItemPayload = {
  confirmed_item_id: number;
  quantity: number;
  notes?: string;
};

export type DeliveryFulfillmentRequest = {
  order_id: number;
  delivered_items: DeliveredItemPayload[];
  fees_collected?: boolean | null;
  fees_amount?: number | null;
  total_amount_collected?: number;
  comments?: string;
};
