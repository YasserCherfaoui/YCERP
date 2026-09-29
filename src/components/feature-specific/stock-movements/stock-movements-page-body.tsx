import AppBarBackButton from "@/components/common/app-bar-back-button";
import { Button } from "@/components/ui/button";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
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
import { StockMovementBill } from "@/models/data/stock-movement.model";
import { deleteStockMovement, listCompanyInventories, listStockMovements, printStockMovement } from "@/services/stock-movement-service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { endOfDay, startOfDay } from "date-fns";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import CreateRandomStockMovementsDevButton from "./create-random-stock-movements-dev-dialog";
import CreateStockMovementDialog from "./create-stock-movement-dialog";
import StockMovementBillDialog from "./stock-movement-bill-dialog";

function lineLabel(bill: StockMovementBill): string {
  if (!bill.items?.length) return "—";
  return bill.items
    .map((item) => {
      const variant = item.product_variant;
      const name = variant?.product?.name
        ? `${variant.product.name} — ${variant.color ?? ""}`
        : variant?.qr_code || `Variant ${item.product_variant_id}`;
      return `${name} × ${item.quantity}`;
    })
    .join(", ");
}

function inventoryName(bill: StockMovementBill, side: "from" | "to"): string {
  const inventory = side === "from" ? bill.from_inventory : bill.to_inventory;
  const id = side === "from" ? bill.from_inventory_id : bill.to_inventory_id;
  return inventory?.name?.trim() ? inventory.name : `Inventory ${id}`;
}

interface StockMovementsPageBodyProps {
  companyId: number;
  companyName: string;
}

export default function StockMovementsPageBody({
  companyId,
  companyName,
}: StockMovementsPageBodyProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [displayBill, setDisplayBill] = useState<StockMovementBill | null>(null);
  const [printingId, setPrintingId] = useState<number | null>(null);
  const [fromId, setFromId] = useState("all");
  const [toId, setToId] = useState("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const next = searchValue.trim();
      if (next === debouncedSearch) return;
      setDebouncedSearch(next);
      setPage(1);
    }, 400);
    return () => window.clearTimeout(timeout);
  }, [searchValue, debouncedSearch]);

  const inventoriesQuery = useQuery({
    queryKey: ["company-inventories", companyId],
    queryFn: () => listCompanyInventories(companyId),
  });
  const movementsQuery = useQuery({
    queryKey: [
      "stock-movements",
      companyId,
      fromId,
      toId,
      dateRange?.from?.toISOString(),
      dateRange?.to?.toISOString(),
      debouncedSearch,
      page,
    ],
    queryFn: () =>
      listStockMovements(companyId, {
        from_inventory_id: fromId !== "all" ? Number(fromId) : undefined,
        to_inventory_id: toId !== "all" ? Number(toId) : undefined,
        start_date: dateRange?.from ? startOfDay(dateRange.from).toISOString() : undefined,
        end_date: dateRange?.from ? endOfDay(dateRange.to ?? dateRange.from).toISOString() : undefined,
        search: debouncedSearch || undefined,
        page,
        limit: 50,
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteStockMovement,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["stock-movements", companyId] });
      toast({ title: "Stock movement deleted", description: "Quantities were restored." });
    },
    onError: (error: Error) => {
      toast({
        title: "Could not delete movement",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const inventories = inventoriesQuery.data?.data ?? [];
  const movements = movementsQuery.data?.data?.bills ?? [];
  const pagination = movementsQuery.data?.data?.pagination;
  const filtersActive =
    fromId !== "all" || toId !== "all" || Boolean(dateRange?.from) || Boolean(debouncedSearch);

  const clearFilters = () => {
    setFromId("all");
    setToId("all");
    setDateRange(undefined);
    setSearchValue("");
    setDebouncedSearch("");
    setPage(1);
  };

  const handlePrint = async (billId: number) => {
    setPrintingId(billId);
    try {
      await printStockMovement(billId);
    } catch (error) {
      toast({
        title: "Could not print movement",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setPrintingId(null);
    }
  };

  return (
    <main className="mx-auto w-full max-w-6xl space-y-4 px-3 py-4 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xl">
          <AppBarBackButton destination="Menu" />
          <span>
            {companyName} &gt; Stock movements
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {import.meta.env.DEV && (
            <CreateRandomStockMovementsDevButton companyId={companyId} inventories={inventories} />
          )}
          <Button type="button" onClick={() => setCreateOpen(true)}>
            New movement
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="space-y-1.5">
          <Label htmlFor="movement-from-filter">From</Label>
          <Select
            value={fromId}
            onValueChange={(value) => {
              setFromId(value);
              setPage(1);
            }}
          >
            <SelectTrigger id="movement-from-filter" className="w-full">
              <SelectValue placeholder="All inventories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All inventories</SelectItem>
              {inventories.map((inventory) => (
                <SelectItem key={inventory.ID} value={String(inventory.ID)}>
                  {inventory.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="movement-to-filter">To</Label>
          <Select
            value={toId}
            onValueChange={(value) => {
              setToId(value);
              setPage(1);
            }}
          >
            <SelectTrigger id="movement-to-filter" className="w-full">
              <SelectValue placeholder="All inventories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All inventories</SelectItem>
              {inventories.map((inventory) => (
                <SelectItem key={`to-${inventory.ID}`} value={String(inventory.ID)}>
                  {inventory.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label>Date</Label>
          <DatePickerWithRange
            date={dateRange}
            onSelect={(range) => {
              setDateRange(range);
              setPage(1);
            }}
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2 xl:col-span-4">
          <Label htmlFor="movement-search">Search</Label>
          <Input
            id="movement-search"
            value={searchValue}
            placeholder="Movement number, product, or barcode"
            onChange={(event) => setSearchValue(event.target.value)}
          />
        </div>
      </div>

      {filtersActive ? (
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm text-muted-foreground">
            {pagination?.total ?? 0} matching movements
          </p>
          <Button type="button" variant="ghost" size="sm" onClick={clearFilters}>
            <X className="mr-1 h-4 w-4" />
            Clear filters
          </Button>
        </div>
      ) : null}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>When</TableHead>
            <TableHead>From</TableHead>
            <TableHead>To</TableHead>
            <TableHead>Items</TableHead>
            <TableHead className="w-[240px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {movementsQuery.isLoading ? (
            <TableRow>
              <TableCell colSpan={5} className="text-muted-foreground">
                Loading movements…
              </TableCell>
            </TableRow>
          ) : movements.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-muted-foreground">
                {filtersActive ? "No movements match these filters." : "No stock movements yet."}
              </TableCell>
            </TableRow>
          ) : (
            movements.map((bill) => (
              <TableRow key={bill.ID}>
                <TableCell className="whitespace-nowrap">
                  {bill.CreatedAt ? new Date(bill.CreatedAt).toLocaleString() : "—"}
                </TableCell>
                <TableCell>{inventoryName(bill, "from")}</TableCell>
                <TableCell>{inventoryName(bill, "to")}</TableCell>
                <TableCell>{lineLabel(bill)}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap justify-end gap-1">
                    <Button type="button" variant="ghost" size="sm" onClick={() => setDisplayBill(bill)}>
                      Display
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={printingId === bill.ID}
                      onClick={() => void handlePrint(bill.ID)}
                    >
                      Print
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={deleteMutation.isPending}
                      onClick={() => {
                        if (window.confirm("Delete this movement and restore both inventories?")) {
                          deleteMutation.mutate(bill.ID);
                        }
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {pagination && pagination.total_pages > 1 ? (
        <div className="flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.total_pages}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page >= pagination.total_pages}
            onClick={() => setPage((current) => current + 1)}
          >
            Next
          </Button>
        </div>
      ) : null}

      <CreateStockMovementDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        companyId={companyId}
        inventories={inventories}
      />
      <StockMovementBillDialog
        bill={displayBill}
        open={displayBill !== null}
        onOpenChange={(open) => {
          if (!open) setDisplayBill(null);
        }}
        onPrint={(billId) => void handlePrint(billId)}
        printing={printingId !== null}
      />
    </main>
  );
}
