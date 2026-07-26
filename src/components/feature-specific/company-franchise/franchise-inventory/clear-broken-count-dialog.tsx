import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { useToast } from "@/hooks/use-toast";
import { InventoryItem } from "@/models/data/inventory.model";
import { clearBrokenCounts } from "@/services/inventory-service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: InventoryItem[];
}

export default function ClearBrokenCountDialog({
  open,
  onOpenChange,
  items,
}: Props) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const brokenItems = useMemo(
    () => items.filter((item) => (item.broken_count ?? 0) > 0),
    [items]
  );

  useEffect(() => {
    if (open) {
      setSelectedIds(new Set());
    }
  }, [open]);

  const allSelected =
    brokenItems.length > 0 && selectedIds.size === brokenItems.length;

  const toggleRow = (id: number, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelectedIds(new Set(brokenItems.map((item) => item.ID)));
  };

  const unselectAll = () => {
    setSelectedIds(new Set());
  };

  const { mutate: clearMutation, isPending } = useMutation({
    mutationFn: clearBrokenCounts,
    onSuccess: (response) => {
      toast({
        title: "Broken counts cleared",
        description: `Cleared broken count on ${response.data?.cleared ?? selectedIds.size} item(s).`,
      });
      queryClient.invalidateQueries({ queryKey: ["franchise-inventory"] });
      queryClient.invalidateQueries({ queryKey: ["company-inventory"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-total-cost"] });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to clear broken counts",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    },
  });

  const handleClear = () => {
    if (selectedIds.size === 0) return;
    clearMutation(Array.from(selectedIds));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Clear broken count</DialogTitle>
        </DialogHeader>
        <p className="text-muted-foreground text-sm">
          Select inventory items with a broken count greater than zero, then
          clear their broken count. Sellable quantity is not changed.
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={selectAll}
            disabled={brokenItems.length === 0 || allSelected}
          >
            Select all
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={unselectAll}
            disabled={selectedIds.size === 0}
          >
            Unselect all
          </Button>
        </div>
        {brokenItems.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            No items with broken count greater than zero.
          </div>
        ) : (
          <ScrollArea className="max-h-[360px] rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Select</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Broken count</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {brokenItems.map((item) => {
                  const checked = selectedIds.has(item.ID);
                  return (
                    <TableRow key={item.ID}>
                      <TableCell>
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(value) =>
                            toggleRow(item.ID, !!value)
                          }
                          aria-label={`Select ${item.name}`}
                        />
                      </TableCell>
                      <TableCell>{item.product?.name ?? "—"}</TableCell>
                      <TableCell>
                        {item.product_variant?.color ?? "—"}
                      </TableCell>
                      <TableCell>
                        {item.product_variant?.size ?? "—"}
                      </TableCell>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="text-right">
                        {item.quantity}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-orange-500">
                        {item.broken_count}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            disabled={selectedIds.size === 0 || isPending}
            onClick={handleClear}
          >
            {isPending ? "Clearing…" : "Clear broken count"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
