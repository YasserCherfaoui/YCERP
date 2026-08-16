import {
    ColumnDef,
    ColumnFiltersState,
    OnChangeFn,
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
import React, { useEffect, useRef } from "react";
import { Button } from "./button";
import { DataTableMobileCards } from "./data-table-mobile-cards";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "./dropdown-menu";
import { Input } from "./input";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "./pagination";

function visiblePageItems(
  pageIndex: number,
  pageCount: number
): Array<number | "ellipsis"> {
  const count = Math.max(pageCount, 1);
  if (count <= 7) {
    return Array.from({ length: count }, (_, i) => i);
  }

  const pages = new Set<number>([0, count - 1, pageIndex]);
  if (pageIndex - 1 > 0) pages.add(pageIndex - 1);
  if (pageIndex + 1 < count - 1) pages.add(pageIndex + 1);

  const sorted = [...pages].sort((a, b) => a - b);
  const items: Array<number | "ellipsis"> = [];
  let previous = -1;
  for (const page of sorted) {
    if (previous !== -1 && page - previous > 1) {
      items.push("ellipsis");
    }
    items.push(page);
    previous = page;
  }
  return items;
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchColumn: string;
  paginationMeta?: PaginationMeta;
  onPageChange?: (page: number) => void;
  currentPage?: number;
  selectedRows?: string[]; // List of selected row IDs
  setSelectedRows?: (ids: string[]) => void; // Setter for selected row IDs
  getRowId?: (row: TData) => string; // Function to get row ID
  isRowSelectable?: (row: TData) => boolean;
  searchBar?: boolean;
  searchPlaceholder?: string;
  initialColumnVisibility?: VisibilityState;
  /** When set, search is controlled by the parent (API-driven). */
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  /** When set with onSortingChange, sorting is controlled by the parent (API-driven). */
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchColumn,
  paginationMeta,
  onPageChange,
  currentPage = 0,
  selectedRows,
  setSelectedRows,
  getRowId,
  isRowSelectable,
  searchBar = true,
  searchPlaceholder = "Filter Product Name...",
  initialColumnVisibility = {},
  searchValue,
  onSearchChange,
  sorting: controlledSorting,
  onSortingChange: controlledOnSortingChange,
}: DataTableProps<TData, TValue>) {
  const [internalSorting, setInternalSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>(initialColumnVisibility);

  const isServerSearch = typeof onSearchChange === "function";
  const isServerSorting = typeof controlledOnSortingChange === "function";
  const sorting = isServerSorting ? controlledSorting ?? [] : internalSorting;
  const setSorting = isServerSorting
    ? controlledOnSortingChange!
    : setInternalSorting;

  // Only enable selection if all required props are present
  const selectionEnabled = !!selectedRows && !!setSelectedRows && !!getRowId;

  // Warn if selection is attempted without getRowId
  if ((!!selectedRows || !!setSelectedRows) && !getRowId) {
    console.warn(
      "DataTable: getRowId prop is required when using row selection."
    );
  }

  // Map selectedRows to TanStack's rowSelection object
  const rowSelection = React.useMemo(() => {
    if (!selectionEnabled || !selectedRows) return {};
    const obj: Record<string, boolean> = {};
    for (const id of selectedRows) obj[id] = true;
    return obj;
  }, [selectedRows, selectionEnabled]);

  // Add local pagination state for automatic mode
  const [autoPageIndex, setAutoPageIndex] = React.useState(0);
  const [autoPageSize, setAutoPageSize] = React.useState(
    paginationMeta?.per_page ?? 10
  );

  // Determine if manual or automatic pagination
  const isManual = !!onPageChange;

  const pageIndex = isManual ? currentPage : autoPageIndex;
  const pageSize = isManual ? paginationMeta?.per_page ?? 10 : autoPageSize;
  const pageCount = isManual
    ? paginationMeta?.total_pages ?? -1
    : Math.ceil(data.length / pageSize);
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: isServerSorting ? undefined : getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: isServerSearch ? undefined : getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    manualPagination: isManual,
    manualSorting: isServerSorting,
    manualFiltering: isServerSearch,
    pageCount,
    // Only enable row selection if all required props are present
    ...(selectionEnabled && {
      enableRowSelection: isRowSelectable
        ? (row) => isRowSelectable(row.original)
        : true,
      getRowId: getRowId,
      rowSelection,
      onRowSelectionChange: (updater: any) => {
        let newRowSelection: Record<string, boolean>;
        if (typeof updater === "function") {
          newRowSelection = updater(rowSelection);
        } else {
          newRowSelection = updater;
        }
        const newSelectedRows = Object.keys(newRowSelection).filter(
          (id) => newRowSelection[id]
        );
        setSelectedRows?.(newSelectedRows);
      },
    }),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      ...(selectionEnabled && { rowSelection }),
      pagination: {
        pageIndex,
        pageSize,
      },
    },
    onPaginationChange: isManual
      ? undefined
      : (updater) => {
          if (typeof updater === "function") {
            const newState = updater({
              pageIndex: autoPageIndex,
              pageSize: autoPageSize,
            });
            setAutoPageIndex(newState.pageIndex);
            setAutoPageSize(newState.pageSize);
          } else {
            setAutoPageIndex(updater.pageIndex);
            setAutoPageSize(updater.pageSize);
          }
        },
  });

  // Helper: get all visible row IDs (for legacy/other use)

  // Ref for select-all checkbox to set indeterminate
  const selectAllRef = useRef<HTMLInputElement>(null);
  const allChecked = selectionEnabled ? table.getIsAllRowsSelected() : false;
  const someChecked = selectionEnabled
    ? table.getIsSomeRowsSelected() && !allChecked
    : false;

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someChecked;
    }
  }, [someChecked]);

  useEffect(() => {
    if (!isServerSearch && table.getState().pagination.pageIndex !== 0) {
      table.setPageIndex(0);
    }
  }, [columnFilters, isServerSearch]);

  const searchInputValue = isServerSearch
    ? searchValue ?? ""
    : ((table.getColumn(searchColumn)?.getFilterValue() as string) ?? "");

  const previousDisabled = isManual
    ? currentPage <= 0
    : !table.getCanPreviousPage();
  const nextDisabled = isManual
    ? currentPage >= pageCount - 1
    : !table.getCanNextPage();
  const totalPages = Math.max(pageCount, 1);
  const filteredRowCount = isManual
    ? paginationMeta?.total_items ?? data.length
    : table.getFilteredRowModel().rows.length;
  const rangeStart = filteredRowCount === 0 ? 0 : pageIndex * pageSize + 1;
  const rangeEnd = Math.min((pageIndex + 1) * pageSize, filteredRowCount);

  const goToPage = (nextIndex: number) => {
    if (isManual) {
      onPageChange?.(nextIndex);
    } else {
      table.setPageIndex(nextIndex);
    }
  };

  const paginationBar = (
    <div className="flex shrink-0 flex-col gap-2 border-y bg-background py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground tabular-nums">
        {filteredRowCount === 0
          ? "No rows"
          : `Showing ${rangeStart}–${rangeEnd} of ${filteredRowCount}`}
        <span className="sr-only">
          {`, page ${pageIndex + 1} of ${totalPages}`}
        </span>
      </p>
      <Pagination className="mx-0 w-full justify-start sm:w-auto sm:justify-end">
        <PaginationContent className="flex-wrap">
          <PaginationItem>
            <PaginationPrevious
              className="min-h-11 cursor-pointer [&>span]:hidden sm:[&>span]:inline"
              onClick={(event) => {
                event.preventDefault();
                if (previousDisabled) return;
                if (isManual) {
                  onPageChange?.(currentPage - 1);
                } else {
                  table.previousPage();
                }
              }}
              aria-disabled={previousDisabled}
              tabIndex={previousDisabled ? -1 : 0}
              style={{
                pointerEvents: previousDisabled ? "none" : undefined,
              }}
            />
          </PaginationItem>
          {visiblePageItems(pageIndex, totalPages).map((item, index) =>
            item === "ellipsis" ? (
              <PaginationItem
                key={`ellipsis-${index}`}
                className="hidden sm:flex"
              >
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={item} className="hidden sm:flex">
                <PaginationLink
                  isActive={item === pageIndex}
                  className="min-h-11 min-w-11 cursor-pointer"
                  onClick={(event) => {
                    event.preventDefault();
                    if (item !== pageIndex) {
                      goToPage(item);
                    }
                  }}
                  href="#"
                  tabIndex={item === pageIndex ? -1 : 0}
                  aria-disabled={item === pageIndex}
                  aria-label={`Go to page ${item + 1}`}
                >
                  {item + 1}
                </PaginationLink>
              </PaginationItem>
            )
          )}
          <PaginationItem className="sm:hidden">
            <span className="px-2 text-sm font-medium tabular-nums">
              {pageIndex + 1} / {totalPages}
            </span>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext
              className="min-h-11 cursor-pointer [&>span]:hidden sm:[&>span]:inline"
              onClick={(event) => {
                event.preventDefault();
                if (nextDisabled) return;
                if (isManual) {
                  onPageChange?.(currentPage + 1);
                } else {
                  table.nextPage();
                }
              }}
              aria-disabled={nextDisabled}
              tabIndex={nextDisabled ? -1 : 0}
              style={{
                pointerEvents: nextDisabled ? "none" : undefined,
              }}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center">
        {searchBar && (
          <Input
            placeholder={searchPlaceholder}
            value={searchInputValue}
            onChange={(event) => {
              if (isServerSearch) {
                onSearchChange?.(event.target.value);
              } else {
                table.getColumn(searchColumn)?.setFilterValue(event.target.value);
              }
            }}
            className="w-full max-w-sm"
          />
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="sm:ml-auto">
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
      {paginationBar}
      <div className="flex-1 text-sm text-muted-foreground">
        {selectionEnabled
          ? `${table.getFilteredSelectedRowModel().rows.length} of ${
              table.getFilteredRowModel().rows.length
            } row(s) selected.`
          : null}
      </div>
      <div className="min-h-0 flex-1 overflow-auto md:hidden">
        <DataTableMobileCards
          table={table}
          selectionEnabled={selectionEnabled}
        />
      </div>
      <div className="hidden min-h-0 flex-1 overflow-auto rounded-md border md:block">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup, headerGroupIdx) => (
              <TableRow key={headerGroup.id}>
                {/* Selection checkbox header only for first header row */}
                {selectionEnabled && headerGroupIdx === 0 && (
                  <TableHead key="select-all" style={{ width: 36 }}>
                    <input
                      ref={selectAllRef}
                      type="checkbox"
                      aria-label="Select all"
                      checked={allChecked}
                      onChange={table.getToggleAllRowsSelectedHandler()}
                    />
                  </TableHead>
                )}
                {/* If not first header row but selection enabled, add empty cell for alignment */}
                {selectionEnabled && headerGroupIdx !== 0 && (
                  <TableHead key="select-all-empty" style={{ width: 36 }} />
                )}
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
                  {/* Selection checkbox cell */}
                  {selectionEnabled && (
                    <TableCell key="select-row" style={{ width: 36 }}>
                      <input
                        type="checkbox"
                        aria-label="Select row"
                        checked={row.getIsSelected()}
                        onChange={row.getToggleSelectedHandler()}
                      />
                    </TableCell>
                  )}
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {/*
                        If you render a list inside a cell, make sure to provide a unique key for each child!
                        Example: items.map(item => <div key={item.id}>{item.name}</div>)
                      */}
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
                  colSpan={columns.length + (selectionEnabled ? 1 : 0)}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
