import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { InventoryShortfallItem } from "@/models/data/missing-variant.model";
import { CompanyInventoryOption, CreateStockMovementPayload } from "@/models/data/stock-movement.model";
import { getFranchiseInventory } from "@/services/franchise-service";
import { getCompanyInventory } from "@/services/inventory-service";
import {
  createStockMovement,
  shortfallsFromError,
} from "@/services/stock-movement-service";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import StockMovementShortfallDialog from "./stock-movement-shortfall-dialog";

interface DraftLine {
  product_variant_id: number;
  name: string;
  barcode: string;
  quantity: number;
}

interface CreateStockMovementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: number;
  inventories: CompanyInventoryOption[];
}

export default function CreateStockMovementDialog({
  open,
  onOpenChange,
  companyId,
  inventories,
}: CreateStockMovementDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [fromId, setFromId] = useState<string>("");
  const [toId, setToId] = useState<string>("");
  const [barcode, setBarcode] = useState("");
  const [lines, setLines] = useState<DraftLine[]>([]);
  const [pending, setPending] = useState(false);
  const [shortfallOpen, setShortfallOpen] = useState(false);
  const [shortfalls, setShortfalls] = useState<InventoryShortfallItem[]>([]);
  const [payload, setPayload] = useState<CreateStockMovementPayload | null>(null);
  const [randomOpen, setRandomOpen] = useState(false);
  const [randomCount, setRandomCount] = useState("");

  const fromInventory = inventories.find((inv) => String(inv.ID) === fromId);
  const destinations = inventories.filter((inv) => String(inv.ID) !== fromId);

  const sourceQuery = useQuery({
    queryKey: ["stock-movement-source", companyId, fromInventory?.ID, fromInventory?.location_type],
    enabled: open && !!fromInventory,
    queryFn: () =>
      fromInventory?.location_type === "franchise" && fromInventory.franchise_id
        ? getFranchiseInventory(fromInventory.franchise_id)
        : getCompanyInventory(companyId),
  });

  const sourceItems = useMemo(
    () => sourceQuery.data?.data?.items ?? [],
    [sourceQuery.data]
  );
  const itemsByVariant = useMemo(() => {
    const map = new Map<number, InventoryItem>();
    for (const item of sourceItems) {
      map.set(item.product_variant_id, item);
    }
    return map;
  }, [sourceItems]);

  const resetForm = () => {
    setFromId("");
    setToId("");
    setBarcode("");
    setLines([]);
    setPayload(null);
    setShortfalls([]);
    setRandomOpen(false);
    setRandomCount("");
  };

  const addBarcode = () => {
    const code = barcode.trim();
    if (!code) return;
    const item = sourceItems.find((row) => row.product_variant?.qr_code === code);
    if (!item || !item.product_variant_id) {
      toast({
        variant: "destructive",
        title: "Barcode not found",
        description: "That barcode is not in the source inventory.",
      });
      return;
    }
    setLines((current) => {
      const existing = current.find((line) => line.product_variant_id === item.product_variant_id);
      if (existing) {
        return current.map((line) =>
          line.product_variant_id === item.product_variant_id
            ? { ...line, quantity: line.quantity + 1 }
            : line
        );
      }
      return [
        ...current,
        {
          product_variant_id: item.product_variant_id,
          name: item.name,
          barcode: code,
          quantity: 1,
        },
      ];
    });
    setBarcode("");
  };

  const addRandomEntries = () => {
    const count = Number(randomCount);
    if (!Number.isInteger(count) || count < 1) {
      toast({
        variant: "destructive",
        title: "Enter a count",
        description: "Type how many random lines to add.",
      });
      return;
    }
    const taken = new Set(lines.map((line) => line.product_variant_id));
    const pool = sourceItems.filter(
      (item) => item.product_variant_id > 0 && !taken.has(item.product_variant_id)
    );
    if (pool.length === 0) {
      toast({
        variant: "destructive",
        title: "Nothing to add",
        description: "The source inventory has no more items to add.",
      });
      return;
    }
    const picked = [...pool].sort(() => Math.random() - 0.5).slice(0, count);
    setLines((current) => [
      ...current,
      ...picked.map((item) => {
        const stock = item.quantity > 0 ? item.quantity : 1;
        return {
          product_variant_id: item.product_variant_id,
          name: item.name,
          barcode: item.product_variant?.qr_code ?? "",
          quantity: Math.floor(Math.random() * stock) + 1,
        };
      }),
    ]);
    if (picked.length < count) {
      toast({
        title: `Added ${picked.length} entries`,
        description: "The source inventory has no more items.",
      });
    }
    setRandomCount("");
    setRandomOpen(false);
  };

  const buildPayload = (): CreateStockMovementPayload | null => {
    if (!fromInventory || !toId || lines.length === 0) return null;
    return {
      company_id: companyId,
      from_inventory_id: fromInventory.ID,
      to_inventory_id: Number(toId),
      items: lines.map((line) => ({
        product_variant_id: line.product_variant_id,
        quantity: line.quantity,
      })),
    };
  };

  const submitPayload = async (next: CreateStockMovementPayload) => {
    setPayload(next);
    setPending(true);
    try {
      await createStockMovement(next);
      toast({ title: "Stock movement created" });
      await queryClient.invalidateQueries({ queryKey: ["stock-movements", companyId] });
      await queryClient.invalidateQueries({ queryKey: ["inventory"] });
      resetForm();
      onOpenChange(false);
    } catch (error) {
      const rows = shortfallsFromError(error);
      if (rows) {
        setShortfalls(rows);
        setShortfallOpen(true);
        return;
      }
      toast({
        title: "Could not create movement",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setPending(false);
    }
  };

  const retryMovement = async () => {
    if (!payload) return null;
    try {
      await createStockMovement(payload);
      return null;
    } catch (error) {
      const rows = shortfallsFromError(error);
      if (rows) {
        setShortfalls(rows);
        return rows;
      }
      throw error;
    }
  };

  const onResolved = async () => {
    toast({ title: "Stock movement created" });
    await queryClient.invalidateQueries({ queryKey: ["stock-movements", companyId] });
    await queryClient.invalidateQueries({ queryKey: ["inventory"] });
    await queryClient.invalidateQueries({ queryKey: ["stock-movement-source"] });
    resetForm();
    onOpenChange(false);
  };

  const payloadReady = (() => {
    const next = buildPayload();
    if (!next || next.items.some((item) => item.quantity < 1)) return null;
    return next;
  })();

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (!next && !shortfallOpen) resetForm();
          onOpenChange(next);
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New stock movement</DialogTitle>
            <DialogDescription>
              Move quantities from one inventory to another. The movement is saved as a bill.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>From</Label>
              <Select
                value={fromId}
                onValueChange={(value) => {
                  setFromId(value);
                  setLines([]);
                  if (value === toId) setToId("");
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Source inventory" />
                </SelectTrigger>
                <SelectContent>
                  {inventories.map((inv) => (
                    <SelectItem key={inv.ID} value={String(inv.ID)}>
                      {inv.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>To</Label>
              <Select value={toId} onValueChange={setToId} disabled={!fromId}>
                <SelectTrigger>
                  <SelectValue placeholder="Destination inventory" />
                </SelectTrigger>
                <SelectContent>
                  {destinations.map((inv) => (
                    <SelectItem key={inv.ID} value={String(inv.ID)}>
                      {inv.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <Input
              value={barcode}
              placeholder="Scan or type a source barcode"
              disabled={!fromId}
              onChange={(event) => setBarcode(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addBarcode();
                }
              }}
            />
            <Button type="button" variant="secondary" disabled={!fromId} onClick={addBarcode}>
              Add
            </Button>
            {import.meta.env.DEV && (
              <Button
                type="button"
                variant="outline"
                disabled={!fromId || sourceQuery.isLoading}
                onClick={() => setRandomOpen(true)}
              >
                Add random entries
              </Button>
            )}
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead className="text-right">In stock</TableHead>
                <TableHead className="text-right">Move</TableHead>
                <TableHead className="w-[80px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {lines.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-muted-foreground">
                    Scan a barcode from the source inventory.
                  </TableCell>
                </TableRow>
              ) : (
                lines.map((line) => {
                  const actual = itemsByVariant.get(line.product_variant_id)?.quantity ?? 0;
                  return (
                    <TableRow key={line.product_variant_id}>
                      <TableCell>
                        <div>{line.name}</div>
                        <div className="font-mono text-xs text-muted-foreground">{line.barcode}</div>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{actual}</TableCell>
                      <TableCell className="text-right">
                        <Input
                          type="number"
                          min={1}
                          className="ml-auto w-24"
                          value={line.quantity}
                          onChange={(event) => {
                            const quantity = Number(event.target.value);
                            setLines((current) =>
                              current.map((row) =>
                                row.product_variant_id === line.product_variant_id
                                  ? { ...row, quantity: Number.isFinite(quantity) ? quantity : 1 }
                                  : row
                              )
                            );
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setLines((current) =>
                              current.filter((row) => row.product_variant_id !== line.product_variant_id)
                            )
                          }
                        >
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={pending || !payloadReady}
              onClick={() => {
                if (payloadReady) void submitPayload(payloadReady);
              }}
            >
              {pending ? "Moving…" : "Create movement"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={randomOpen} onOpenChange={setRandomOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Add random entries</DialogTitle>
            <DialogDescription>
              How many random lines should be added from the source inventory?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="random-entry-count">Count</Label>
            <Input
              id="random-entry-count"
              type="number"
              min={1}
              value={randomCount}
              placeholder="How many"
              onChange={(event) => setRandomCount(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addRandomEntries();
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setRandomOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={addRandomEntries}>
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <StockMovementShortfallDialog
        open={shortfallOpen}
        onOpenChange={setShortfallOpen}
        shortfalls={shortfalls}
        companyId={companyId}
        inventoryId={fromInventory?.ID ?? payload?.from_inventory_id ?? 0}
        onRetry={retryMovement}
        onResolved={() => {
          void onResolved();
        }}
      />
    </>
  );
}
