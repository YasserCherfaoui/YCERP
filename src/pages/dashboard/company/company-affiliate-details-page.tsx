import { RootState } from "@/app/store";
import AppBarBackButton from "@/components/common/app-bar-back-button";
import { AffiliateProBadge } from "@/components/feature-specific/affiliate/affiliate-pro-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Commission } from "@/models/data/affiliate/commission.model";
import {
    getAffiliateCommissions,
    getAffiliateDetails,
    recordAffiliatePayment,
    RecordPaymentRequest,
} from "@/services/affiliate-service";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, DollarSign, TrendingUp, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import * as z from "zod";

const recordPaymentSchema = z.object({
  amount: z.coerce.number().positive("Amount must be positive"),
  payment_method: z.string().min(1, "Payment method is required"),
  transaction_id: z.string().optional(),
  notes: z.string().optional(),
});

type RecordPaymentFormValues = z.infer<typeof recordPaymentSchema>;

export default function CompanyAffiliateDetailsPage() {
  const { toast } = useToast();
  const { affiliateID } = useParams<{ affiliateID: string }>();
  const company = useSelector((state: RootState) => state.company.company);
  const queryClient = useQueryClient();
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [commissionsStatusFilter, setCommissionsStatusFilter] = useState("all");
  const [commissionsPage, setCommissionsPage] = useState(1);

  const {
    data: affiliateData,
    isLoading: affiliateLoading,
    error: affiliateError,
  } = useQuery({
    queryKey: ["affiliate-details", company?.ID, affiliateID],
    queryFn: () => getAffiliateDetails(company!.ID, Number(affiliateID)),
    enabled: !!affiliateID && !!company?.ID,
  });

  const {
    data: commissionsData,
    isLoading: commissionsLoading,
  } = useQuery({
    queryKey: ["affiliate-commissions", company?.ID, affiliateID, commissionsStatusFilter, commissionsPage],
    queryFn: () =>
      getAffiliateCommissions(company!.ID, Number(affiliateID), {
        page: commissionsPage,
        limit: 20,
        status: commissionsStatusFilter === "all" ? undefined : commissionsStatusFilter,
      }),
    enabled: !!affiliateID && !!company?.ID,
  });

  const affiliate = affiliateData?.data;
  const commissions = commissionsData?.data?.commissions || [];
  const commissionsPagination = commissionsData?.data?.pagination;

  // Reset to page 1 when status filter changes
  useEffect(() => {
    setCommissionsPage(1);
  }, [commissionsStatusFilter]);

  const form = useForm<RecordPaymentFormValues>({
    resolver: zodResolver(recordPaymentSchema),
    defaultValues: {
      amount: 0,
      payment_method: "",
      transaction_id: "",
      notes: "",
    },
  });

  const recordPaymentMutation = useMutation({
    mutationFn: (data: RecordPaymentRequest) =>
      recordAffiliatePayment(company!.ID, Number(affiliateID), data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Payment recorded successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["affiliate-details", company?.ID] });
      queryClient.invalidateQueries({ queryKey: ["affiliate-commissions", company?.ID] });
      setPaymentDialogOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to record payment",
        variant: "destructive",
      });
    },
  });

  const onSubmitPayment = (data: RecordPaymentFormValues) => {
    recordPaymentMutation.mutate(data);
  };

  if (affiliateLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div>Loading affiliate details...</div>
      </div>
    );
  }

  if (affiliateError || !affiliate) {
    return (
      <div className="flex flex-col gap-4 p-4">
        <AppBarBackButton destination="Affiliates" />
        <div className="flex justify-center items-center h-64">
          <div>Affiliate not found</div>
        </div>
      </div>
    );
  }

  // Calculate totals
  const totalEarnings = commissions.reduce((sum, commission) => sum + commission.amount, 0);
  const totalPaid = commissions.reduce((sum, commission) => sum + commission.paid_amount, 0);
  const pendingAmount = totalEarnings - totalPaid;

  return (
    <div className="flex flex-col gap-6 p-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2 items-center text-xl">
          <AppBarBackButton destination="Affiliates" />
          {company?.company_name} &gt; Affiliates &gt; {affiliate.full_name}
        </div>
        <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
          <DialogTrigger asChild>
            <Button>Record Payment</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record Payment</DialogTitle>
              <DialogDescription>
                Record a payment for {affiliate.full_name}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmitPayment)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter amount" type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="payment_method"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Method</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select payment method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                          <SelectItem value="paypal">PayPal</SelectItem>
                          <SelectItem value="check">Check</SelectItem>
                          <SelectItem value="cash">Cash</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="transaction_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Transaction ID (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter transaction reference" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Enter any notes" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setPaymentDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={recordPaymentMutation.isPending}>
                    {recordPaymentMutation.isPending ? "Recording..." : "Record Payment"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Affiliate Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Affiliate Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Full Name</label>
              <p className="mt-1 text-sm text-foreground">{affiliate.full_name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <p className="mt-1 text-sm text-foreground">{affiliate.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Phone</label>
              <p className="mt-1 text-sm text-foreground">{affiliate.phone}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <div className="mt-1 flex gap-1">
                <Badge variant={affiliate.is_active ? "default" : "secondary"}>
                  {affiliate.is_active ? "Active" : "Inactive"}
                </Badge>
                <Badge variant={affiliate.is_confirmed ? "default" : "destructive"}>
                  {affiliate.is_confirmed ? "Confirmed" : "Unconfirmed"}
                </Badge>
                <AffiliateProBadge isPro={affiliate.is_pro} />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Joined</label>
              <p className="mt-1 text-sm text-foreground">
                {new Date(affiliate.CreatedAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Affiliate Slug</label>
              <p className="mt-1 text-sm text-foreground font-mono">{affiliate.slug}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalEarnings.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalPaid.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${pendingAmount.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Commissions Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Commissions</CardTitle>
            <Select value={commissionsStatusFilter} onValueChange={setCommissionsStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Commissions</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {commissionsLoading ? (
            <div className="flex justify-center items-center h-32">
              <div>Loading commissions...</div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Paid Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {commissions.length > 0 ? (
                  commissions.map((commission: Commission) => (
                    <TableRow key={commission.ID}>
                      <TableCell>#{commission.woo_order_id}</TableCell>
                      <TableCell>${commission.amount.toFixed(2)}</TableCell>
                      <TableCell>${commission.paid_amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            commission.status === "paid"
                              ? "default"
                              : commission.status === "pending"
                              ? "secondary"
                              : commission.status === "approved"
                              ? "default"
                              : "destructive"
                          }
                        >
                          {commission.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(commission.CreatedAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No commissions found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
          
          {/* Pagination */}
          {commissionsPagination && commissionsPagination.total_pages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCommissionsPage(commissionsPage - 1)}
                  disabled={!commissionsPagination.has_previous}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCommissionsPage(commissionsPage + 1)}
                  disabled={!commissionsPagination.has_next}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-sm text-muted-foreground">
                Page {commissionsPagination.current_page} of {commissionsPagination.total_pages}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 