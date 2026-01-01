import { RootState } from "@/app/store";
import { CustomerTableRow, getCustomersColumns } from "@/components/feature-specific/crm/customers-columns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Customer } from "@/models/data/customer.model";
import { createFranchiseCustomer, getFranchiseCustomers, syncFranchiseCustomers } from "@/services/customer-service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Plus, RefreshCw, Search, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function FranchiseCustomersPage() {
  const navigate = useNavigate();
  const franchise = useSelector((state: RootState) => state.franchise.franchise);
  const franchiseIdNum = franchise?.ID;
  const companyId = franchise?.company_id;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState("");
  const [minDeliveryRate, setMinDeliveryRate] = useState<number | undefined>();
  const [maxDeliveryRate, setMaxDeliveryRate] = useState<number | undefined>();
  const [sortBy, setSortBy] = useState<string>("updated_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    phone: "",
    first_name: "",
    last_name: "",
    email: "",
    birthday: "",
  });

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [search, minDeliveryRate, maxDeliveryRate, limit, sortBy, sortOrder]);

  const syncMut = useMutation({
    mutationFn: () => syncFranchiseCustomers(franchiseIdNum!, companyId),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["franchise-customers", franchiseIdNum, companyId] });
      toast({
        title: "Sync completed",
        description: `Synced ${res.data?.synced || 0} customers from sales.`,
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

  const createMut = useMutation({
    mutationFn: () => createFranchiseCustomer(franchiseIdNum!, {
      phone: newCustomer.phone,
      first_name: newCustomer.first_name,
      last_name: newCustomer.last_name,
      email: newCustomer.email,
      birthday: newCustomer.birthday || undefined,
    }, companyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["franchise-customers", franchiseIdNum, companyId] });
      setCreateDialogOpen(false);
      setNewCustomer({ phone: "", first_name: "", last_name: "", email: "", birthday: "" });
      toast({
        title: "Success",
        description: "Customer created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Create failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["franchise-customers", franchiseIdNum, companyId, page, limit, search, minDeliveryRate, maxDeliveryRate, sortBy, sortOrder],
    queryFn: () =>
      getFranchiseCustomers(franchiseIdNum!, {
        page,
        limit,
        search: search || undefined,
        min_delivery_rate: minDeliveryRate,
        max_delivery_rate: maxDeliveryRate,
        company_id: companyId,
        sort_by: sortBy,
        sort_order: sortOrder,
      }),
    enabled: !!franchiseIdNum,
  });

  if (!franchise) {
    return <div className="container mx-auto p-6">Franchise not found</div>;
  }

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
          <Button variant="outline" onClick={() => navigate("/myFranchise")}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Franchise CRM</h1>
        </div>
        <div className="flex gap-2">
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Customer
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Customer</DialogTitle>
                <DialogDescription>
                  Add a new customer to your franchise
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                    placeholder="Enter phone number"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    value={newCustomer.first_name}
                    onChange={(e) => setNewCustomer({ ...newCustomer, first_name: e.target.value })}
                    placeholder="Enter first name"
                  />
                </div>
                <div>
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    value={newCustomer.last_name}
                    onChange={(e) => setNewCustomer({ ...newCustomer, last_name: e.target.value })}
                    placeholder="Enter last name"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                    placeholder="Enter email"
                  />
                </div>
                <div>
                  <Label htmlFor="birthday">Birthday</Label>
                  <Input
                    id="birthday"
                    type="date"
                    value={newCustomer.birthday}
                    onChange={(e) => setNewCustomer({ ...newCustomer, birthday: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => createMut.mutate()}
                  disabled={createMut.isPending || !newCustomer.phone}
                >
                  {createMut.isPending ? "Creating..." : "Create Customer"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button
            variant="outline"
            onClick={() => syncMut.mutate()}
            disabled={syncMut.isPending || !franchiseIdNum}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${syncMut.isPending ? "animate-spin" : ""}`} />
            {syncMut.isPending ? "Syncing..." : "Sync Customers from Sales"}
          </Button>
        </div>
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
            <Button
              className="mt-4"
              onClick={() => syncMut.mutate()}
              disabled={syncMut.isPending || !franchiseIdNum}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${syncMut.isPending ? "animate-spin" : ""}`} />
              Sync Customers from Sales
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <DataTable
              columns={getCustomersColumns(companyId?.toString(), franchiseIdNum?.toString())}
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
              getRowId={(row) => row.customer.phone}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

