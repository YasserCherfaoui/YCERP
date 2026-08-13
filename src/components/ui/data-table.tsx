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
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "./pagination";

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

  return (
    <div>
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
      <div className="rounded-md border">
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
      <div className="flex-1 text-sm text-muted-foreground">
        {selectionEnabled
          ? `${table.getFilteredSelectedRowModel().rows.length} of ${
              table.getFilteredRowModel().rows.length
            } row(s) selected.`
          : null}
      </div>

        <Pagination className="flex w-full max-w-full space-x-2 overflow-x-auto py-4">
          <PaginationContent className="pb-5">
            <PaginationItem>
              <PaginationPrevious
                onClick={() => {
                  if (isManual) {
                    const newPage = currentPage - 1;
                    onPageChange?.(newPage);
                  } else {
                    table.previousPage();
                  }
                }}
                aria-disabled={
                  isManual ? currentPage <= 0 : !table.getCanPreviousPage()
                }
                tabIndex={
                  (isManual ? currentPage <= 0 : !table.getCanPreviousPage())
                    ? -1
                    : 0
                }
                style={{
                  pointerEvents: (
                    isManual ? currentPage <= 0 : !table.getCanPreviousPage()
                  )
                    ? "none"
                    : undefined,
                }}
              />
            </PaginationItem>
            {/* Page numbers */}
            <div className="flex max-w-full overflow-x-auto">
              {Array.from({ length: pageCount > 0 ? pageCount : 1 }).map(
                (_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      isActive={i === pageIndex}
                      onClick={() => {
                        if (i !== pageIndex) {
                          if (isManual) {
                            onPageChange?.(i);
                          } else {
                            table.setPageIndex(i);
                          }
                        }
                      }}
                      href="#"
                      tabIndex={i === pageIndex ? -1 : 0}
                      aria-disabled={i === pageIndex}
                      style={{
                        pointerEvents: i === pageIndex ? "none" : undefined,
                      }}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                )
              )}
            </div>
            <PaginationItem>
              <PaginationNext
                onClick={() => {
                  if (isManual) {
                    const newPage = currentPage + 1;
                    onPageChange?.(newPage);
                  } else {
                    table.nextPage();
                  }
                }}
                aria-disabled={
                  isManual
                    ? currentPage >= pageCount - 1
                    : !table.getCanNextPage()
                }
                tabIndex={
                  (
                    isManual
                      ? currentPage >= pageCount - 1
                      : !table.getCanNextPage()
                  )
                    ? -1
                    : 0
                }
                style={{
                  pointerEvents: (
                    isManual
                      ? currentPage >= pageCount - 1
                      : !table.getCanNextPage()
                  )
                    ? "none"
                    : undefined,
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>

    </div>
  );
}
