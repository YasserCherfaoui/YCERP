import { RootState } from "@/app/store";
import { StockAlertsHistoryList } from "@/components/feature-specific/stock-alerts/stock-alerts-history-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertStatus } from "@/models/data/stock-alert.model";
import { getAlertHistory } from "@/services/stock-alerts-service";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

export default function ModeratorStockAlertsHistoryPage() {
  const navigate = useNavigate();
  const company = useSelector((state: RootState) => state.user.company);
  const [statusFilter, setStatusFilter] = useState<AlertStatus | "all">("all");

  if (!company) return null;

  const { data, isLoading } = useQuery({
    queryKey: ["stock-alerts-history", company.ID, statusFilter],
    queryFn: () =>
      getAlertHistory({
        company_id: company.ID,
        status: statusFilter === "all" ? undefined : statusFilter,
      }),
    enabled: !!company,
  });

  const alerts = data?.data || [];

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Alert History</h1>
            <p className="text-muted-foreground">
              View past and resolved alerts
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as AlertStatus | "all")}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="acknowledged">Acknowledged</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Alert History</CardTitle>
          <CardDescription>
            Historical record of all inventory alerts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StockAlertsHistoryList alerts={alerts} isLoading={isLoading} />
        </CardContent>
      </Card>
    </div>
  );
}

