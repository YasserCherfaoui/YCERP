export interface PaymentCommission {
  payment_id: number;
  commission_id: number;
  amount: number; // The portion of the payment applied to this commission
} 