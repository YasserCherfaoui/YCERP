import { TransfersList } from "@/components/feature-specific/broken-items/transfers-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getTransferRequests } from "@/services/broken-items-service";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface BrokenItemsTransfersPageBodyProps {
  companyId: number;
}

const PAGE_SIZE = 20;

export default function BrokenItemsTransfersPageBody({
  companyId,
}: BrokenItemsTransfersPageBodyProps) {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["broken-items-transfers", companyId, statusFilter, page, PAGE_SIZE],
    queryFn: () =>
      getTransferRequests({
        company_id: companyId,
        page,
        limit: PAGE_SIZE,
        ...(statusFilter !== "all"
          ? { status: statusFilter as "pending" | "approved" | "rejected" }
          : {}),
      }),
    enabled: !!companyId,
  });

  const transfers = data?.data?.transfers ?? [];
  const pagination = data?.data?.pagination;
  const statusCounts = data?.data?.status_counts;

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setPage(1);
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Broken Items Transfers</h1>
            <p className="text-muted-foreground">
              Review and manage broken item transfer requests from franchises
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-2xl font-bold text-yellow-600">
              {statusCounts?.pending ?? 0}
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-2xl font-bold text-green-600">
              {statusCounts?.approved ?? 0}
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-2xl font-bold text-red-600">
              {statusCounts?.rejected ?? 0}
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transfer Requests</CardTitle>
          <CardDescription>
            {statusFilter === "all"
              ? "All transfer requests"
              : `Transfer requests with status: ${statusFilter}`}
            {pagination
              ? ` — showing ${transfers.length} of ${pagination.total}`
              : null}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TransfersList
            transfers={transfers}
            isLoading={isLoading}
            pagination={pagination}
            onPageChange={setPage}
          />
        </CardContent>
      </Card>
    </div>
  );
}
