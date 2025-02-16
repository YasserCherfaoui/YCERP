import { RootState } from "@/app/store";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Product } from "@/models/data/product.model";
import {
  ColumnDef,
  RowSelectionState,
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
import { useSelector } from "react-redux";

interface Props {
  selectedRow: RowSelectionState;
  setSelectedRow: React.Dispatch<React.SetStateAction<RowSelectionState>>;
}

export default function ({ selectedRow, setSelectedRow }: Props) {
  const company = useSelector((state: RootState) => state.company.company);
  const [tableState, setTableState] = useState({
    sorting: [],
    pagination: {
      pageIndex: 0,
      pageSize: 10,
    },
  });
  const [globalFilter, setGlobalFilter] = useState("");

  // ANCHOR: Setting up Table
  const columns: ColumnDef<Product>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={table.getToggleAllPageRowsSelectedHandler()}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={row.getToggleSelectedHandler()}
        />
      ),
    },
    {
      header: "Product Name",
      accessorKey: "name",
    },
    {
      header: "First Price",
      accessorKey: "first_price",
    },
    {
      header: "Franchise Price",
      accessorKey: "franchise_price",
    },
    {
      header: "Price",
      accessorKey: "price",
    },
    {
      header: "Description",
      accessorKey: "description",
    },
  ];
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

  const table = useReactTable({
    data: company?.products ?? [],
    columns,
    state: {
      rowSelection: selectedRow,
      sorting: tableState.sorting,
      globalFilter: globalFilter,
      pagination: tableState.pagination,
    },
    getCoreRowModel: getCoreRowModel(),
    // SECTION: Selection
    onRowSelectionChange: setSelectedRow,
    // SECTION: Sorting
    onSortingChange: setTableStateSorting,
    getSortedRowModel: getSortedRowModel(),
    // SECTION: Pagination
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setTableStatePagination,
    // SECTION: Filtering
    globalFilterFn: "includesString",
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
  });


  if (!company) return;
  return (
    <div className="flex flex-col gap-4">

      <div className="flex flex-col gap-4">
        <Input
          placeholder="Search..."
          className="w-1/4"
          onChange={(e) => setGlobalFilter(e.target.value)}
        />
        <Table>
          <TableCaption>A list of your recent invoices.</TableCaption>
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
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                onClick={() => {
                  row.toggleSelected(!row.getIsSelected());
                }}
                className="cursor-pointer"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <div>
              {table.getFilteredSelectedRowModel().rows.length} row(s) selected
            </div>
          </TableFooter>
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
    </div>
  );
}
