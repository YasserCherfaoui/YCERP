import { RootState } from "@/app/store";
import { StockAlertsList } from "@/components/feature-specific/stock-alerts/stock-alerts-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { getActiveAlerts, manualCheckAlerts } from "@/services/stock-alerts-service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RefreshCw, Search } from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

export default function CompanyStockAlertsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const company = useSelector((state: RootState) => state.company.company);

  if (!company) return null;

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["stock-alerts-active", company.ID],
    queryFn: () => getActiveAlerts({ company_id: company.ID }),
    enabled: !!company,
  });

  const manualCheckMutation = useMutation({
    mutationFn: () => manualCheckAlerts(),
    onSuccess: () => {
      toast({
        title: "Manual check initiated",
        description: "Checking all inventory levels for alerts...",
      });
      // Refetch alerts after a short delay to allow the check to complete
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["stock-alerts-active"] });
        queryClient.invalidateQueries({ queryKey: ["stock-alerts-history"] });
      }, 2000);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to initiate manual check",
        variant: "destructive",
      });
    },
  });

  const alerts = data?.data || [];
  const activeCount = alerts.filter((a) => a.status === "active").length;
  const acknowledgedCount = alerts.filter((a) => a.status === "acknowledged").length;

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Stock Alerts</h1>
          <p className="text-muted-foreground">
            Monitor and manage inventory alerts
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => refetch()}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button
            variant="outline"
            onClick={() => manualCheckMutation.mutate()}
            disabled={manualCheckMutation.isPending}
          >
            <Search className="h-4 w-4 mr-2" />
            {manualCheckMutation.isPending ? "Checking..." : "Manual Check"}
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("history")}
          >
            View History
          </Button>
          <Button
            onClick={() => navigate("config")}
          >
            Configuration
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-2xl font-bold">
              {alerts.length}
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-2xl font-bold text-red-500">
              {activeCount}
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Acknowledged</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-2xl font-bold text-orange-500">
              {acknowledgedCount}
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Alerts</CardTitle>
          <CardDescription>
            Alerts that require attention
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StockAlertsList alerts={alerts} isLoading={isLoading} />
        </CardContent>
      </Card>
    </div>
  );
}

