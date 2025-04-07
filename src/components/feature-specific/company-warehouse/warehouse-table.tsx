import { RootState } from "@/app/store";
import TransactionsLogDialog from "@/components/feature-specific/company-warehouse/transactions-log-dialog";
import UpdateInventoryItemDialog from "@/components/feature-specific/company-warehouse/update-inventory-item-dialog";
import { Button } from "@/components/ui/button";
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
import { InventoryItem } from "@/models/data/inventory.model";
import { getCompanyInventory, getCompanyInventoryTransactionLogs } from "@/services/inventory-service";
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
import { useState } from "react";
import Barcode from "react-barcode";
import { useSelector } from "react-redux";

export default function () {
  const company = useSelector((state: RootState) => state.company.company);
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
  const {data: logData} = useQuery({
    queryKey: ["inventory-log", company?.ID ?? 0],
    queryFn: () => getCompanyInventoryTransactionLogs(company?.ID ?? 0),
    enabled: !!company
  })
  const columns: ColumnDef<InventoryItem>[] = [
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
      header: "QR Code",
      accessorKey: "product_variant.qr_code",
      cell: ({ getValue }: any) => <Barcode value={getValue()} height={20} />,
    },
    {
      header: "Actions",
      cell: ({ row }) => (
        <>
          <UpdateInventoryItemDialog inventoryItem={row.original} />
          <TransactionsLogDialog logs={logData?.data?.filter((log) => log.inventory_item_id == row.original.ID) ?? []} />
        </>
      ),
    },
  ];
  const { data: inventoryData } = useQuery({
    queryKey: ["inventory"],
    queryFn: () => getCompanyInventory(company?.ID ?? 0),
  });

  //   ANCHOR: TABLE
  const table = useReactTable({
    data: inventoryData?.data?.items ?? [],
    columns,
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

  return (
    <div className="flex flex-col gap-2 mt-4">
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
