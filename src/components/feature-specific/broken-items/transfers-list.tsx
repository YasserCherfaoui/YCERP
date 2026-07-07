import { BrokenItemTransfer } from "@/models/data/broken-item-transfer.model";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Eye, Check } from "lucide-react";
import { useState } from "react";
import ApproveTransferDialog from "./approve-transfer-dialog";
import { format } from "date-fns";

interface TransfersListProps {
  transfers: BrokenItemTransfer[];
  isLoading?: boolean;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
  onPageChange?: (page: number) => void;
}

export function TransfersList({
  transfers,
  isLoading,
  pagination,
  onPageChange,
}: TransfersListProps) {
  const [selectedTransfer, setSelectedTransfer] = useState<BrokenItemTransfer | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleViewTransfer = (transfer: BrokenItemTransfer) => {
    setSelectedTransfer(transfer);
    setDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">Pending</Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">Approved</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Loading transfers...</p>
      </div>
    );
  }

  if (transfers.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">No transfer requests found</p>
      </div>
    );
  }

  const currentPage = pagination?.page ?? 1;
  const totalPages = pagination?.total_pages ?? 1;

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>From</TableHead>
              <TableHead>To</TableHead>
              <TableHead>Franchise</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Requested By</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transfers.map((transfer) => (
              <TableRow key={transfer.ID}>
                <TableCell className="font-mono">#{transfer.ID}</TableCell>
                <TableCell>
                  {transfer.from_inventory?.name || `Inventory ${transfer.from_inventory_id}`}
                </TableCell>
                <TableCell>
                  {transfer.to_inventory?.name || `Inventory ${transfer.to_inventory_id}`}
                </TableCell>
                <TableCell>
                  {transfer.franchise?.name || transfer.franchise_id ? `Franchise ${transfer.franchise_id}` : "-"}
                </TableCell>
                <TableCell>
                  <span className="font-semibold">{transfer.items?.length || 0} items</span>
                  <span className="text-muted-foreground text-sm ml-1">
                    ({transfer.items?.reduce((sum, item) => sum + item.quantity, 0) || 0} total)
                  </span>
                </TableCell>
                <TableCell>
                  {transfer.requested_by?.full_name || transfer.requested_by?.email || `Admin ${transfer.requested_by_id}`}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {transfer.created_at
                    ? format(new Date(transfer.created_at), "MMM dd, yyyy HH:mm")
                    : "N/A"}
                </TableCell>
                <TableCell>{getStatusBadge(transfer.status)}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewTransfer(transfer)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    {transfer.status === "pending" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewTransfer(transfer)}
                        className="text-green-600 hover:text-green-700"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Review
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {pagination && totalPages > 1 && onPageChange ? (
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage > 1) onPageChange(currentPage - 1);
                }}
                className={currentPage <= 1 ? "pointer-events-none opacity-50" : undefined}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => {
                if (totalPages <= 7) return true;
                return (
                  p === 1 ||
                  p === totalPages ||
                  Math.abs(p - currentPage) <= 1
                );
              })
              .map((p, idx, arr) => {
                const prev = arr[idx - 1];
                const showEllipsis = prev !== undefined && p - prev > 1;
                return (
                  <span key={p} className="flex items-center">
                    {showEllipsis ? (
                      <PaginationItem>
                        <span className="px-2 text-muted-foreground">…</span>
                      </PaginationItem>
                    ) : null}
                    <PaginationItem>
                      <PaginationLink
                        href="#"
                        isActive={p === currentPage}
                        onClick={(e) => {
                          e.preventDefault();
                          onPageChange(p);
                        }}
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  </span>
                );
              })}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage < totalPages) onPageChange(currentPage + 1);
                }}
                className={currentPage >= totalPages ? "pointer-events-none opacity-50" : undefined}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      ) : null}

      {selectedTransfer ? (
        <ApproveTransferDialog
          transfer={selectedTransfer}
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) {
              setSelectedTransfer(null);
            }
          }}
        />
      ) : null}
    </>
  );
}
