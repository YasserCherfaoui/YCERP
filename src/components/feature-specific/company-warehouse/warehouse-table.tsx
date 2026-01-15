import { RootState } from "@/app/store";
import TransactionsLogDialog from "@/components/feature-specific/company-warehouse/transactions-log-dialog";
import UpdateInventoryItemDialog from "@/components/feature-specific/company-warehouse/update-inventory-item-dialog";
import RecordBrokenItemsDialog from "@/components/feature-specific/broken-items/record-broken-items-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { InventoryItemWithCost } from "@/models/responses/inventory-with-cost.model";
import {
  getCompanyInventory,
  getCompanyInventoryTransactionLogs,
  getInventoryTotalCost,
} from "@/services/inventory-service";
import { useQuery } from "@tanstack/react-query";
import {
  ColumnDef,
  SortDirection,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronLeftCircleIcon, ChevronRightCircleIcon } from "lucide-react";
import { useMemo, useState } from "react";
import Barcode from "react-barcode";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

export default function () {
  let company = useSelector((state: RootState) => state.company.company);
  const { pathname } = useLocation();
  const isModerator = pathname.includes("moderator");
  if (isModerator) {
    company = useSelector((state: RootState) => state.user.company);
  }
  const [globalFilter, setGlobalFilter] = useState("");
  const [tableState, setTableState] = useState({
    sorting: [],
    pagination: {
      pageIndex: 0,
      pageSize: 10, // Number of rows per page
    },
  });
  const setTableStateSorting = (updater: any) => {
    setTableState((old) => ({
      ...old,
      sorting: typeof updater === "function" ? updater(old.sorting) : updater,
    }));
  };
  const setTableStatePagination = (updater: any) => {
    setTableState((old) => ({
      ...old,
      pagination:
        typeof updater === "function" ? updater(old.pagination) : updater,
    }));
  };
  const { data: logData } = useQuery({
    queryKey: ["inventory-log", company?.ID ?? 0],
    queryFn: () => getCompanyInventoryTransactionLogs(company?.ID ?? 0),
    enabled: !!company,
  });
  const columns: ColumnDef<InventoryItemWithCost>[] = [
    {
      header: "Product",
      accessorKey: "product.name",
      enableSorting: true,
    },
    {
      header: "Color",
      accessorKey: "product_variant.color",
    },
    {
      header: "Size",
      accessorKey: "product_variant.size",
    },
    {
      header: "Name",
      accessorKey: "name",
      enableSorting: true,
    },
    {
      header: "Quantity",
      accessorKey: "quantity",
    },
    {
      header: "Broken Count",
      accessorKey: "broken_count",
      cell: ({ getValue }: any) => {
        const count = getValue() || 0;
        return <span className={count > 0 ? "text-orange-500 font-semibold" : "text-gray-500"}>{count}</span>;
      },
    },
    {
      header: "Cost",
      accessorKey: "cost",
      cell: ({ getValue }: any) => (
        <span
          className={`${isModerator ? "hidden" : ""} ${
            getValue() < 0 ? "text-red-500" : "text-green-500"
          }`}
        >
          {Intl.NumberFormat("en-DZ", {
            style: "currency",
            currency: "DZD",
          }).format(getValue())}
        </span>
      ),
    },
    {
      header: "QR Code",
      accessorKey: "product_variant.qr_code",
      cell: ({ getValue }: any) => <Barcode value={getValue()} height={20} />,
    },
    {
      header: "Actions",
      cell: ({ row }) => (
        <>
          <UpdateInventoryItemDialog inventoryItem={row.original} />
          <TransactionsLogDialog
            logs={
              logData?.data?.filter(
                (log) => log.inventory_item_id == row.original.ID
              ) ?? []
            }
          />
        </>
      ),
    },
  ];
  const { data: inventoryData } = useQuery({
    queryKey: ["inventory"],
    queryFn: () => getCompanyInventory(company?.ID ?? 0),
  });
  const filteredItems = useMemo(
    () =>
      inventoryData?.data?.items_with_cost?.filter(
        (item) => item.product?.is_active !== false
      ) ?? [],
    [inventoryData?.data?.items_with_cost]
  );
  const { data: totalCostData } = useQuery({
    queryKey: ["inventory-total-cost"],
    queryFn: () => getInventoryTotalCost(company?.ID ?? 0),
    enabled: !!company,
  });
  //   ANCHOR: TABLE
  const table = useReactTable({
    data: filteredItems,
    columns: columns.filter(
      (column) => !isModerator || column.header !== "Cost"
    ),
    state: {
      sorting: tableState.sorting,
      globalFilter: globalFilter,
      pagination: tableState.pagination,
    },
    getCoreRowModel: getCoreRowModel(),
    // SECTION: Sorting
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setTableStateSorting,
    // SECTION: Filtering
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: "includesString",
    // SECTION: Pagination
    onPaginationChange: setTableStatePagination,
    getPaginationRowModel: getPaginationRowModel(),
  });

  if (!company) return;
  console.log(totalCostData);
  return (
    <div className="flex flex-col gap-2 mt-4">
      <div className="flex justify-between items-center">
        <div className="grid grid-cols-2 gap-2">
          <Card className={isModerator ? "hidden" : ""}>
            <CardHeader>
              <CardTitle>Total Cost</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-2xl font-bold">
                {Intl.NumberFormat("en-DZ", {
                  style: "currency",
                  currency: "DZD",
                }).format(totalCostData?.data?.total ?? 0)}
              </CardDescription>
            </CardContent>
          </Card>
        </div>
        <div className="flex gap-2">
          {inventoryData?.data?.ID && (
            <RecordBrokenItemsDialog inventoryId={inventoryData.data.ID} isFranchise={false} />
          )}
        </div>
      </div>
      <Input
        onChange={(e) => setGlobalFilter(e.target.value)}
        placeholder="Search..."
        className="w-1/4"
      />
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  onClick={header.column.getToggleSortingHandler()}
                  style={{ cursor: "pointer" }}
                >
                  {header.isPlaceholder ? null : (
                    <>
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {header.column.getIsSorted() &&
                        ({
                          asc: "⬆️",
                          desc: "⬇️",
                        }[header.column.getIsSorted() as SortDirection] ??
                          null)}
                    </>
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex items-center justify-between mt-4">
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeftCircleIcon />
            Previous
          </Button>
          <Button
            variant="outline"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRightCircleIcon />
            Next
          </Button>
        </div>
        <span className="text-sm text-muted-foreground">
          Page{" "}
          <strong>
            {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </strong>
        </span>
        <Select
          value={table.getState().pagination.pageSize.toString()}
          onValueChange={(value) => table.setPageSize(Number(value))}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Items per page" />
          </SelectTrigger>
          <SelectContent>
            {[10, 20, 30, 40, 50].map((pageSize) => (
              <SelectItem key={pageSize} value={pageSize.toString()}>
                Show {pageSize}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
