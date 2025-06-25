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
import { Commission, CommissionStatus } from "@/models/data/affiliate/commission.model";
import { getCommissions } from "@/services/affiliate-service";
import { useQuery } from "@tanstack/react-query";
import {
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    DollarSign,
    Filter,
    Loader2,
    Search,
    TrendingUp,
} from "lucide-react";
import { useState } from "react";

const statusColors: Record<CommissionStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  approved: "bg-blue-100 text-blue-800 border-blue-200",
  paid: "bg-green-100 text-green-800 border-green-200",
  partially_paid: "bg-orange-100 text-orange-800 border-orange-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

const statusLabels: Record<CommissionStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  paid: "Paid",
  partially_paid: "Partially Paid",
  cancelled: "Cancelled",
};

export default function AffiliateCommissionsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch commissions with React Query
  const {
    data: commissionsResponse,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["affiliate-commissions", currentPage, pageSize, statusFilter],
    queryFn: () =>
      getCommissions({
        page: currentPage,
        limit: pageSize,
        status: statusFilter || undefined,
      }),
    placeholderData: (previousData) => previousData, // Replaces keepPreviousData
  });

  const commissions = commissionsResponse?.data?.commissions || [];
  const pagination = commissionsResponse?.data?.pagination;

  // Filter commissions by search query (client-side)
  const filteredCommissions = commissions.filter((commission: Commission) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      commission.ID.toString().includes(query) ||
      commission.woo_order?.number?.toLowerCase().includes(query) ||
      commission.amount.toString().includes(query)
    );
  });

  // Calculate summary stats
  const totalEarnings = commissions.reduce((sum: number, c: Commission) => sum + c.amount, 0);
  const paidEarnings = commissions.reduce((sum: number, c: Commission) => sum + c.paid_amount, 0);
  const pendingEarnings = commissions
    .filter((c: Commission) => c.status === "pending" || c.status === "approved")
    .reduce((sum: number, c: Commission) => sum + (c.amount - c.paid_amount), 0);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value === "all" ? "" : value);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handlePageSizeChange = (value: string) => {
    setPageSize(parseInt(value));
    setCurrentPage(1); // Reset to first page when changing page size
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

  if (error) {
    return (
      <div className="affiliate-theme min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Failed to Load Commissions
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Commissions</h1>
          <p className="text-gray-600">
            Track your commission earnings and payment status.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="rounded-2xl shadow-md border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">
                Total Earnings
              </CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(totalEarnings)}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                From {commissions.length} commission{commissions.length !== 1 ? "s" : ""}
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-md border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">
                Paid Amount
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(paidEarnings)}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {paidEarnings > 0 ? 
                  `${((paidEarnings / totalEarnings) * 100).toFixed(1)}% of total` : 
                  "No payments received yet"
                }
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-md border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">
                Pending Earnings
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(pendingEarnings)}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Awaiting payment
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="rounded-2xl shadow-md border mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="search" className="text-sm font-medium">
                  Search
                </Label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search by ID, order, amount..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="status" className="text-sm font-medium">
                  Status
                </Label>
                <Select value={statusFilter || "all"} onValueChange={handleStatusFilterChange}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="partially_paid">Partially Paid</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
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
                    setStatusFilter("");
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

        {/* Commissions Table */}
        <Card className="rounded-2xl shadow-md border">
          <CardHeader>
            <CardTitle>Commission History</CardTitle>
            {pagination && (
              <p className="text-sm text-gray-600">
                Showing {((pagination.current_page - 1) * pagination.limit) + 1} to{" "}
                {Math.min(pagination.current_page * pagination.limit, pagination.total_count)} of{" "}
                {pagination.total_count} commissions
              </p>
            )}
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="text-lg font-medium">Loading commissions...</span>
                </div>
              </div>
            ) : filteredCommissions.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No commissions found
                </h3>
                <p className="text-gray-600">
                  {searchQuery || statusFilter
                    ? "Try adjusting your search or filter criteria."
                    : "You haven't earned any commissions yet."}
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Commission ID</TableHead>
                        <TableHead>Order</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Paid Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Remaining</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCommissions.map((commission) => (
                        <TableRow key={commission.ID}>
                          <TableCell className="font-medium">
                            #{commission.ID}
                          </TableCell>
                                                     <TableCell>
                             {commission.woo_order?.number || `Order #${commission.woo_order_id}`}
                           </TableCell>
                          <TableCell>
                            {formatDate(commission.CreatedAt)}
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(commission.amount)}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(commission.paid_amount)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={statusColors[commission.status]}
                            >
                              {statusLabels[commission.status]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {commission.amount > commission.paid_amount ? (
                              <span className="text-amber-600 font-medium">
                                {formatCurrency(commission.amount - commission.paid_amount)}
                              </span>
                            ) : (
                              <span className="text-green-600">—</span>
                            )}
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