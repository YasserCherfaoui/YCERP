import { DataTable } from "@/components/ui/data-table";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sale } from "@/models/data/sale.model";
import { ColumnDef } from "@tanstack/react-table";
import { endOfDay, startOfDay } from "date-fns";
import { RefreshCw, ShoppingBag, Undo2 } from "lucide-react";
import { DateRange } from "react-day-picker";
import {
  SaleExchangeRow,
  SaleReturnRow,
} from "./sale-activity-columns";

export function applySalesDateRange(
  range: DateRange | undefined,
  setDateRange: (next: { from: Date; to: Date }) => void
) {
  if (range?.from && range?.to) {
    setDateRange({
      from: startOfDay(range.from),
      to: endOfDay(range.to),
    });
  }
}

interface SalesActivityTabsProps {
  sales: Sale[];
  returnsRows: SaleReturnRow[];
  exchangesRows: SaleExchangeRow[];
  salesColumns: ColumnDef<Sale>[];
  returnsColumns: ColumnDef<SaleReturnRow>[];
  exchangesColumns: ColumnDef<SaleExchangeRow>[];
  dateRange: { from: Date; to: Date };
  onDateRangeChange: (next: { from: Date; to: Date }) => void;
}

export function SalesActivityTabs({
  sales,
  returnsRows,
  exchangesRows,
  salesColumns,
  returnsColumns,
  exchangesColumns,
  dateRange,
  onDateRangeChange,
}: SalesActivityTabsProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <span className="text-sm text-muted-foreground">
          Date range for tables:
        </span>
        <DatePickerWithRange
          date={{ from: dateRange.from, to: dateRange.to }}
          onSelect={(range) => applySalesDateRange(range, onDateRangeChange)}
        />
      </div>
      <Tabs defaultValue="sales" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="sales" className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" />
            Sales
          </TabsTrigger>
          <TabsTrigger value="returns" className="flex items-center gap-2">
            <Undo2 className="h-4 w-4" />
            Returns
          </TabsTrigger>
          <TabsTrigger value="exchanges" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Exchanges
          </TabsTrigger>
        </TabsList>
        <TabsContent value="sales" className="mt-4">
          <DataTable
            data={[...sales].sort(
              (a, b) =>
                new Date(b.CreatedAt).getTime() -
                new Date(a.CreatedAt).getTime()
            )}
            columns={salesColumns}
            searchColumn="sale_id"
          />
        </TabsContent>
        <TabsContent value="returns" className="mt-4">
          <DataTable
            data={returnsRows}
            columns={returnsColumns}
            searchColumn="sale_id"
          />
        </TabsContent>
        <TabsContent value="exchanges" className="mt-4">
          <DataTable
            data={exchangesRows}
            columns={exchangesColumns}
            searchColumn="sale_id"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
