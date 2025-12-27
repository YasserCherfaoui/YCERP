import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Customer, CustomerStats } from "@/models/data/customer.model";
import { getCustomer, getCustomerStats, updateCustomer } from "@/services/customer-service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Phone, Mail, Calendar, Star, Package, ArrowLeft } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CustomerDetailPage() {
  const { phone, companyID } = useParams<{ phone: string; companyID: string }>();
  const companyId = companyID ? parseInt(companyID, 10) : undefined;
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [birthday, setBirthday] = useState<string>("");

  const { data, isLoading } = useQuery({
    queryKey: ["customer", companyId, phone],
    queryFn: () => getCustomer(phone!, companyId),
    enabled: !!phone && !!companyId,
  });

  const { data: statsData } = useQuery({
    queryKey: ["customer-stats", companyId, phone],
    queryFn: () => getCustomerStats(phone!, companyId),
    enabled: !!phone && !!companyId,
  });

  const updateMut = useMutation({
    mutationFn: (data: { birthday?: string }) => updateCustomer(phone!, data, companyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer", companyId, phone] });
      queryClient.invalidateQueries({ queryKey: ["customer-stats", companyId, phone] });
      setEditDialogOpen(false);
      toast({
        title: "Success",
        description: "Customer updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return <div className="container mx-auto p-6">Loading...</div>;
  }

  const customer: Customer | undefined = data?.data?.customer;
  const stats: CustomerStats | undefined = statsData?.data?.stats;

  if (!customer) {
    return <div className="container mx-auto p-6">Customer not found</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">
            {customer.first_name} {customer.last_name}
          </h1>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              window.location.href = `tel:${customer.phone}`;
            }}
          >
            <Phone className="h-4 w-4 mr-2" />
            Call
          </Button>
          <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">Edit</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Customer</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Birthday</Label>
                  <Input
                    type="date"
                    value={birthday || (customer.birthday ? new Date(customer.birthday).toISOString().split('T')[0] : "")}
                    onChange={(e) => setBirthday(e.target.value)}
                  />
                </div>
                <Button
                  onClick={() => updateMut.mutate({ birthday: birthday || undefined })}
                  disabled={updateMut.isPending}
                >
                  Save
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Info */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{customer.phone}</span>
            </div>
            {customer.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{customer.email}</span>
              </div>
            )}
            {customer.birthday && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>
                  {new Date(customer.birthday).toLocaleDateString()}
                  {(() => {
                    const today = new Date();
                    const bday = new Date(customer.birthday!);
                    bday.setFullYear(today.getFullYear());
                    const daysUntil = Math.ceil((bday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                    if (daysUntil === 0) return " (Today!)";
                    if (daysUntil > 0 && daysUntil <= 30) return ` (${daysUntil} days)`;
                    return "";
                  })()}
                </span>
              </div>
            )}
            {customer.name_history && customer.name_history.length > 0 && (
              <div>
                <div className="text-sm font-semibold">Name History</div>
                <div className="text-sm text-muted-foreground">
                  {customer.name_history.join(" • ")}
                </div>
              </div>
            )}
            {customer.address_history && customer.address_history.length > 0 && (
              <div>
                <div className="text-sm font-semibold">Address History</div>
                <div className="text-sm text-muted-foreground space-y-1">
                  {customer.address_history.map((addr, idx) => (
                    <div key={idx}>{addr}</div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats && (
              <>
                <div>
                  <div className="text-2xl font-bold">
                    {stats.delivery_rate.toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Delivery Rate</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xl font-semibold">{stats.total_orders}</div>
                    <div className="text-sm text-muted-foreground">Total Orders</div>
                  </div>
                  <div>
                    <div className="text-xl font-semibold">{stats.delivered_orders}</div>
                    <div className="text-sm text-muted-foreground">Delivered</div>
                  </div>
                </div>
                <div>
                  <div className="text-lg font-semibold">
                    {stats.average_order_value.toFixed(0)} DZD
                  </div>
                  <div className="text-sm text-muted-foreground">Avg Order Value</div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Recent Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data?.data?.recent_orders?.length > 0 ? (
            <div className="space-y-2">
              {data.data.recent_orders.map((order: any) => (
                <div
                  key={order.id}
                  className="flex justify-between items-center p-2 border rounded"
                >
                  <div>
                    <div className="font-medium">Order #{order.number}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{order.amount} DZD</div>
                    <div className="text-sm text-muted-foreground">{order.order_status}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No recent orders
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reviews */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Reviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          {customer.reviews && customer.reviews.length > 0 ? (
            <div className="space-y-2">
              {customer.reviews.map((review) => (
                <div key={review.ID} className="p-2 border rounded">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      {review.comment && (
                        <div className="mt-2 text-sm">{review.comment}</div>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(review.reviewed_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No reviews yet
            </div>
          )}
          <Button
            className="mt-4"
            onClick={() => navigate(`/company/${companyID}/crm/reviews/create?customer_phone=${customer.phone}`)}
          >
            Record Review
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

