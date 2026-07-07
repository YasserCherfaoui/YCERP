import RecoverBrokenItemDialog from "@/components/feature-specific/broken-items/recover-broken-item-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { BrokenItemListItem } from "@/models/data/broken-item.model";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";

interface DeclarationsListProps {
  items: BrokenItemListItem[];
  isLoading?: boolean;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
  onPageChange?: (page: number) => void;
  selectedIds: Set<number>;
  onToggleItem: (id: number) => void;
  onToggleAll: () => void;
  transfersPath: string;
}

export function DeclarationsList({
  items,
  isLoading,
  pagination,
  onPageChange,
  selectedIds,
  onToggleItem,
  onToggleAll,
  transfersPath,
}: DeclarationsListProps) {
  const [selectedItem, setSelectedItem] = useState<BrokenItemListItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
            Pending
          </Badge>
        );
      case "partially_recovered":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
            Partially recovered
          </Badge>
        );
      case "fully_recovered":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
            Fully recovered
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const openRecoverDialog = (item: BrokenItemListItem) => {
    setSelectedItem(item);
    setDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Loading declarations...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">No franchise declarations found</p>
      </div>
    );
  }

  const currentPage = pagination?.page ?? 1;
  const totalPages = pagination?.total_pages ?? 1;
  const selectableItems = items.filter(
    (item) => item.recoverable_quantity > 0 && !item.blocked_by_pending_transfer
  );
  const allSelected =
    selectableItems.length > 0 &&
    selectableItems.every((item) => selectedIds.has(item.ID));

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={onToggleAll}
                  aria-label="Select all recoverable items"
                />
              </TableHead>
              <TableHead>Franchise</TableHead>
              <TableHead>Variant</TableHead>
              <TableHead>Declared</TableHead>
              <TableHead>Recovered</TableHead>
              <TableHead>Recoverable</TableHead>
              <TableHead>Sellable</TableHead>
              <TableHead>Broken</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => {
              const canRecover =
                item.recoverable_quantity > 0 && !item.blocked_by_pending_transfer;
              const variantLabel =
                item.inventory_item?.name ||
                (item.product_variant
                  ? `${item.product_variant.color} / ${item.product_variant.size}`
                  : `Variant ${item.product_variant_id}`);

              return (
                <TableRow key={item.ID}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.has(item.ID)}
                      disabled={!canRecover}
                      onCheckedChange={() => onToggleItem(item.ID)}
                      aria-label={`Select ${variantLabel}`}
                    />
                  </TableCell>
                  <TableCell>
                    {item.franchise?.name || `Franchise ${item.franchise_id}`}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{variantLabel}</div>
                    {item.product_variant?.qr_code ? (
                      <div className="font-mono text-xs text-muted-foreground">
                        {item.product_variant.qr_code}
                      </div>
                    ) : null}
                  </TableCell>
                  <TableCell>{item.broken_quantity}</TableCell>
                  <TableCell>{item.recovered_quantity}</TableCell>
                  <TableCell className="font-semibold">{item.recoverable_quantity}</TableCell>
                  <TableCell>{item.inventory_item?.quantity ?? "-"}</TableCell>
                  <TableCell>{item.inventory_item?.broken_count ?? "-"}</TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                  <TableCell className="max-w-xs truncate">{item.reason || "-"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {item.created_at
                      ? format(new Date(item.created_at), "MMM dd, yyyy HH:mm")
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                    {item.blocked_by_pending_transfer ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-1 text-amber-600 text-sm">
                              <AlertTriangle className="h-4 w-4" />
                              Pending transfer
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              Reject the pending transfer first on the{" "}
                              <Link to={transfersPath} className="underline">
                                transfers page
                              </Link>
                              .
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!canRecover}
                        onClick={() => openRecoverDialog(item)}
                      >
                        <RotateCcw className="h-4 w-4 mr-1" />
                        Recover
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
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
                return p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1;
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

      <RecoverBrokenItemDialog
        item={selectedItem}
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setSelectedItem(null);
        }}
      />
    </>
  );
}
