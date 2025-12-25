import { CustomerTableRow, getCustomersColumns } from "@/components/feature-specific/crm/customers-columns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Customer } from "@/models/data/customer.model";
import { deleteCustomersWithZeroOrders, getCustomers, syncCustomers, updateSelectedCustomers } from "@/services/customer-service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Package, RefreshCw, Search, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DailyDeliveriesPage from "../deliveries/daily-deliveries-page";

export default function CustomersPage() {
  const navigate = useNavigate();
  const { companyID } = useParams<{ companyID: string }>();
  const companyId = companyID ? parseInt(companyID, 10) : undefined;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState("");
  const [minDeliveryRate, setMinDeliveryRate] = useState<number | undefined>();
  const [maxDeliveryRate, setMaxDeliveryRate] = useState<number | undefined>();
  const [sortBy, setSortBy] = useState<string>("updated_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [search, minDeliveryRate, maxDeliveryRate, limit, sortBy, sortOrder]);

  // Clear selection when page changes
  useEffect(() => {
    setSelectedRows([]);
  }, [page]);

  const syncMut = useMutation({
    mutationFn: () => syncCustomers(companyId),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["customers", companyId] });
      toast({
        title: "Sync completed",
        description: `Synced ${res.data?.synced || 0} of ${res.data?.total || 0} orders.`,
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
    queryKey: ["customers", companyId, page, limit, search, minDeliveryRate, maxDeliveryRate, sortBy, sortOrder],
    queryFn: () =>
      getCustomers({
        page,
        limit,
        search: search || undefined,
        min_delivery_rate: minDeliveryRate,
        max_delivery_rate: maxDeliveryRate,
        company_id: companyId,
        sort_by: sortBy,
        sort_order: sortOrder,
      }),
    enabled: !!companyId,
  });

  const updateSelectedMut = useMutation({
    mutationFn: (phones: string[]) => updateSelectedCustomers(phones, companyId),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["customers", companyId] });
      setSelectedRows([]);
      toast({
        title: "Update completed",
        description: `Updated ${res.data?.customers_processed || 0} customers. Synced ${res.data?.orders_synced || 0} orders.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteZeroOrdersMut = useMutation({
    mutationFn: () => deleteCustomersWithZeroOrders(companyId),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["customers", companyId] });
      toast({
        title: "Deletion completed",
        description: `Deleted ${res.data?.deleted || 0} customers with 0 orders.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Deletion failed",
        description: error.message,
        variant: "destructive",
      });
    },
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
        <div className="flex gap-2">
          {selectedRows.length > 0 && (
            <Button
              variant="default"
              onClick={() => updateSelectedMut.mutate(selectedRows)}
              disabled={updateSelectedMut.isPending}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${updateSelectedMut.isPending ? "animate-spin" : ""}`} />
              {updateSelectedMut.isPending ? "Updating..." : `Update Selected (${selectedRows.length})`}
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => syncMut.mutate()}
            disabled={syncMut.isPending}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${syncMut.isPending ? "animate-spin" : ""}`} />
            {syncMut.isPending ? "Syncing..." : "Sync All Customers"}
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              if (window.confirm("Are you sure you want to delete all customers with 0 orders? This action cannot be undone.")) {
                deleteZeroOrdersMut.mutate();
              }
            }}
            disabled={deleteZeroOrdersMut.isPending}
          >
            {deleteZeroOrdersMut.isPending ? "Deleting..." : "Delete Zero Orders"}
          </Button>
        </div>
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
                <div className="flex items-center gap-2">
                  <Label htmlFor="limit" className="whitespace-nowrap">Per page:</Label>
                  <Select value={limit.toString()} onValueChange={(value) => setLimit(parseInt(value, 10))}>
                    <SelectTrigger id="limit" className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <Label htmlFor="sort_by" className="whitespace-nowrap">Sort by:</Label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger id="sort_by" className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="updated_at">Updated Date</SelectItem>
                      <SelectItem value="created_at">Created Date</SelectItem>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="phone">Phone</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="total_orders">Total Orders</SelectItem>
                      <SelectItem value="delivered_orders">Delivered Orders</SelectItem>
                      <SelectItem value="delivery_rate">Delivery Rate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="sort_order" className="whitespace-nowrap">Order:</Label>
                  <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as "asc" | "desc")}>
                    <SelectTrigger id="sort_order" className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="desc">Descending</SelectItem>
                      <SelectItem value="asc">Ascending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
                  columns={getCustomersColumns(companyID)}
                  data={tableData}
                  searchColumn="customer.phone"
                  searchBar={false}
                  paginationMeta={
                    data?.data?.pagination
                      ? {
                          total_items: data.data.pagination.total,
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
                  selectedRows={selectedRows}
                  setSelectedRows={setSelectedRows}
                  getRowId={(row) => row.customer.phone}
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

