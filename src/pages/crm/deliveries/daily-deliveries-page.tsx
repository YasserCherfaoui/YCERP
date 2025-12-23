import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { DailyDelivery } from "@/models/data/customer.model";
import { getDailyDeliveries } from "@/services/customer-service";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Phone, Package } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";

export default function DailyDeliveriesPage() {
  const { toast } = useToast();
  const [date, setDate] = useState<string>(
    format(new Date(), "yyyy-MM-dd")
  );

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["daily-deliveries", date],
    queryFn: () => getDailyDeliveries(date),
  });

  if (isError) {
    toast({
      title: "Error",
      description: (error as Error)?.message || "Failed to load deliveries",
      variant: "destructive",
    });
  }

  const deliveryData: DailyDelivery | undefined = data?.data;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Daily Deliveries</h1>
        <div className="flex gap-2">
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-40"
          />
          <Button onClick={() => refetch()}>Refresh</Button>
        </div>
      </div>

      {/* Stats Card */}
      {deliveryData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Delivery Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-2xl font-bold">{deliveryData.total_orders}</div>
                <div className="text-sm text-muted-foreground">Total Orders</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {deliveryData.unique_customers}
                </div>
                <div className="text-sm text-muted-foreground">Unique Customers</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{deliveryData.date}</div>
                <div className="text-sm text-muted-foreground">Date</div>
              </div>
            </div>
            <div className="mt-4 text-lg font-semibold">
              {deliveryData.total_orders} orders reached {deliveryData.unique_customers}{" "}
              clients today
            </div>
          </CardContent>
        </Card>
      )}

      {/* Deliveries by Customer */}
      {isLoading ? (
        <div className="text-center py-8">Loading deliveries...</div>
      ) : (
        <div className="space-y-4">
          {deliveryData?.deliveries?.map((delivery, idx) => (
            <Card key={idx}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    {delivery.customer_name || delivery.customer_phone}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      window.location.href = `tel:${delivery.customer_phone}`;
                    }}
                  >
                    Call
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">
                    Phone: {delivery.customer_phone}
                  </div>
                  <div className="text-sm font-semibold">
                    Orders: {delivery.orders.length}
                  </div>
                  <div className="space-y-1">
                    {delivery.orders.map((order) => (
                      <div
                        key={order.id}
                        className="flex justify-between items-center p-2 bg-muted rounded"
                      >
                        <div>
                          <div className="font-medium">Order #{order.order_number}</div>
                          <div className="text-sm text-muted-foreground">
                            {format(new Date(order.delivered_at), "PPp")}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{order.amount} DZD</div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-1"
                            onClick={() => {
                              // Navigate to review creation
                              window.location.href = `/crm/reviews/create?customer_phone=${delivery.customer_phone}&order_id=${order.id}`;
                            }}
                          >
                            Record Review
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

