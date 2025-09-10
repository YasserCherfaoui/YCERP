import { RootState } from "@/app/store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { getFranchiseMissingVariantRequests } from "@/services/missing-variants-service";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { franchiseMissingVariantsColumns } from "./franchise-missing-variants-columns";

export default function FranchiseMissingVariantsBody() {
  const franchise = useSelector((state: RootState) => state.franchise.franchise);
  
  if (!franchise) return null;

  const { data: requestsData, isLoading } = useQuery({
    queryKey: ["franchise-missing-variants", franchise.ID],
    queryFn: () => getFranchiseMissingVariantRequests(),
    enabled: !!franchise,
  });

  const requests = requestsData?.data?.requests || [];
  
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
              columns={franchiseMissingVariantsColumns}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
