import { RootState } from "@/app/store";
import AppBarBackButton from "@/components/common/app-bar-back-button";
import { CommissionStatisticsCards } from "@/components/feature-specific/company-affiliates/commission-statistics-cards";
import { commissionsTableColumns } from "@/components/feature-specific/company-affiliates/commissions-table-columns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTable } from "@/components/ui/data-table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Affiliate } from "@/models/data/affiliate/affiliate.model";
import {
    GetAllCommissionsParams,
    GetCompanyAffiliatesParams,
    UpdateAffiliateRequest,
    getCompanyAffiliates,
    getCompanyCommissions,
    updateAffiliate,
} from "@/services/affiliate-service";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DollarSign, Edit, Eye, FileCheck, MoreHorizontal, Power, PowerOff, Search, UserCheck, UserX, Users } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import * as z from "zod";

const updateAffiliateSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone is required"),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  is_active: z.boolean(),
  is_confirmed: z.boolean(),
});

type UpdateAffiliateFormValues = z.infer<typeof updateAffiliateSchema>;

export default function CompanyAffiliatesPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const company = useSelector((state: RootState) => state.company.company);
  const queryClient = useQueryClient();
  
  // Tab state
  const [activeTab, setActiveTab] = useState<"affiliates" | "commissions">("affiliates");
  
  // Affiliates state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingAffiliate, setEditingAffiliate] = useState<Affiliate | null>(null);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  
  // Commissions state
  const [commissionsPage, setCommissionsPage] = useState(1);
  const [commissionsStatusFilter, setCommissionsStatusFilter] = useState<string>("all");
  const [commissionsSearch, setCommissionsSearch] = useState("");
  const [commissionsSortBy, setCommissionsSortBy] = useState<"created_at" | "amount" | "status" | "affiliate_name">("created_at");
  const [commissionsSortOrder, setCommissionsSortOrder] = useState<"asc" | "desc">("desc");


  // Enhanced search that looks in multiple fields
  const queryParams: GetCompanyAffiliatesParams = {
    page: currentPage,
    limit: 20,
    search: searchTerm || undefined, // This will search in name, email, and phone
    status: statusFilter === "all" ? undefined : statusFilter,
  };

  const {
    data: affiliatesData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["company-affiliates", company?.ID, queryParams],
    queryFn: () => getCompanyAffiliates(company!.ID, queryParams),
    refetchOnWindowFocus: false,
    enabled: !!company?.ID,
  });

  // Commissions query params
  const commissionsQueryParams: GetAllCommissionsParams = {
    page: commissionsPage,
    limit: 20,
    status: commissionsStatusFilter === "all" ? undefined : commissionsStatusFilter,
    search: commissionsSearch || undefined,
    sort_by: commissionsSortBy,
    sort_order: commissionsSortOrder,
  };

  const {
    data: commissionsData,
    isLoading: commissionsLoading,
    error: commissionsError,
    refetch: refetchCommissions,
  } = useQuery({
    queryKey: ["company-commissions", company?.ID, commissionsQueryParams],
    queryFn: () => getCompanyCommissions(company!.ID, commissionsQueryParams),
    refetchOnWindowFocus: false,
    enabled: !!company?.ID && activeTab === "commissions",
  });

  const form = useForm<UpdateAffiliateFormValues>({
    resolver: zodResolver(updateAffiliateSchema),
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zip: "",
      is_active: true,
      is_confirmed: false,
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ affiliateId, data }: { affiliateId: number; data: UpdateAffiliateRequest }) =>
      updateAffiliate(company!.ID, affiliateId, data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Affiliate updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["company-affiliates"] });
      setUpdateDialogOpen(false);
      setEditingAffiliate(null);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update affiliate",
        variant: "destructive",
      });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ affiliateId, field, value }: { affiliateId: number; field: 'is_active' | 'is_confirmed'; value: boolean }) =>
      updateAffiliate(company!.ID, affiliateId, { [field]: value }),
    onSuccess: (_, variables) => {
      const action = variables.field === 'is_active' 
        ? (variables.value ? 'activated' : 'deactivated')
        : (variables.value ? 'confirmed' : 'unconfirmed');
      toast({
        title: "Success",
        description: `Affiliate ${action} successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ["company-affiliates"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update affiliate status",
        variant: "destructive",
      });
    },
  });

  if (error) {
    toast({
      title: "Error",
      description: "Failed to fetch affiliates",
      variant: "destructive",
    });
  }

  const affiliates = affiliatesData?.data?.affiliates || [];
  const pagination = affiliatesData?.data?.pagination;

  const handleEditAffiliate = (affiliate: Affiliate) => {
    setEditingAffiliate(affiliate);
    form.reset({
      full_name: affiliate.full_name,
      email: affiliate.email,
      phone: affiliate.phone,
      address: affiliate.address || "",
      city: affiliate.city || "",
      state: affiliate.state || "",
      zip: affiliate.zip || "",
      is_active: affiliate.is_active,
      is_confirmed: affiliate.is_confirmed,
    });
    setUpdateDialogOpen(true);
  };

  const onSubmitUpdate = (data: UpdateAffiliateFormValues) => {
    if (!editingAffiliate) return;
    updateMutation.mutate({ affiliateId: editingAffiliate.ID, data });
  };

  const handleToggleStatus = (affiliate: Affiliate, field: 'is_active' | 'is_confirmed') => {
    const newValue = !affiliate[field];
    toggleStatusMutation.mutate({ 
      affiliateId: affiliate.ID, 
      field, 
      value: newValue 
    });
  };

  if (!company) return null;

  const commissions = commissionsData?.data?.commissions || [];
  const commissionsStatistics = commissionsData?.data?.statistics;
  const commissionsPagination = commissionsData?.data?.pagination;

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* App Bar */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div className="flex gap-2 items-center text-xl">
            <AppBarBackButton destination="Menu" />
            {company.company_name} &gt; Affiliate Management
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => activeTab === "affiliates" ? refetch() : refetchCommissions()} 
              variant="outline"
            >
              Refresh
            </Button>
            <Button 
              onClick={() => navigate(`/company/${company.ID}/affiliate-applications`)}
              variant="outline"
            >
              <FileCheck className="mr-2 h-4 w-4" />
              Applications
            </Button>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "affiliates" | "commissions")}>
        <TabsList>
          <TabsTrigger value="affiliates" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Affiliates
          </TabsTrigger>
          <TabsTrigger value="commissions" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Commissions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="affiliates" className="space-y-4">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Affiliates</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="unconfirmed">Unconfirmed</SelectItem>
              </SelectContent>
            </Select>
          </div>

      {/* Update Affiliate Dialog */}
      <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Update Affiliate</DialogTitle>
            <DialogDescription>
              Edit affiliate information and settings.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitUpdate)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter email" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter phone number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter city" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter state" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="zip"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ZIP Code</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter ZIP code" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active Status</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Allow affiliate to earn commissions
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="is_confirmed"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Confirmed</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Affiliate account is verified
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setUpdateDialogOpen(false);
                    setEditingAffiliate(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "Updating..." : "Update Affiliate"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Content */}
      <Card>
        <CardHeader>
          <CardTitle>Affiliates Management</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <div>Loading affiliates...</div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox />
                  </TableHead>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="w-16">Quick Actions</TableHead>
                  <TableHead className="w-12">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {affiliates.length > 0 ? (
                  affiliates.map((affiliate) => (
                    <TableRow key={affiliate.ID}>
                      <TableCell>
                        <Checkbox />
                      </TableCell>
                      <TableCell className="font-medium">
                        {affiliate.full_name}
                      </TableCell>
                      <TableCell className="lowercase">
                        {affiliate.email}
                      </TableCell>
                      <TableCell>{affiliate.phone}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {affiliate.city && affiliate.state
                            ? `${affiliate.city}, ${affiliate.state}`
                            : affiliate.city || affiliate.state || "Not provided"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Badge variant={affiliate.is_active ? "default" : "secondary"}>
                            {affiliate.is_active ? "Active" : "Inactive"}
                          </Badge>
                          <Badge variant={affiliate.is_confirmed ? "default" : "destructive"}>
                            {affiliate.is_confirmed ? "Confirmed" : "Unconfirmed"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(affiliate.CreatedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleStatus(affiliate, 'is_active')}
                            disabled={toggleStatusMutation.isPending}
                            className="h-8 w-8 p-0"
                          >
                            {affiliate.is_active ? (
                              <PowerOff className="h-4 w-4 text-red-500" />
                            ) : (
                              <Power className="h-4 w-4 text-green-500" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleStatus(affiliate, 'is_confirmed')}
                            disabled={toggleStatusMutation.isPending}
                            className="h-8 w-8 p-0"
                          >
                            {affiliate.is_confirmed ? (
                              <UserX className="h-4 w-4 text-red-500" />
                            ) : (
                              <UserCheck className="h-4 w-4 text-green-500" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => navigator.clipboard.writeText(affiliate.slug)}
                            >
                              Copy affiliate slug
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => navigate(`${affiliate.ID}`)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleEditAffiliate(affiliate)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center">
                      No affiliates found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
          
          {/* Basic pagination */}
          {pagination && pagination.total_pages > 1 && (
            <div className="flex justify-between items-center mt-4">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage <= 1}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {pagination.total_pages}
              </span>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage >= pagination.total_pages}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
        </TabsContent>

        <TabsContent value="commissions" className="space-y-4">
          {/* Commissions Statistics Cards */}
          {commissionsStatistics && (
            <CommissionStatisticsCards statistics={commissionsStatistics} />
          )}

          {/* Filters */}
          <div className="flex gap-4 items-center flex-wrap">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by affiliate name or email..."
                value={commissionsSearch}
                onChange={(e) => setCommissionsSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={commissionsStatusFilter} onValueChange={setCommissionsStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Commissions</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="partially_paid">Partially Paid</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select 
              value={commissionsSortBy} 
              onValueChange={(v) => setCommissionsSortBy(v as typeof commissionsSortBy)}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">Date Created</SelectItem>
                <SelectItem value="amount">Amount</SelectItem>
                <SelectItem value="status">Status</SelectItem>
                <SelectItem value="affiliate_name">Affiliate Name</SelectItem>
              </SelectContent>
            </Select>

            <Select 
              value={commissionsSortOrder} 
              onValueChange={(v) => setCommissionsSortOrder(v as typeof commissionsSortOrder)}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Descending</SelectItem>
                <SelectItem value="asc">Ascending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Commissions Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Commissions</CardTitle>
            </CardHeader>
            <CardContent>
              {commissionsLoading ? (
                <div className="flex justify-center items-center h-32">
                  <div>Loading commissions...</div>
                </div>
              ) : commissionsError ? (
                <div className="flex justify-center items-center h-32 text-destructive">
                  <div>Failed to load commissions. Please try again.</div>
                </div>
              ) : (
                <>
                  <DataTable
                    columns={commissionsTableColumns}
                    data={commissions}
                    searchColumn="affiliate.full_name"
                    searchBar={false}
                  />
                  
                  {/* Pagination */}
                  {commissionsPagination && commissionsPagination.total_pages > 1 && (
                    <div className="flex justify-between items-center mt-4">
                      <Button
                        variant="outline"
                        onClick={() => setCommissionsPage(commissionsPage - 1)}
                        disabled={commissionsPage <= 1}
                      >
                        Previous
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        Page {commissionsPage} of {commissionsPagination.total_pages} ({commissionsPagination.total_count} total)
                      </span>
                      <Button
                        variant="outline"
                        onClick={() => setCommissionsPage(commissionsPage + 1)}
                        disabled={commissionsPage >= commissionsPagination.total_pages}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Update Affiliate Dialog - moved outside tabs */}
      <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Update Affiliate</DialogTitle>
            <DialogDescription>
              Edit affiliate information and settings.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitUpdate)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter email" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter phone number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter city" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter state" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="zip"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ZIP Code</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter ZIP code" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active Status</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Allow affiliate to earn commissions
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="is_confirmed"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Confirmed</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Affiliate account is verified
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setUpdateDialogOpen(false);
                    setEditingAffiliate(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "Updating..." : "Update Affiliate"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 