import { RootState } from "@/app/store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { MissingVariantRequestResponse } from "@/models/data/missing-variant.model";
import { getAllMissingVariantRequests } from "@/services/missing-variants-service";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { companyMissingVariantsColumns } from "./company-missing-variants-columns";
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
  
  const [selectedFranchiseId, setSelectedFranchiseId] = useState<number | undefined>();
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);

  if (!company) return null;

  const { data: requestsData, isLoading } = useQuery({
    queryKey: ["company-missing-variants", company.ID, selectedFranchiseId],
    queryFn: () => getAllMissingVariantRequests({ 
      franchise_id: selectedFranchiseId,
      status: "pending" // Only show pending requests by default
    }),
    enabled: !!company,
  });

  const requests = requestsData?.data?.requests || [];
  
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

  // Handle selection changes
  const handleSelectionChange = (newSelectedRowIds: string[]) => {
    setSelectedRowIds(newSelectedRowIds);
    
    // Convert selected row IDs back to request objects
    const selectedRequests = requests.filter(request => 
      newSelectedRowIds.includes(request.id.toString())
    );
    
    // Determine which franchise is selected (should be only one)
    const franchiseIds = [...new Set(selectedRequests.map(row => row.franchise_id))];
    if (franchiseIds.length === 1) {
      setSelectedFranchiseId(franchiseIds[0]);
    } else {
      setSelectedFranchiseId(undefined);
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
            selectedFranchiseId={selectedFranchiseId}
            onFranchiseChange={setSelectedFranchiseId}
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
              columns={companyMissingVariantsColumns}
              selectedRows={selectedRowIds}
              setSelectedRows={handleSelectionChange}
              getRowId={(row) => row.id.toString()}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
