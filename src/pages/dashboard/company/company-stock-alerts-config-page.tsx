import { RootState } from "@/app/store";
import { StockAlertConfigForm } from "@/components/feature-specific/stock-alerts/stock-alert-config-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { AlertConfigFormData } from "@/schemas/stock-alerts";
import { getAlertConfig, saveAlertConfig } from "@/services/stock-alerts-service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

export default function CompanyStockAlertsConfigPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const company = useSelector((state: RootState) => state.company.company);

  if (!company) return null;

  const { data, isLoading } = useQuery({
    queryKey: ["stock-alert-config", "company", company.ID],
    queryFn: () => getAlertConfig("company", company.ID),
    enabled: !!company,
  });

  const saveMutation = useMutation({
    mutationFn: (formData: AlertConfigFormData) => {
      // Parse email_recipients if it's a string
      const emailRecipients = typeof formData.email_recipients === 'string'
        ? JSON.parse(formData.email_recipients)
        : formData.email_recipients;

      return saveAlertConfig({
        location_type: "company",
        location_id: company.ID,
        low_stock_threshold: formData.low_stock_threshold,
        reorder_point: formData.reorder_point,
        overstock_threshold: formData.overstock_threshold,
        enable_email_alerts: formData.enable_email_alerts,
        enable_in_app_alerts: formData.enable_in_app_alerts,
        email_recipients: emailRecipients,
      });
    },
    onSuccess: () => {
      toast({
        title: "Configuration saved",
        description: "Stock alert settings have been updated successfully.",
      });
      queryClient.invalidateQueries({
        queryKey: ["stock-alert-config", "company", company.ID],
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save configuration",
        variant: "destructive",
      });
    },
  });

  const config = data?.data;
  const emailRecipients = config?.email_recipients
    ? typeof config.email_recipients === 'string'
      ? JSON.parse(config.email_recipients)
      : config.email_recipients
    : [];

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Alert Configuration</h1>
          <p className="text-muted-foreground">
            Configure stock alert thresholds and notifications
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Stock Alert Settings</CardTitle>
          <CardDescription>
            Set thresholds for low stock, reorder points, and overstock alerts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div>Loading configuration...</div>
          ) : (
            <StockAlertConfigForm
              defaultValues={{
                location_type: "company",
                location_id: company.ID,
                low_stock_threshold: config?.low_stock_threshold ?? 10,
                reorder_point: config?.reorder_point ?? 20,
                overstock_threshold: config?.overstock_threshold ?? null,
                enable_email_alerts: config?.enable_email_alerts ?? true,
                enable_in_app_alerts: config?.enable_in_app_alerts ?? true,
                email_recipients: emailRecipients,
              }}
              onSubmit={(data) => saveMutation.mutate(data)}
              submitting={saveMutation.isPending}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

