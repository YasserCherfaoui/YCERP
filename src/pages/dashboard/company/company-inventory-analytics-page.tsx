import { RootState } from "@/app/store";
import AppBarBackButton from "@/components/common/app-bar-back-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import { Combobox } from "@/components/ui/combobox-standalone";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import {
  InventoryItem,
  InventoryItemTransactionLog,
} from "@/models/data/inventory.model";
import {
  getCompanyInventory,
  getCompanyInventoryTransactionLogs,
} from "@/services/inventory-service";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { DateRange } from "react-day-picker";
import { useSelector } from "react-redux";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    // The payload[0].payload contains the full log data for the point
    const log = payload[0].payload;
    return (
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg p-4 min-w-[220px]">
        <div className="font-semibold text-sm mb-2">{label}</div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              Transaction Type:
            </span>
            <span className="font-medium text-sm">{log.transaction_type}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              Reference Type:
            </span>
            <span className="font-medium text-sm">{log.reference_type}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              Quantity Before:
            </span>
            <span className="font-medium text-sm">{log.quantity_before}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              Quantity After:
            </span>
            <span className="font-medium text-sm">{log.quantity_after}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Change:</span>
            <span className="font-medium text-sm">
              {log.quantity_change > 0 ? "+" : ""}
              {log.quantity_change}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
}

export default function CompanyInventoryAnalyticsPage() {
  const company = useSelector((state: RootState) => state.company.company);
  // Use string for selectedItemId for Combobox compatibility
  const [selectedItemId, setSelectedItemId] = useState<string>("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  // Fetch inventory items
  const { data: inventoryData, isLoading: inventoryLoading } = useQuery({
    queryKey: ["company-inventory", company?.ID],
    queryFn: () => getCompanyInventory(company?.ID ?? 0),
    enabled: !!company,
  });

  // Fetch transaction logs
  const { data: logsData, isLoading: logsLoading } = useQuery({
    queryKey: ["company-inventory-logs", company?.ID],
    queryFn: () => getCompanyInventoryTransactionLogs(company?.ID ?? 0),
    enabled: !!company,
  });

  // Prepare inventory items for combobox
  const inventoryItems: InventoryItem[] = useMemo(() => {
    return inventoryData?.data?.items_with_cost || [];
  }, [inventoryData]);

  // Prepare combobox items
  const comboboxItems = useMemo(() =>
    inventoryItems
      .filter((item) => item.name.length > 0)
      .map((item) => ({ value: String(item.ID), label: item.name })),
    [inventoryItems]
  );

  // Prepare logs for the selected item and date range
  const filteredLogs: InventoryItemTransactionLog[] = useMemo(() => {
    if (!logsData?.data || !selectedItemId) return [];
    let logs = logsData.data.filter(
      (log) => String(log.inventory_item_id) === selectedItemId
    );
    if (dateRange && dateRange.from && dateRange.to) {
      // If single day, expand to full day
      const from = new Date(dateRange.from);
      const to = new Date(dateRange.to);
      if (
        from.getFullYear() === to.getFullYear() &&
        from.getMonth() === to.getMonth() &&
        from.getDate() === to.getDate()
      ) {
        from.setHours(0, 0, 0, 0);
        to.setHours(23, 59, 59, 999);
      }
      logs = logs.filter((log) => {
        const logDate = new Date(log.CreatedAt);
        return logDate >= from && logDate <= to;
      });
    }
    // Sort by date ascending
    logs.sort(
      (a, b) =>
        new Date(a.CreatedAt).getTime() - new Date(b.CreatedAt).getTime()
    );
    return logs;
  }, [logsData, selectedItemId, dateRange]);

  // Prepare chart data: show quantity_after for each log, but also keep all log fields for tooltip
  const chartData = useMemo(() => {
    return filteredLogs.map((log) => ({
      date: new Date(log.CreatedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      quantity: log.quantity_after,
      ...log,
    }));
  }, [filteredLogs]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <AppBarBackButton destination="Menu" />
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-semibold">
            {company?.company_name} &gt; Inventory Analytics
          </h1>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Inventory Item Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-center mb-6">
            <div className="w-full md:w-1/3">
              <Combobox
                items={comboboxItems}
                value={selectedItemId}
                onChange={setSelectedItemId}
                placeholder={inventoryLoading ? "Loading items..." : "Select inventory item"}
                searchPlaceholder="Search inventory item..."
                label="Inventory Item"
              />
            </div>
            <div className="w-full md:w-1/3">
              <DatePickerWithRange date={dateRange} onSelect={setDateRange} />
            </div>
          </div>
          <div className="w-full min-h-[350px]">
            {logsLoading ? (
              <div>Loading chart...</div>
            ) : !selectedItemId ? (
              <div className="text-muted-foreground">
                Select an inventory item to view analytics.
              </div>
            ) : chartData.length === 0 ? (
              <div className="text-muted-foreground">
                No data for the selected item and date range.
              </div>
            ) : (
              <ChartContainer className="min-h-[350px] w-full">
                <div className="mb-4 text-lg font-semibold text-center">
                  Quantity Change Over Time
                </div>
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 30, bottom: 40 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      label={{
                        value: "Date",
                        position: "insideBottom",
                        offset: -10,
                      }}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis
                      label={{
                        value: "Quantity",
                        angle: -90,
                        position: "insideLeft",
                        offset: 10,
                      }}
                      tick={{ fontSize: 12 }}
                    />
                    <Legend
                      verticalAlign="top"
                      height={36}
                      iconType="circle"
                      wrapperStyle={{ fontSize: 13 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="quantity"
                      name="Quantity"
                      stroke="hsl(var(--chart-1))"
                      strokeWidth={3}
                      dot={{ r: 2, stroke: "white", strokeWidth: 2 }}
                      activeDot={{ r: 8 }}
                    />
                    <Tooltip
                      content={<CustomTooltip />}
                      cursor={{
                        stroke: "hsl(var(--chart-1))",
                        strokeWidth: 1,
                        strokeDasharray: "4 2",
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
