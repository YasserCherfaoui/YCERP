import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getOrderStatusCount } from "@/services/woocommerce-service";
import { useQuery } from "@tanstack/react-query";
import {
    Car,
    CheckCircle,
    Clock,
    Loader2,
    Package,
    RotateCcw,
    Truck,
    Undo2,
    XCircle
} from "lucide-react";

interface OrderStatusCardsProps {
  dateFrom?: string;
  dateTo?: string;
  wilaya?: string;
  shippingProvider?: string;
}

const STATUS_COLORS: Record<string, { 
  bg: string; 
  text: string; 
  border: string; 
  bgDark: string; 
  textDark: string; 
  borderDark: string;
  icon: React.ReactNode;
}> = {
  unconfirmed: {
    bg: "bg-gray-100 dark:bg-gray-800",
    text: "text-gray-800 dark:text-gray-200",
    border: "border-gray-300 dark:border-gray-600",
    bgDark: "bg-gray-800",
    textDark: "text-gray-200",
    borderDark: "border-gray-600",
    icon: <Clock className="w-5 h-5" />,
  },
  packing: {
    bg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-800 dark:text-blue-200",
    border: "border-blue-300 dark:border-blue-600",
    bgDark: "bg-blue-900/30",
    textDark: "text-blue-200",
    borderDark: "border-blue-600",
    icon: <Package className="w-5 h-5" />,
  },
  dispaching: {
    bg: "bg-purple-100 dark:bg-purple-900/30",
    text: "text-purple-800 dark:text-purple-200",
    border: "border-purple-300 dark:border-purple-600",
    bgDark: "bg-purple-900/30",
    textDark: "text-purple-200",
    borderDark: "border-purple-600",
    icon: <Truck className="w-5 h-5" />,
  },
  deliviring: {
    bg: "bg-yellow-100 dark:bg-yellow-900/30",
    text: "text-yellow-800 dark:text-yellow-200",
    border: "border-yellow-300 dark:border-yellow-600",
    bgDark: "bg-yellow-900/30",
    textDark: "text-yellow-200",
    borderDark: "border-yellow-600",
    icon: <Car className="w-5 h-5" />,
  },
  delivered: {
    bg: "bg-green-100 dark:bg-green-900/30",
    text: "text-green-800 dark:text-green-200",
    border: "border-green-300 dark:border-green-600",
    bgDark: "bg-green-900/30",
    textDark: "text-green-200",
    borderDark: "border-green-600",
    icon: <CheckCircle className="w-5 h-5" />,
  },
  returning: {
    bg: "bg-orange-100 dark:bg-orange-900/30",
    text: "text-orange-800 dark:text-orange-200",
    border: "border-orange-300 dark:border-orange-600",
    bgDark: "bg-orange-900/30",
    textDark: "text-orange-200",
    borderDark: "border-orange-600",
    icon: <RotateCcw className="w-5 h-5" />,
  },
  returned: {
    bg: "bg-red-100 dark:bg-red-900/30",
    text: "text-red-800 dark:text-red-200",
    border: "border-red-300 dark:border-red-600",
    bgDark: "bg-red-900/30",
    textDark: "text-red-200",
    borderDark: "border-red-600",
    icon: <Undo2 className="w-5 h-5" />,
  },
  cancelled: {
    bg: "bg-slate-100 dark:bg-slate-800",
    text: "text-slate-800 dark:text-slate-200",
    border: "border-slate-300 dark:border-slate-600",
    bgDark: "bg-slate-800",
    textDark: "text-slate-200",
    borderDark: "border-slate-600",
    icon: <XCircle className="w-5 h-5" />,
  },
};

const STATUS_LABELS: Record<string, string> = {
  unconfirmed: "Unconfirmed",
  packing: "Packing",
  dispaching: "Dispatching",
  deliviring: "Delivering",
  delivered: "Delivered",
  returning: "Returning",
  returned: "Returned",
  cancelled: "Cancelled",
};

export default function OrderStatusCards({ dateFrom, dateTo, wilaya, shippingProvider }: OrderStatusCardsProps) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["order-status-count", dateFrom, dateTo, wilaya, shippingProvider],
    queryFn: () =>
      getOrderStatusCount({
        date_from: dateFrom,
        date_to: dateTo,
        wilaya: wilaya,
        shipping_provider: shippingProvider,
      }),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !data?.data) {
    return (
      <div className="text-center py-8 text-red-600">
        Failed to load order status counts
      </div>
    );
  }

  const { status_counts, total_orders } = data.data;

  return (
    <div className="w-full mb-6">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        {status_counts.map((statusCount) => {
          const percentage = total_orders > 0 
            ? ((statusCount.count / total_orders) * 100).toFixed(1)
            : "0.0";
          const colors = STATUS_COLORS[statusCount.status] || STATUS_COLORS.unconfirmed;
          const label = STATUS_LABELS[statusCount.status] || statusCount.status;

          return (
            <Card
              key={statusCount.status}
              className={`${colors.border} border-2 hover:shadow-lg transition-all duration-200 hover:scale-105 ${colors.bg} min-h-[120px]`}
            >
              <CardHeader className={`pb-3 ${colors.bg}`}>
                <CardTitle className={`text-lg font-bold flex items-center justify-center gap-2 ${colors.text} text-center uppercase tracking-wide`}>
                  {colors.icon}
                  {label}
                </CardTitle>
              </CardHeader>
              <CardContent className={`pt-2 pb-4 ${colors.bg} flex flex-col items-center`}>
                <div className="space-y-1 text-center">
                  <div className={`text-2xl font-bold ${colors.text}`}>
                    {statusCount.count.toLocaleString()}
                  </div>
                  <div className={`text-xs font-medium ${colors.text} opacity-75`}>
                    {percentage}% of total
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <div className="mt-6 p-4 bg-muted/50 rounded-lg">
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-medium text-muted-foreground">Total Orders:</span>
            <span className="font-bold text-lg text-primary">{total_orders.toLocaleString()}</span>
          </div>
          {data.data.date_from && (
            <div className="flex items-center gap-2">
              <span className="font-medium text-muted-foreground">From:</span>
              <span className="font-semibold">{data.data.date_from}</span>
            </div>
          )}
          {data.data.date_to && (
            <div className="flex items-center gap-2">
              <span className="font-medium text-muted-foreground">To:</span>
              <span className="font-semibold">{data.data.date_to}</span>
            </div>
          )}
          {data.data.wilaya && (
            <div className="flex items-center gap-2">
              <span className="font-medium text-muted-foreground">Wilaya:</span>
              <span className="font-semibold">{data.data.wilaya}</span>
            </div>
          )}
          {data.data.shipping_provider && (
            <div className="flex items-center gap-2">
              <span className="font-medium text-muted-foreground">Provider:</span>
              <span className="font-semibold">{data.data.shipping_provider}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

