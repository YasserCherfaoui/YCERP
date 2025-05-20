import AppBarBackButton from "@/components/common/app-bar-back-button";

export default function OrderTicketsAppBar() {
  return (
    <div className="flex items-center gap-4 mb-4">
      <AppBarBackButton destination="Menu" />
      <h1 className="text-2xl font-bold">Order Tickets</h1>
    </div>
  );
} 