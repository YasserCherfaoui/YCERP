import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Payment } from "@/models/data/affiliate/payment.model";
import { getPayments } from "@/services/affiliate-service";
import { useQuery } from "@tanstack/react-query";
import {
    AlertCircle,
    Calendar,
    ChevronLeft,
    ChevronRight,
    CreditCard,
    DollarSign,
    Filter,
    Loader2,
    Search,
    TrendingUp,
} from "lucide-react";
import { useState } from "react";

const paymentMethodColors: Record<string, string> = {
  "PayPal": "bg-blue-100 text-blue-800 border-blue-200",
  "Bank Transfer": "bg-green-100 text-green-800 border-green-200",
  "Check": "bg-purple-100 text-purple-800 border-purple-200",
  "Wire Transfer": "bg-indigo-100 text-indigo-800 border-indigo-200",
  "Other": "bg-gray-100 text-gray-800 border-gray-200",
};

export default function AffiliatePaymentsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch payments with React Query
  const {
    data: paymentsResponse,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["affiliate-payments", currentPage, pageSize],
    queryFn: () =>
      getPayments({
        page: currentPage,
        limit: pageSize,
      }),
    placeholderData: (previousData) => previousData,
  });

  const payments = paymentsResponse?.data?.payments || [];
  const pagination = paymentsResponse?.data?.pagination;

  // Filter payments by search query (client-side)
  const filteredPayments = payments.filter((payment: Payment) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      payment.ID.toString().includes(query) ||
      payment.transaction_id?.toLowerCase().includes(query) ||
      payment.payment_method?.toLowerCase().includes(query) ||
      payment.amount.toString().includes(query) ||
      payment.notes?.toLowerCase().includes(query)
    );
  });

  // Calculate summary stats
  const totalReceived = payments
    .filter((p: Payment) => p.amount > 0)
    .reduce((sum: number, p: Payment) => sum + p.amount, 0);
  
  const totalReversals = payments
    .filter((p: Payment) => p.amount < 0)
    .reduce((sum: number, p: Payment) => sum + Math.abs(p.amount), 0);
  
  const netPayments = totalReceived - totalReversals;
  const paymentCount = payments.filter((p: Payment) => p.amount > 0).length;

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handlePageSizeChange = (value: string) => {
    setPageSize(parseInt(value));
    setCurrentPage(1);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-DZ", {
      style: "currency",
      currency: "DZD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getPaymentMethodBadgeColor = (method: string) => {
    return paymentMethodColors[method] || paymentMethodColors["Other"];
  };

  const isReversal = (payment: Payment) => {
    return payment.amount < 0 || payment.reversed_payment_id !== undefined;
  };

  if (error) {
    return (
      <div className="affiliate-theme min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Failed to Load Payments
              </h2>
              <p className="text-gray-600 mb-4">
                {error instanceof Error ? error.message : "An error occurred"}
              </p>
              <Button onClick={() => refetch()}>Try Again</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="affiliate-theme min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payments</h1>
          <p className="text-gray-600">
            View your payment history and transaction details.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="rounded-2xl shadow-md border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">
                Total Received
              </CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(totalReceived)}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                From {paymentCount} payment{paymentCount !== 1 ? "s" : ""}
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-md border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">
                Total Reversals
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(totalReversals)}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Reversed payments
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-md border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">
                Net Payments
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(netPayments)}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                After reversals
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-md border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">
                Latest Payment
              </CardTitle>
              <Calendar className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {payments.length > 0 ? formatDate(payments[0]?.payment_date || payments[0]?.CreatedAt) : "—"}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Most recent
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="rounded-2xl shadow-md border mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Search & Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="search" className="text-sm font-medium">
                  Search
                </Label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search by ID, transaction, method..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="pageSize" className="text-sm font-medium">
                  Items per page
                </Label>
                <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                  <SelectTrigger className="mt-1">
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

              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setCurrentPage(1);
                  }}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payments Table */}
        <Card className="rounded-2xl shadow-md border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment History
            </CardTitle>
            {pagination && (
              <p className="text-sm text-gray-600">
                Showing {((pagination.current_page - 1) * pagination.limit) + 1} to{" "}
                {Math.min(pagination.current_page * pagination.limit, pagination.total_count)} of{" "}
                {pagination.total_count} payments
              </p>
            )}
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="text-lg font-medium">Loading payments...</span>
                </div>
              </div>
            ) : filteredPayments.length === 0 ? (
              <div className="text-center py-12">
                <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No payments found
                </h3>
                <p className="text-gray-600">
                  {searchQuery
                    ? "Try adjusting your search criteria."
                    : "You haven't received any payments yet."}
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Payment ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Transaction ID</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPayments.map((payment) => (
                        <TableRow key={payment.ID}>
                          <TableCell className="font-medium">
                            #{payment.ID}
                          </TableCell>
                          <TableCell>
                            {formatDate(payment.payment_date || payment.CreatedAt)}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`font-medium ${
                                payment.amount >= 0
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {payment.amount >= 0 ? "+" : ""}
                              {formatCurrency(payment.amount)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={getPaymentMethodBadgeColor(payment.payment_method)}
                            >
                              {payment.payment_method}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {payment.transaction_id || "—"}
                          </TableCell>
                          <TableCell>
                            {isReversal(payment) ? (
                              <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
                                Reversal
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                                Payment
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {payment.notes || "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {pagination && pagination.total_pages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={!pagination.has_previous}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={!pagination.has_next}
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="text-sm text-gray-600">
                      Page {pagination.current_page} of {pagination.total_pages}
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 