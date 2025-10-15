import { DataTable } from "@/components/ui/data-table";
import { StockAlert } from "@/models/data/stock-alert.model";
import { stockAlertsColumns } from "./stock-alerts-columns";

interface StockAlertsListProps {
  alerts: StockAlert[];
  isLoading?: boolean;
}

export const StockAlertsList = ({
  alerts,
  isLoading,
}: StockAlertsListProps) => {
  if (isLoading) {
    return <div>Loading alerts...</div>;
  }

  return (
    <DataTable
      data={alerts}
      columns={stockAlertsColumns}
      searchColumn="inventory_item.product.name"
    />
  );
};

