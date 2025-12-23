import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Customer } from "@/models/data/customer.model";
import { getCustomers, syncCustomers } from "@/services/customer-service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, RefreshCw, Search, Users, Package } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { customersColumns, CustomerTableRow } from "@/components/feature-specific/crm/customers-columns";
import DailyDeliveriesPage from "../deliveries/daily-deliveries-page";

export default function CustomersPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [minDeliveryRate, setMinDeliveryRate] = useState<number | undefined>();
  const [maxDeliveryRate, setMaxDeliveryRate] = useState<number | undefined>();

  const syncMut = useMutation({
    mutationFn: () => syncCustomers(),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast({
        title: "Sync completed",
        description: `Synced ${res.data.synced} of ${res.data.total} orders.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Sync failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

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

  // Transform data for table
  const tableData: CustomerTableRow[] = 
    data?.data?.customers?.map((item: { customer: Customer; delivery_rate: number }) => ({
      customer: item.customer,
      delivery_rate: item.delivery_rate,
    })) || [];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">CRM</h1>
        </div>
        <Button
          variant="outline"
          onClick={() => syncMut.mutate()}
          disabled={syncMut.isPending}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${syncMut.isPending ? "animate-spin" : ""}`} />
          {syncMut.isPending ? "Syncing..." : "Sync Customers"}
        </Button>
      </div>

      <Tabs defaultValue="customers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="customers" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Customers
          </TabsTrigger>
          <TabsTrigger value="deliveries" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Daily Deliveries
          </TabsTrigger>
        </TabsList>

        <TabsContent value="customers" className="space-y-4">
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

          {/* Customers Table */}
          {isLoading ? (
            <div className="text-center py-8">Loading customers...</div>
          ) : tableData.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No customers found.</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <DataTable
                  columns={customersColumns}
                  data={tableData}
                  searchColumn="customer.phone"
                  paginationMeta={
                    data?.data?.pagination
                      ? {
                          total: data.data.pagination.total,
                          per_page: data.data.pagination.limit,
                          current_page: data.data.pagination.page,
                          total_pages: data.data.pagination.total_pages || Math.ceil(
                            data.data.pagination.total / data.data.pagination.limit
                          ),
                        }
                      : undefined
                  }
                  onPageChange={(newPage) => setPage(newPage + 1)}
                  currentPage={page - 1}
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="deliveries">
          <DailyDeliveriesPage />
        </TabsContent>
      </Tabs>
    </div>
  );
}

