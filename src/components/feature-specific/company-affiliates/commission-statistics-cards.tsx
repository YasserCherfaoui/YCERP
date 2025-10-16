import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CommissionStatistics } from "@/services/affiliate-service";
import {
    BadgeCheck,
    Banknote,
    CircleDollarSign,
    Clock,
    TrendingUp,
    Wallet
} from "lucide-react";

interface CommissionStatisticsCardsProps {
  statistics: CommissionStatistics;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-DZ", {
    style: "currency",
    currency: "DZD",
    maximumFractionDigits: 0,
  }).format(amount);
};

export function CommissionStatisticsCards({
  statistics,
}: CommissionStatisticsCardsProps) {
  const statsCards = [
    {
      title: "Total Commissions",
      value: formatCurrency(statistics.totals.total_amount),
      description: `${statistics.total_count} commissions`,
      icon: CircleDollarSign,
      iconColor: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Total Paid",
      value: formatCurrency(statistics.totals.total_paid_amount),
      description: `${statistics.by_status.paid || 0} paid commissions`,
      icon: BadgeCheck,
      iconColor: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Unpaid Amount",
      value: formatCurrency(statistics.totals.unpaid_amount),
      description: "Remaining to pay",
      icon: Wallet,
      iconColor: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      title: "Pending",
      value: formatCurrency(statistics.totals.pending_amount),
      description: `${statistics.by_status.pending || 0} pending`,
      icon: Clock,
      iconColor: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      title: "Approved",
      value: formatCurrency(statistics.totals.approved_amount),
      description: `${statistics.by_status.approved || 0} ready to pay`,
      icon: TrendingUp,
      iconColor: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Partially Paid",
      value: formatCurrency(statistics.amounts.partially_paid?.total_amount || 0),
      description: `${statistics.by_status.partially_paid || 0} commissions`,
      icon: Banknote,
      iconColor: "text-indigo-600",
      bgColor: "bg-indigo-100",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {statsCards.map((card, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <div className={`p-2 rounded-lg ${card.bgColor}`}>
              <card.icon className={`h-4 w-4 ${card.iconColor}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function CommissionStatusSummary({
  statistics,
}: CommissionStatisticsCardsProps) {
  const statusItems = [
    {
      label: "Pending",
      count: statistics.by_status.pending || 0,
      color: "bg-yellow-500",
    },
    {
      label: "Approved",
      count: statistics.by_status.approved || 0,
      color: "bg-purple-500",
    },
    {
      label: "Paid",
      count: statistics.by_status.paid || 0,
      color: "bg-green-500",
    },
    {
      label: "Partially Paid",
      count: statistics.by_status.partially_paid || 0,
      color: "bg-indigo-500",
    },
    {
      label: "Cancelled",
      count: statistics.by_status.cancelled || 0,
      color: "bg-red-500",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Commission Status Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {statusItems.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${item.color}`} />
                <span className="text-sm">{item.label}</span>
              </div>
              <span className="text-sm font-semibold">{item.count}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

