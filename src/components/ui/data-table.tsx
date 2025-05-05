import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PaginationMeta } from "@/models/responses/company-stats.model";
import React from "react";
import { Button } from "./button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { Input } from "./input";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchColumn: string;
  paginationMeta?: PaginationMeta;
  onPageChange?: (page: number) => void;
  currentPage?: number;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchColumn,
  paginationMeta,
  onPageChange,
  currentPage = 0
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  // Add local pagination state for automatic mode
  const [autoPageIndex, setAutoPageIndex] = React.useState(0);
  const [autoPageSize, setAutoPageSize] = React.useState(paginationMeta?.per_page ?? 10);

  // Determine if manual or automatic pagination
  const isManual = !!onPageChange;
  const pageIndex = isManual ? currentPage : autoPageIndex;
  const pageSize = isManual ? (paginationMeta?.per_page ?? 10) : autoPageSize;
  const pageCount = isManual ? (paginationMeta?.total_pages ?? -1) : Math.ceil(data.length / pageSize);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    manualPagination: isManual,
    pageCount,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination: {
        pageIndex,
        pageSize
      }
    },
    onPaginationChange: isManual ? undefined : (updater) => {
      // updater can be a function or value
      if (typeof updater === 'function') {
        const newState = updater({ pageIndex: autoPageIndex, pageSize: autoPageSize });
        setAutoPageIndex(newState.pageIndex);
        setAutoPageSize(newState.pageSize);
      } else {
        setAutoPageIndex(updater.pageIndex);
        setAutoPageSize(updater.pageSize);
      }
    },
  });

  return (
    <div>
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter Product Name..."
          value={(table.getColumn(searchColumn)?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn(searchColumn)?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex-1 text-sm text-muted-foreground">
        {table.getFilteredSelectedRowModel().rows.length} of{" "}
        {table.getFilteredRowModel().rows.length} row(s) selected.
      </div>

      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (isManual) {
              const newPage = currentPage - 1;
              onPageChange?.(newPage);
            } else {
              table.previousPage();
            }
          }}
          disabled={isManual ? currentPage <= 0 : !table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <div className="flex items-center gap-2 mx-2">
          <span className="text-sm">
            Page {pageIndex + 1} of {pageCount > 0 ? pageCount : 1}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (isManual) {
              const newPage = currentPage + 1;
              onPageChange?.(newPage);
            } else {
              table.nextPage();
            }
          }}
          disabled={isManual ? currentPage >= (pageCount - 1) : !table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
