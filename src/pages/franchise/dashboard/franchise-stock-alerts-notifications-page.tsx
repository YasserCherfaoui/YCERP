import { StockAlertNotificationList } from "@/components/feature-specific/stock-alerts/stock-alert-notification-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getNotifications } from "@/services/stock-alerts-service";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function FranchiseStockAlertsNotificationsPage() {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["stock-alert-notifications"],
    queryFn: () => getNotifications(),
  });

  const notifications = data?.data || [];
  const unreadCount = notifications.filter((n) => !n.read_at).length;

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Stock Alert Notifications</h1>
            <p className="text-muted-foreground">
              View and manage your notifications
            </p>
          </div>
        </div>
        {unreadCount > 0 && (
          <div className="text-muted-foreground">
            {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>
            In-app notifications for stock alerts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StockAlertNotificationList
            notifications={notifications}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
}

