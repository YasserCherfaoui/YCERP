import { DataTable } from "@/components/ui/data-table";
import { StockAlert } from "@/models/data/stock-alert.model";
import { stockAlertsHistoryColumns } from "./stock-alerts-columns";

interface StockAlertsHistoryListProps {
  alerts: StockAlert[];
  isLoading?: boolean;
}

export const StockAlertsHistoryList = ({
  alerts,
  isLoading,
}: StockAlertsHistoryListProps) => {
  if (isLoading) {
    return <div>Loading alert history...</div>;
  }

  return (
    <DataTable
      data={alerts}
      columns={stockAlertsHistoryColumns}
      searchColumn="inventory_item.product.name"
    />
  );
};

