import TransactionReferenceDetailsDialog from "@/components/feature-specific/company-warehouse/transaction-reference-details-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getInventoryItemTransactionLogs } from "@/services/inventory-service";
import { useQuery } from "@tanstack/react-query";
import { History, Loader2 } from "lucide-react";
import { ReactNode, useState } from "react";

interface Props {
  inventoryItemId: number;
  /** Custom clickable trigger; defaults to a History icon button */
  trigger?: ReactNode;
}

export default function ({ inventoryItemId, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const [referenceOpen, setReferenceOpen] = useState(false);
  const [selectedReference, setSelectedReference] = useState<{
    type: string;
    id: number;
  } | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["inventory-item-transaction-logs", inventoryItemId],
    queryFn: () => getInventoryItemTransactionLogs(inventoryItemId),
    enabled: open && inventoryItemId > 0,
  });
  const logs = data?.data ?? [];

  const openReference = (type: string, id?: number) => {
    if (!type || !id) return;
    setSelectedReference({ type, id });
    setReferenceOpen(true);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {trigger ?? (
            <Button variant={"ghost"}>
              <History />
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="w-fit ">
          <DialogHeader>
            <DialogTitle>Transaction Logs</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[300px] ">
            <Table>
              <TableHeader>
                <TableHead>Date</TableHead>
                <TableHead>Qty Before</TableHead>
                <TableHead>Qty Change</TableHead>
                <TableHead>Qty After</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Reference Type</TableHead>
              </TableHeader>
              <TableBody>
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                    </TableCell>
                  </TableRow>
                )}
                {isError && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-destructive">
                      Failed to load transaction logs.
                    </TableCell>
                  </TableRow>
                )}
                {!isLoading && !isError && logs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No transaction logs found.
                    </TableCell>
                  </TableRow>
                )}
                {!isLoading &&
                  !isError &&
                  logs
                    .sort(
                      (a, b) =>
                        new Date(b.CreatedAt).getTime() - new Date(a.CreatedAt).getTime()
                    )
                    .map((l) => (
                      <TableRow key={l.ID}>
                        <TableCell>
                          {new Date(l.CreatedAt).toLocaleString()}
                        </TableCell>
                        <TableCell>{l.quantity_before}</TableCell>
                        <TableCell>{l.quantity_change}</TableCell>
                        <TableCell>{l.quantity_after}</TableCell>
                        <TableCell>
                          {l.reference_id ? (
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                className="text-primary underline-offset-2 hover:underline font-medium"
                                onClick={() =>
                                  openReference(l.reference_type, l.reference_id)
                                }
                              >
                                #{l.reference_id}
                              </button>
                              {l.reference_deleted && (
                                <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                                  DELETED
                                </Badge>
                              )}
                            </div>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell>{l.reference_type || "—"}</TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          </ScrollArea>
          <DialogFooter>
            <Button variant={"outline"} onClick={() => setOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {selectedReference && (
        <TransactionReferenceDetailsDialog
          open={referenceOpen}
          onOpenChange={(next) => {
            setReferenceOpen(next);
            if (!next) setSelectedReference(null);
          }}
          referenceType={selectedReference.type}
          referenceId={selectedReference.id}
        />
      )}
    </>
  );
}
