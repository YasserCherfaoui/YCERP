import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    TooltipProps,
    XAxis,
    YAxis,
} from "recharts";

// Placeholder data - this will be replaced with data from the API
const placeholderData = [
  { name: "Jan", earnings: 4000 },
  { name: "Feb", earnings: 3000 },
  { name: "Mar", earnings: 5000 },
  { name: "Apr", earnings: 4500 },
  { name: "May", earnings: 6000 },
  { name: "Jun", earnings: 5500 },
];

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-popover p-2 text-sm shadow-sm text-popover-foreground">
        <p className="font-bold">{label}</p>
        <p className="text-primary">{`Earnings: $${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

export const AffiliateDashboardPage = () => {
  return (
    <div className="space-y-8">
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-sm border border-border rounded-lg p-6">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-lg">Total Paid Earnings</CardTitle>
            <CardDescription className="text-muted-foreground">
              The total amount of commissions paid out.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <p className="text-3xl font-bold">$12,345.67</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border border-border rounded-lg p-6">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-lg">Pending Payout</CardTitle>
            <CardDescription className="text-muted-foreground">
              Commissions approved but not yet paid.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <p className="text-3xl font-bold">$1,234.56</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border border-border rounded-lg p-6">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-lg">Total Referrals</CardTitle>
            <CardDescription className="text-muted-foreground">
              The total number of referred sales.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <p className="text-3xl font-bold">123</p>
          </CardContent>
        </Card>
      </div>
      <Card className="shadow-sm border border-border rounded-lg p-6">
        <CardHeader className="p-0 mb-4">
          <CardTitle className="text-xl">Commissions Over Time</CardTitle>
          <CardDescription className="text-muted-foreground">
            Your commission earnings over the last 6 months.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={placeholderData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsla(var(--primary), 0.1)' }}/>
              <Legend />
              <Line type="monotone" dataKey="earnings" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}; 