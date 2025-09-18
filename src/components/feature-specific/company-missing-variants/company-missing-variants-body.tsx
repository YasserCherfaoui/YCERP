import { RootState } from "@/app/store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { useToast } from "@/hooks/use-toast";
import { MissingVariantRequestResponse } from "@/models/data/missing-variant.model";
import { PaginationMeta } from "@/models/responses/company-stats.model";
import { cancelMissingVariantRequest, getAllMissingVariantRequests } from "@/services/missing-variants-service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { createCompanyMissingVariantsColumns } from "./company-missing-variants-columns";
import FranchiseFilter from "./franchise-filter";

interface CompanyMissingVariantsBodyProps {
  onSelectionChange?: (requests: MissingVariantRequestResponse[]) => void;
}

export default function CompanyMissingVariantsBody({ onSelectionChange }: CompanyMissingVariantsBodyProps) {
  let company = useSelector((state: RootState) => state.company.company);
  const { pathname } = useLocation();
  if (pathname.includes("moderator")) {
    company = useSelector((state: RootState) => state.user.company);
  }
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [filterFranchiseId, setFilterFranchiseId] = useState<number | undefined>();
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  const [selectedRequestsCache, setSelectedRequestsCache] = useState<Map<string, MissingVariantRequestResponse>>(new Map());
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [selectedFranchiseId, setSelectedFranchiseId] = useState<number | undefined>();

  if (!company) return null;

  const { data: requestsData, isLoading } = useQuery({
    queryKey: ["company-missing-variants", company.ID, filterFranchiseId, currentPage, pageSize],
    queryFn: () => getAllMissingVariantRequests({ 
      franchise_id: filterFranchiseId,
      status: "pending", // Only show pending requests by default
      page: currentPage + 1, // Convert 0-based to 1-based for API
      limit: pageSize,
    }),
    enabled: !!company,
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
      queryClient.invalidateQueries({ queryKey: ["company-missing-variants"] });
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
    if (window.confirm(`Are you sure you want to cancel the request for ${request.product_name} from ${request.franchise_name}?`)) {
      cancelRequestMutation(request.id);
    }
  };

  // Create columns with cancel functionality
  const columns = createCompanyMissingVariantsColumns({
    onCancel: handleCancelRequest,
  });
  
  // Group requests by franchise
  const requestsByFranchise = useMemo(() => {
    const grouped = requests.reduce((acc, request) => {
      const franchiseId = request.franchise_id;
      if (!acc[franchiseId]) {
        acc[franchiseId] = {
          franchiseName: request.franchise_name,
          requests: []
        };
      }
      acc[franchiseId].requests.push(request);
      return acc;
    }, {} as Record<number, { franchiseName: string; requests: MissingVariantRequestResponse[] }>);
    
    return Object.entries(grouped).map(([franchiseId, data]) => ({
      franchiseId: Number(franchiseId),
      franchiseName: data.franchiseName,
      requests: data.requests
    }));
  }, [requests]);

  // Calculate summary stats
  const totalRequests = requests.length;
  const totalFranchises = requestsByFranchise.length;
  const totalQuantity = requests.reduce((sum, req) => sum + req.requested_quantity, 0);

  // Clear selections when filter changes
  const handleFilterChange = (newFilterFranchiseId: number | undefined) => {
    setFilterFranchiseId(newFilterFranchiseId);
    setSelectedRowIds([]);
    setSelectedRequestsCache(new Map());
    setSelectedFranchiseId(undefined);
    setCurrentPage(0);
    
    // Call parent callback with empty selection
    if (onSelectionChange) {
      onSelectionChange([]);
    }
  };

  // Handle selection changes
  const handleSelectionChange = (newSelectedRowIds: string[]) => {
    setSelectedRowIds(newSelectedRowIds);
    
    // Update the cache: add newly selected requests from current page and remove unselected ones
    const newCache = new Map(selectedRequestsCache);
    
    // Remove items that are no longer selected
    const removedIds = Array.from(selectedRequestsCache.keys()).filter(id => !newSelectedRowIds.includes(id));
    removedIds.forEach(id => newCache.delete(id));
    
    // Add newly selected items from current page
    const currentPageRequestIds = requests.map(req => req.id.toString());
    const newlySelected = newSelectedRowIds.filter(id => 
      currentPageRequestIds.includes(id) && !selectedRequestsCache.has(id)
    );
    
    newlySelected.forEach(id => {
      const request = requests.find(req => req.id.toString() === id);
      if (request) {
        newCache.set(id, request);
      }
    });
    
    setSelectedRequestsCache(newCache);
    
    // Convert all selected requests from cache to array
    const selectedRequests = Array.from(newCache.values());
    
    // Determine which franchise is selected (should be only one)
    const franchiseIds = [...new Set(selectedRequests.map(row => row.franchise_id))];
    if (franchiseIds.length === 1) {
      setSelectedFranchiseId(franchiseIds[0]);
      // Auto-update the franchise filter when selecting rows from a single franchise
      if (filterFranchiseId !== franchiseIds[0]) {
        setFilterFranchiseId(franchiseIds[0]);
        setCurrentPage(0); // Reset to first page when filter changes
      }
    } else {
      setSelectedFranchiseId(undefined);
      // If multiple franchises are selected or none, clear the franchise filter
      if (selectedRequests.length === 0 && filterFranchiseId) {
        setFilterFranchiseId(undefined);
        setCurrentPage(0);
      }
    }
    
    // Call parent callback
    if (onSelectionChange) {
      onSelectionChange(selectedRequests);
    }
  };

  if (isLoading) {
    return <div>Loading missing variant requests...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <FranchiseFilter 
            selectedFranchiseId={filterFranchiseId}
            onFranchiseChange={handleFilterChange}
            companyId={company.ID}
          />
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalRequests}</div>
            <CardDescription>Pending requests</CardDescription>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Franchises</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalFranchises}</div>
            <CardDescription>With pending requests</CardDescription>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Quantity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{totalQuantity}</div>
            <CardDescription>Items requested</CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* All Requests Table */}
      {requests.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <div className="text-gray-500">
              No pending missing variant requests found.
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Missing Variant Requests</CardTitle>
            <CardDescription>
              Select requests from the same franchise to create an exit bill
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={requests}
              searchColumn="product_name"
              columns={columns}
              selectedRows={selectedRowIds}
              setSelectedRows={handleSelectionChange}
              getRowId={(row) => row.id.toString()}
              paginationMeta={paginationMeta}
              onPageChange={setCurrentPage}
              currentPage={currentPage}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
