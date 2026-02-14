import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
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
import { InventoryDiscrepancy } from "@/models/data/inventory.model";
import {
    getInventoryDiscrepancies,
    updateCompanyInventoryItem,
} from "@/services/inventory-service";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle } from "lucide-react";
import { useCallback, useState } from "react";

const DISCREPANCY_FIX_COMMENT =
    "Discrepancy correction - quantity reset to match last transaction log";
const DISCREPANCY_FIX_TRANSACTION_TYPE = "discrepancy_correction";

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    inventoryId: number | null;
}

export default function InventoryDiscrepanciesDialog({
    open,
    onOpenChange,
    inventoryId,
}: Props) {
    const queryClient = useQueryClient();
    const [fixing, setFixing] = useState(false);

    const { data, isLoading, error } = useQuery({
        queryKey: ["inventory-discrepancies", inventoryId],
        queryFn: () =>
            getInventoryDiscrepancies(inventoryId!, 10, 0).then((r) => r.data),
        enabled: open && inventoryId != null,
    });

    const handleFixDiscrepancies = useCallback(async () => {
        if (!data?.discrepancies?.length) return;
        setFixing(true);
        try {
            for (const row of data.discrepancies as InventoryDiscrepancy[]) {
                await updateCompanyInventoryItem(row.inventory_item_id, {
                    quantity: row.last_logged_quantity,
                    comment: DISCREPANCY_FIX_COMMENT,
                    transaction_type: DISCREPANCY_FIX_TRANSACTION_TYPE,
                });
            }
            await queryClient.invalidateQueries({ queryKey: ["inventory"] });
            await queryClient.invalidateQueries({
                queryKey: ["company-inventory"],
            });
            await queryClient.invalidateQueries({
                queryKey: ["franchise-inventory"],
            });
            await queryClient.invalidateQueries({
                queryKey: ["inventory-total-cost"],
            });
            await queryClient.invalidateQueries({
                queryKey: ["inventory-discrepancies"],
            });
            onOpenChange(false);
        } finally {
            setFixing(false);
        }
    }, [data?.discrepancies, queryClient, onOpenChange]);

    const discrepancies = data?.discrepancies ?? [];
    const canFix = discrepancies.length > 0 && !fixing;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5" />
                        Inventory discrepancies
                    </DialogTitle>
                </DialogHeader>
                <p className="text-muted-foreground text-sm">
                    Items whose current quantity does not match the last
                    transaction log (first 10 for this inventory).
                </p>
                {isLoading ? (
                    <div className="py-8 text-center text-muted-foreground">
                        Loading…
                    </div>
                ) : error ? (
                    <div className="py-8 text-center text-destructive">
                        {error instanceof Error
                            ? error.message
                            : "Failed to load discrepancies"}
                    </div>
                ) : discrepancies.length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground">
                        No discrepancies found.
                    </div>
                ) : (
                    <ScrollArea className="max-h-[300px] rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Item</TableHead>
                                    <TableHead className="text-right">
                                        Current
                                    </TableHead>
                                    <TableHead className="text-right">
                                        Last logged
                                    </TableHead>
                                    <TableHead className="text-right">
                                        Discrepancy
                                    </TableHead>
                                    <TableHead>Last log</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {discrepancies.map(
                                    (row: InventoryDiscrepancy) => (
                                        <TableRow
                                            key={row.inventory_item_id}
                                        >
                                            <TableCell className="font-medium">
                                                {row.item_name || row.product_name}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {row.current_quantity}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {row.last_logged_quantity}
                                            </TableCell>
                                            <TableCell
                                                className={`text-right font-medium ${
                                                    row.discrepancy !== 0
                                                        ? "text-amber-600 dark:text-amber-400"
                                                        : ""
                                                }`}
                                            >
                                                {row.discrepancy > 0
                                                    ? "+"
                                                    : ""}
                                                {row.discrepancy}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-sm">
                                                {row.last_log_timestamp ?? "—"}
                                            </TableCell>
                                        </TableRow>
                                    )
                                )}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                )}
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        disabled={!canFix}
                        onClick={handleFixDiscrepancies}
                    >
                        {fixing ? "Fixing…" : "Fix discrepancies"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
