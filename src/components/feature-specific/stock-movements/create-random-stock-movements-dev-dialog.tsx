import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { useToast } from "@/hooks/use-toast";
import { InventoryItem } from "@/models/data/inventory.model";
import { InventoryShortfallItem } from "@/models/data/missing-variant.model";
import {
  CompanyInventoryOption,
  CreateStockMovementPayload,
} from "@/models/data/stock-movement.model";
import { getFranchiseInventory } from "@/services/franchise-service";
import { getCompanyInventory } from "@/services/inventory-service";
import {
  createStockMovement,
  shortfallsFromError,
} from "@/services/stock-movement-service";
import { useQueryClient } from "@tanstack/react-query";
import { Dices } from "lucide-react";
import { useState } from "react";
import StockMovementShortfallDialog from "./stock-movement-shortfall-dialog";

interface LoadedInventory {
  option: CompanyInventoryOption;
  items: InventoryItem[];
}

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

async function loadInventoryItems(
  companyId: number,
  option: CompanyInventoryOption
): Promise<InventoryItem[]> {
  const response =
    option.location_type === "franchise" && option.franchise_id
      ? await getFranchiseInventory(option.franchise_id)
      : await getCompanyInventory(companyId);
  return response.data?.items ?? [];
}

interface CreateRandomStockMovementsDialogProps {
  companyId: number;
  inventories: CompanyInventoryOption[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function CreateRandomStockMovementsDialog({
  companyId,
  inventories,
  open,
  onOpenChange,
}: CreateRandomStockMovementsDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [count, setCount] = useState(3);
  const [includeOverstock, setIncludeOverstock] = useState(false);
  const [pending, setPending] = useState(false);
  const [shortfallOpen, setShortfallOpen] = useState(false);
  const [shortfalls, setShortfalls] = useState<InventoryShortfallItem[]>([]);
  const [overPayload, setOverPayload] = useState<CreateStockMovementPayload | null>(null);

  const buildMove = (
    loaded: LoadedInventory[],
    overstock: boolean
  ): CreateStockMovementPayload | null => {
    const sources = loaded.filter((entry) =>
      entry.items.some((item) => (overstock ? item.product_variant_id > 0 : item.quantity > 0))
    );
    if (sources.length === 0 || loaded.length < 2) return null;
    const source = pickRandom(sources);
    const destinations = loaded.filter((entry) => entry.option.ID !== source.option.ID);
    if (destinations.length === 0) return null;
    const destination = pickRandom(destinations);
    const candidates = source.items.filter((item) =>
      overstock ? item.product_variant_id > 0 : item.quantity > 0
    );
    if (candidates.length === 0) return null;
    const lineCount = overstock ? 1 : Math.min(candidates.length, Math.floor(Math.random() * 5) + 1);
    const shuffled = [...candidates].sort(() => Math.random() - 0.5).slice(0, lineCount);
    return {
      company_id: companyId,
      from_inventory_id: source.option.ID,
      to_inventory_id: destination.option.ID,
      items: shuffled.map((item) => ({
        product_variant_id: item.product_variant_id,
        quantity: overstock
          ? item.quantity + 1 + Math.floor(Math.random() * 3)
          : Math.floor(Math.random() * item.quantity) + 1,
      })),
    };
  };

  const handleCreate = async () => {
    if (inventories.length < 2) {
      toast({
        title: "Need two inventories",
        description: "Add another franchise or warehouse before generating movements.",
        variant: "destructive",
      });
      return;
    }
    setPending(true);
    try {
      const loaded: LoadedInventory[] = [];
      for (const option of inventories) {
        loaded.push({ option, items: await loadInventoryItems(companyId, option) });
      }
      let created = 0;
      let openedShortfall = false;
      const total = Math.min(Math.max(count, 1), 20);
      for (let i = 0; i < total; i += 1) {
        const payload = buildMove(loaded, false);
        if (!payload) {
          toast({
            title: "No stock to move",
            description: "Source inventories need at least one item with quantity above zero.",
            variant: "destructive",
          });
          break;
        }
        await createStockMovement(payload);
        created += 1;
        for (const line of payload.items) {
          const source = loaded.find((entry) => entry.option.ID === payload.from_inventory_id);
          const item = source?.items.find((row) => row.product_variant_id === line.product_variant_id);
          if (item) item.quantity -= line.quantity;
        }
      }

      if (includeOverstock) {
        const over = buildMove(loaded, true);
        if (!over) {
          toast({
            title: "No item for an over-stock line",
            description: "The source inventories have no variants to over-request.",
            variant: "destructive",
          });
        } else {
          try {
            await createStockMovement(over);
            created += 1;
          } catch (error) {
            const rows = shortfallsFromError(error);
            if (rows) {
              openedShortfall = true;
              setOverPayload(over);
              setShortfalls(rows);
              setShortfallOpen(true);
            } else {
              throw error;
            }
          }
        }
      }

      await queryClient.invalidateQueries({ queryKey: ["stock-movements", companyId] });
      if (created > 0) {
        toast({
          title: "Random movements created",
          description: `${created} movement${created === 1 ? "" : "s"} saved.`,
        });
      }
      if (created > 0 || openedShortfall) onOpenChange(false);
    } catch (error) {
      toast({
        title: "Failed to create random movements",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setPending(false);
    }
  };

  const retryOverstock = async () => {
    if (!overPayload) return null;
    try {
      await createStockMovement(overPayload);
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

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create random movements</DialogTitle>
            <DialogDescription>
              Dev only. Creates stock movement bills with random inventories and quantities that
              fit current source stock.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="random-movements-count">Count</Label>
              <Input
                id="random-movements-count"
                type="number"
                min={1}
                max={20}
                value={count}
                onChange={(event) => setCount(Number(event.target.value))}
              />
            </div>
            <label className="flex items-start gap-2 text-sm">
              <Checkbox
                checked={includeOverstock}
                onCheckedChange={(value) => setIncludeOverstock(value === true)}
              />
              <span>Include one over-stock line so the fix popup can be tried. It is not fixed automatically.</span>
            </label>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="button" disabled={pending} onClick={() => void handleCreate()}>
              {pending ? "Creating…" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <StockMovementShortfallDialog
        open={shortfallOpen}
        onOpenChange={setShortfallOpen}
        shortfalls={shortfalls}
        companyId={companyId}
        inventoryId={overPayload?.from_inventory_id ?? 0}
        onRetry={retryOverstock}
        onResolved={() => {
          void queryClient.invalidateQueries({ queryKey: ["stock-movements", companyId] });
          toast({ title: "Over-stock movement created" });
          onOpenChange(false);
        }}
      />
    </>
  );
}

interface CreateRandomStockMovementsDevButtonProps {
  companyId: number;
  inventories: CompanyInventoryOption[];
}

export default function CreateRandomStockMovementsDevButton({
  companyId,
  inventories,
}: CreateRandomStockMovementsDevButtonProps) {
  const [open, setOpen] = useState(false);
  if (!import.meta.env.DEV) {
    return null;
  }
  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        <Dices className="h-4 w-4" />
        <span className="hidden sm:inline">Create random movements</span>
        <span className="sm:hidden">Random</span>
      </Button>
      <CreateRandomStockMovementsDialog
        companyId={companyId}
        inventories={inventories}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}
