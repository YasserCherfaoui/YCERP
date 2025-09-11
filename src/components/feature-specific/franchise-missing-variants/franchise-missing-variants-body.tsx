import { RootState } from "@/app/store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { useToast } from "@/hooks/use-toast";
import { MissingVariantRequestResponse } from "@/models/data/missing-variant.model";
import { PaginationMeta } from "@/models/responses/company-stats.model";
import { cancelMissingVariantRequest, getFranchiseMissingVariantRequests } from "@/services/missing-variants-service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useSelector } from "react-redux";
import { createFranchiseMissingVariantsColumns } from "./franchise-missing-variants-columns";

export default function FranchiseMissingVariantsBody() {
  const franchise = useSelector((state: RootState) => state.franchise.franchise);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  
  if (!franchise) return null;

  const { data: requestsData, isLoading } = useQuery({
    queryKey: ["franchise-missing-variants", franchise.ID, currentPage, pageSize],
    queryFn: () => getFranchiseMissingVariantRequests({
      page: currentPage + 1, // Convert 0-based to 1-based for API
      limit: pageSize,
    }),
    enabled: !!franchise,
  });

  const requests = requestsData?.data?.requests || [];
  
  // Convert API pagination format to DataTable format
  const paginationMeta: PaginationMeta | undefined = requestsData?.data?.pagination ? {
    total_items: requestsData.data.pagination.total,
    total_pages: requestsData.data.pagination.total_pages,
    current_page: requestsData.data.pagination.page,
    per_page: requestsData.data.pagination.limit,
  } : undefined;
  
  // Cancel request mutation
  const { mutate: cancelRequestMutation, isPending: isCancelling } = useMutation({
    mutationFn: cancelMissingVariantRequest,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Request cancelled successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["franchise-missing-variants"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to cancel request",
        variant: "destructive",
      });
    },
  });

  // Handle cancel request
  const handleCancelRequest = (request: MissingVariantRequestResponse) => {
    if (window.confirm(`Are you sure you want to cancel the request for ${request.product_name}?`)) {
      cancelRequestMutation(request.id);
    }
  };

  // Create columns with cancel functionality
  const columns = createFranchiseMissingVariantsColumns({
    onCancel: handleCancelRequest,
  });
  
  // Calculate summary stats
  const pendingCount = requests.filter(r => r.status === "pending").length;
  const fulfilledCount = requests.filter(r => r.status === "fulfilled").length;
  const cancelledCount = requests.filter(r => r.status === "cancelled").length;

  if (isLoading) {
    return <div>Loading missing variant requests...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pendingCount}</div>
            <CardDescription>Awaiting fulfillment</CardDescription>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Fulfilled Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{fulfilledCount}</div>
            <CardDescription>Completed requests</CardDescription>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Cancelled Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{cancelledCount}</div>
            <CardDescription>Cancelled requests</CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Missing Variant Requests</CardTitle>
          <CardDescription>
            Track your missing variant requests and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No missing variant requests found. Click "Report Missing Variant" to create your first request.
            </div>
          ) : (
            <DataTable
              data={requests}
              searchColumn="product_name"
              columns={columns}
              paginationMeta={paginationMeta}
              onPageChange={setCurrentPage}
              currentPage={currentPage}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
