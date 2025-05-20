import { OrderTicketsBody } from "@/components/feature-specific/company/order-tickets";
import OrderTicketsAppBar from "@/components/feature-specific/company/order-tickets/order-tickets-app-bar";

export default function OrderTicketsPage() {
  return (
    <div className="p-6">
      <OrderTicketsAppBar />
      <OrderTicketsBody />
    </div>
  );
} 