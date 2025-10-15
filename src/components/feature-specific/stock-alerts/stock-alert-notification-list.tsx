import { DataTable } from "@/components/ui/data-table";
import { StockAlertNotification } from "@/models/data/stock-alert.model";
import { stockAlertNotificationsColumns } from "./stock-alert-notifications-columns";

interface StockAlertNotificationListProps {
  notifications: StockAlertNotification[];
  isLoading?: boolean;
}

export const StockAlertNotificationList = ({
  notifications,
  isLoading,
}: StockAlertNotificationListProps) => {
  if (isLoading) {
    return <div>Loading notifications...</div>;
  }

  return (
    <DataTable
      data={notifications}
      columns={stockAlertNotificationsColumns}
      searchColumn="stock_alert.inventory_item.product.name"
    />
  );
};

