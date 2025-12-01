import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getManagerOrderStatusCount } from "@/services/woocommerce-service";
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
    User,
    XCircle
} from "lucide-react";

interface ManagerStatusCardsProps {
  dateFrom?: string;
  dateTo?: string;
  wilaya?: string;
  shippingProvider?: string;
  companyId?: number;
  managerId?: number;
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
    icon: <Clock className="w-4 h-4" />,
  },
  packing: {
    bg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-800 dark:text-blue-200",
    border: "border-blue-300 dark:border-blue-600",
    bgDark: "bg-blue-900/30",
    textDark: "text-blue-200",
    borderDark: "border-blue-600",
    icon: <Package className="w-4 h-4" />,
  },
  dispaching: {
    bg: "bg-purple-100 dark:bg-purple-900/30",
    text: "text-purple-800 dark:text-purple-200",
    border: "border-purple-300 dark:border-purple-600",
    bgDark: "bg-purple-900/30",
    textDark: "text-purple-200",
    borderDark: "border-purple-600",
    icon: <Truck className="w-4 h-4" />,
  },
  deliviring: {
    bg: "bg-yellow-100 dark:bg-yellow-900/30",
    text: "text-yellow-800 dark:text-yellow-200",
    border: "border-yellow-300 dark:border-yellow-600",
    bgDark: "bg-yellow-900/30",
    textDark: "text-yellow-200",
    borderDark: "border-yellow-600",
    icon: <Car className="w-4 h-4" />,
  },
  delivered: {
    bg: "bg-green-100 dark:bg-green-900/30",
    text: "text-green-800 dark:text-green-200",
    border: "border-green-300 dark:border-green-600",
    bgDark: "bg-green-900/30",
    textDark: "text-green-200",
    borderDark: "border-green-600",
    icon: <CheckCircle className="w-4 h-4" />,
  },
  returning: {
    bg: "bg-orange-100 dark:bg-orange-900/30",
    text: "text-orange-800 dark:text-orange-200",
    border: "border-orange-300 dark:border-orange-600",
    bgDark: "bg-orange-900/30",
    textDark: "text-orange-200",
    borderDark: "border-orange-600",
    icon: <RotateCcw className="w-4 h-4" />,
  },
  returned: {
    bg: "bg-red-100 dark:bg-red-900/30",
    text: "text-red-800 dark:text-red-200",
    border: "border-red-300 dark:border-red-600",
    bgDark: "bg-red-900/30",
    textDark: "text-red-200",
    borderDark: "border-red-600",
    icon: <Undo2 className="w-4 h-4" />,
  },
  cancelled: {
    bg: "bg-slate-100 dark:bg-slate-800",
    text: "text-slate-800 dark:text-slate-200",
    border: "border-slate-300 dark:border-slate-600",
    bgDark: "bg-slate-800",
    textDark: "text-slate-200",
    borderDark: "border-slate-600",
    icon: <XCircle className="w-4 h-4" />,
  },
  relaunched: {
    bg: "bg-indigo-100 dark:bg-indigo-900/30",
    text: "text-indigo-800 dark:text-indigo-200",
    border: "border-indigo-300 dark:border-indigo-600",
    bgDark: "bg-indigo-900/30",
    textDark: "text-indigo-200",
    borderDark: "border-indigo-600",
    icon: <RotateCcw className="w-4 h-4" />,
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
  relaunched: "Relaunched",
};

export default function ManagerStatusCards({ 
  dateFrom, 
  dateTo, 
  wilaya, 
  shippingProvider, 
  companyId,
  managerId 
}: ManagerStatusCardsProps) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["manager-status-count", dateFrom, dateTo, wilaya, shippingProvider, companyId, managerId],
    queryFn: () =>
      getManagerOrderStatusCount({
        date_from: dateFrom,
        date_to: dateTo,
        wilaya: wilaya,
        shipping_provider: shippingProvider,
        company_id: companyId,
        manager_id: managerId,
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
        Failed to load manager status counts
      </div>
    );
  }

  const { managers } = data.data;

  if (managers.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No managers found with confirmed orders in the selected period.
      </div>
    );
  }

  return (
    <div className="w-full mb-6 space-y-6">
      {managers.map((manager) => {
        const totalOrders = manager.total_orders;
        
        return (
          <Card key={manager.manager_id} className="border-2 hover:shadow-lg transition-all duration-200">
            <CardHeader className="pb-3 bg-muted/50">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                <div className="flex-1">
                  <div>{manager.manager_name}</div>
                  <div className="text-sm font-normal text-muted-foreground">{manager.manager_email}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Total Confirmed</div>
                  <div className="text-2xl font-bold text-primary">{totalOrders.toLocaleString()}</div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-9 gap-3">
                {manager.status_counts.map((statusCount) => {
                  const percentage = totalOrders > 0 
                    ? ((statusCount.count / totalOrders) * 100).toFixed(1)
                    : "0.0";
                  const colors = STATUS_COLORS[statusCount.status] || STATUS_COLORS.unconfirmed;
                  const label = STATUS_LABELS[statusCount.status] || statusCount.status;

                  return (
                    <div
                      key={statusCount.status}
                      className={`${colors.border} border-2 rounded-lg p-3 ${colors.bg} hover:shadow-md transition-all`}
                    >
                      <div className={`flex items-center gap-1 mb-2 ${colors.text}`}>
                        {colors.icon}
                        <span className="text-xs font-semibold uppercase">{label}</span>
                      </div>
                      <div className="space-y-1">
                        <div className={`text-xl font-bold ${colors.text}`}>
                          {statusCount.count.toLocaleString()}
                        </div>
                        <div className={`text-xs font-medium ${colors.text} opacity-75`}>
                          {percentage}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}
      
      <div className="mt-6 p-4 bg-muted/50 rounded-lg">
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
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


