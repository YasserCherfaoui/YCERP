import { RootState } from "@/app/store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import { Input } from "@/components/ui/input";
import { totalsByCategory, totalsByMonth } from "@/services/expense-reports-service";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

export default function FranchiseExpensesReportsPage() {
  const franchise = useSelector((state: RootState) => state.franchise.franchise);
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  const franchiseId = franchise?.ID ?? 0;

  const params = useMemo(() => ({
    franchise_id: franchiseId,
    date_from: dateFrom,
    date_to: dateTo,
  }), [franchiseId, dateFrom, dateTo]);

  const monthQuery = useQuery({
    queryKey: ["franchise-expense-totals-months", params],
    queryFn: async () => (await totalsByMonth(params)).data,
    enabled: Boolean(franchiseId && dateFrom && dateTo),
  });
  const categoryQuery = useQuery({
    queryKey: ["franchise-expense-totals-categories", params],
    queryFn: async () => (await totalsByCategory(params)).data,
    enabled: Boolean(franchiseId && dateFrom && dateTo),
  });

  if (!franchise) {
    return <div>Loading franchise...</div>;
  }

  return (
    <div className="space-y-4 p-4">
      <Card className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div>
          <label className="text-sm">From</label>
          <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        </div>
        <div>
          <label className="text-sm">To</label>
          <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        </div>
        <div>
          <Button variant="outline" onClick={() => { /* triggers queries via state change */ }}>Refresh</Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <h3 className="font-semibold mb-2">Totals by Month</h3>
          {monthQuery.isLoading && <div>Loading…</div>}
          {monthQuery.isError && <div className="text-red-500">{(monthQuery.error as Error)?.message}</div>}
          {monthQuery.data && monthQuery.data.rows.length > 0 && (
            <ChartContainer>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={monthQuery.data.rows} margin={{ left: 8, right: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(v: number) => [`${(v/100).toFixed(2)} DZD`, "Total"]} />
                  <Bar dataKey="total" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}
        </Card>
        <Card className="p-4">
          <h3 className="font-semibold mb-2">Totals by Category</h3>
          {categoryQuery.isLoading && <div>Loading…</div>}
          {categoryQuery.isError && <div className="text-red-500">{(categoryQuery.error as Error)?.message}</div>}
          {categoryQuery.data && categoryQuery.data.rows.length > 0 && (
            <ChartContainer>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={categoryQuery.data.rows} margin={{ left: 8, right: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip formatter={(v: number) => [`${(v/100).toFixed(2)} DZD`, "Total"]} />
                  <Bar dataKey="total" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}
        </Card>
      </div>
    </div>
  );
}












