import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { useToast } from "@/hooks/use-toast";
import {
  fillFranchiseReturnExchangeItemPrices,
  FillItemPricesResponse,
} from "@/services/franchise-service";
import { endOfDay, startOfDay } from "date-fns";
import { DateRange } from "react-day-picker";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Wrench } from "lucide-react";

type FillItemPricesDialogProps = {
  franchiseId: number;
  trigger?: React.ReactNode;
};

export default function FillItemPricesDialog({
  franchiseId,
  trigger,
}: FillItemPricesDialogProps) {
  const [open, setOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const startDate = dateRange?.from ? startOfDay(dateRange.from) : undefined;
      const endDate = dateRange?.from
        ? dateRange.to
          ? endOfDay(dateRange.to)
          : endOfDay(dateRange.from)
        : undefined;
      const res = await fillFranchiseReturnExchangeItemPrices({
        franchiseId,
        startDate,
        endDate,
      });
      const data = res.data as FillItemPricesResponse;
      const total =
        (data.return_items_franchise_price_updated ?? 0) +
        (data.return_items_return_price_updated ?? 0) +
        (data.exchange_items_franchise_price_updated ?? 0) +
        (data.exchange_items_exchange_price_updated ?? 0);
      toast({
        title: "Prices filled",
        description: total
          ? `Updated ${total} item price(s): ${data.return_items_franchise_price_updated ?? 0} return franchise, ${data.return_items_return_price_updated ?? 0} return price, ${data.exchange_items_franchise_price_updated ?? 0} exchange franchise, ${data.exchange_items_exchange_price_updated ?? 0} exchange price.`
          : "No empty prices found in the selected range.",
      });
      setOpen(false);
      setDateRange(undefined);
      queryClient.invalidateQueries({ queryKey: ["franchise-sales-total-today", franchiseId] });
      queryClient.invalidateQueries({ queryKey: ["franchise-sales-total-range", franchiseId] });
      queryClient.invalidateQueries({ queryKey: ["sales"] });
    } catch (e) {
      toast({
        title: "Error",
        description: e instanceof Error ? e.message : "Failed to fill prices",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="sm">
            <Wrench className="mr-2 h-4 w-4" />
            Fill item prices
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Fill return & exchange item prices</DialogTitle>
          <DialogDescription>
            Find return items and exchange items with empty price or franchise price and fill them
            from the products table. Optionally restrict by date or date range (return date for
            returns, exchange date for exchanges). Leave empty to process all.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Date or date range (optional)</label>
            <DatePickerWithRange
              date={dateRange}
              onSelect={setDateRange}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Filling…" : "Fill prices"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
