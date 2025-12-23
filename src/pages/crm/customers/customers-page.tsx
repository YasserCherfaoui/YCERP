import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Customer } from "@/models/data/customer.model";
import { getCustomers } from "@/services/customer-service";
import { useQuery } from "@tanstack/react-query";
import { Search, User } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CustomersPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [minDeliveryRate, setMinDeliveryRate] = useState<number | undefined>();
  const [maxDeliveryRate, setMaxDeliveryRate] = useState<number | undefined>();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["customers", page, search, minDeliveryRate, maxDeliveryRate],
    queryFn: () =>
      getCustomers({
        page,
        limit: 20,
        search: search || undefined,
        min_delivery_rate: minDeliveryRate,
        max_delivery_rate: maxDeliveryRate,
      }),
  });

  if (isError) {
    toast({
      title: "Error",
      description: (error as Error)?.message || "Failed to load customers",
      variant: "destructive",
    });
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Customers</h1>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by phone, name, or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Input
              type="number"
              placeholder="Min delivery rate %"
              value={minDeliveryRate || ""}
              onChange={(e) =>
                setMinDeliveryRate(
                  e.target.value ? parseFloat(e.target.value) : undefined
                )
              }
              className="w-40"
            />
            <Input
              type="number"
              placeholder="Max delivery rate %"
              value={maxDeliveryRate || ""}
              onChange={(e) =>
                setMaxDeliveryRate(
                  e.target.value ? parseFloat(e.target.value) : undefined
                )
              }
              className="w-40"
            />
          </div>
        </CardContent>
      </Card>

      {/* Customers List */}
      {isLoading ? (
        <div className="text-center py-8">Loading customers...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.data?.customers?.map(
            (item: { customer: Customer; delivery_rate: number }) => {
              const customer = item.customer;
              return (
                <Card
                  key={customer.phone}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => navigate(`/crm/customers/${customer.phone}`)}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      {customer.first_name} {customer.last_name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <span className="text-sm text-muted-foreground">Phone:</span>{" "}
                      {customer.phone}
                    </div>
                    {customer.email && (
                      <div>
                        <span className="text-sm text-muted-foreground">Email:</span>{" "}
                        {customer.email}
                      </div>
                    )}
                    <div>
                      <span className="text-sm text-muted-foreground">
                        Delivery Rate:
                      </span>{" "}
                      <span
                        className={
                          item.delivery_rate >= 80
                            ? "text-green-600 font-semibold"
                            : item.delivery_rate >= 50
                            ? "text-yellow-600 font-semibold"
                            : "text-red-600 font-semibold"
                        }
                      >
                        {item.delivery_rate.toFixed(1)}%
                      </span>
                    </div>
                    {customer.birthday && (
                      <div>
                        <span className="text-sm text-muted-foreground">Birthday:</span>{" "}
                        {new Date(customer.birthday).toLocaleDateString()}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            }
          )}
        </div>
      )}

      {/* Pagination */}
      {data?.data?.pagination && data.data.pagination.total > 0 && (
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={() => setPage(page - 1)}
            disabled={page <= 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {Math.ceil(data.data.pagination.total / 20)} (
            {data.data.pagination.total} total)
          </span>
          <Button
            variant="outline"
            onClick={() => setPage(page + 1)}
            disabled={page >= Math.ceil(data.data.pagination.total / 20)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

