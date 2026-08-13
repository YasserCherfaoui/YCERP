import { cn } from "@/lib/utils";
import { flexRender, type Column, type Table as TanstackTable } from "@tanstack/react-table";
import { Card } from "./card";

function humanizeColumnId(id: string): string {
  return id
    .replace(/[._-]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();
}

function getColumnLabel<TData>(column: Column<TData, unknown>): string {
  const header = column.columnDef.header;
  if (typeof header === "string" && header.trim()) {
    return header;
  }
  return humanizeColumnId(column.id);
}

function isSelectColumn(id: string): boolean {
  return id === "select";
}

function isActionColumn<TData>(column: Column<TData, unknown>): boolean {
  if (/^actions?$/i.test(column.id)) {
    return true;
  }
  const header = column.columnDef.header;
  return typeof header === "string" && /actions?/i.test(header);
}

interface DataTableMobileCardsProps<TData> {
  table: TanstackTable<TData>;
  selectionEnabled?: boolean;
}

export function DataTableMobileCards<TData>({
  table,
  selectionEnabled = false,
}: DataTableMobileCardsProps<TData>) {
  const rows = table.getRowModel().rows;

  if (!rows.length) {
    return (
      <div className="rounded-xl border bg-card px-4 py-10 text-center text-sm text-muted-foreground">
        No results.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {selectionEnabled ? (
        <label className="flex min-h-11 items-center gap-2 text-sm">
          <input
            type="checkbox"
            aria-label="Select all"
            checked={table.getIsAllRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
            className="h-5 w-5"
          />
          Select all on this page
        </label>
      ) : null}

      {rows.map((row) => {
        const visibleCells = row.getVisibleCells();
        const selectCell = !selectionEnabled
          ? visibleCells.find((cell) => isSelectColumn(cell.column.id))
          : undefined;
        const contentCells = visibleCells.filter(
          (cell) => !isSelectColumn(cell.column.id)
        );
        const actionCells = contentCells.filter((cell) =>
          isActionColumn(cell.column)
        );
        const dataCells = contentCells.filter(
          (cell) => !isActionColumn(cell.column)
        );
        const [titleCell, ...fieldCells] = dataCells;

        return (
          <Card
            key={row.id}
            data-state={row.getIsSelected() ? "selected" : undefined}
            className={cn(
              "p-3 shadow-sm transition-colors duration-200",
              row.getIsSelected() && "border-primary/40 bg-muted/40"
            )}
          >
            <div className="flex items-start gap-3">
              {selectionEnabled ? (
                <input
                  type="checkbox"
                  aria-label="Select row"
                  className="mt-1 h-5 w-5 shrink-0"
                  checked={row.getIsSelected()}
                  onChange={row.getToggleSelectedHandler()}
                />
              ) : selectCell ? (
                <div className="mt-1 shrink-0">
                  {flexRender(
                    selectCell.column.columnDef.cell,
                    selectCell.getContext()
                  )}
                </div>
              ) : null}

              <div className="min-w-0 flex-1">
                {titleCell ? (
                  <div className="text-base font-semibold leading-snug">
                    {flexRender(
                      titleCell.column.columnDef.cell,
                      titleCell.getContext()
                    )}
                  </div>
                ) : null}

                {fieldCells.length > 0 ? (
                  <dl className="mt-3 space-y-2">
                    {fieldCells.map((cell) => (
                      <div
                        key={cell.id}
                        className="grid grid-cols-[7.5rem_minmax(0,1fr)] gap-x-3 text-sm"
                      >
                        <dt className="text-muted-foreground">
                          {getColumnLabel(cell.column)}
                        </dt>
                        <dd className="min-w-0 overflow-x-auto break-words font-medium">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </dd>
                      </div>
                    ))}
                  </dl>
                ) : null}
              </div>
            </div>

            {actionCells.length > 0 ? (
              <div className="mt-3 flex flex-wrap items-center justify-end gap-2 border-t border-border pt-3">
                {actionCells.map((cell) => (
                  <div key={cell.id} className="min-w-0">
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    )}
                  </div>
                ))}
              </div>
            ) : null}
          </Card>
        );
      })}
    </div>
  );
}
