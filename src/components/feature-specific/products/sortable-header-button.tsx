import { cn } from "@/lib/utils";
import { Column } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

interface SortableHeaderButtonProps<TData, TValue> {
  column: Column<TData, TValue>;
  label: string;
  align?: "left" | "right";
  className?: string;
}

/**
 * Accessible `<button type="button">` header control for sortable columns.
 * The parent `<th scope="col">` manages `aria-sort` inside `DataTable`.
 */
export function SortableHeaderButton<TData, TValue>({
  column,
  label,
  align = "left",
  className,
}: SortableHeaderButtonProps<TData, TValue>) {
  const sorted = column.getIsSorted();
  const Icon = sorted === "asc" ? ArrowUp : sorted === "desc" ? ArrowDown : ArrowUpDown;

  return (
    <button
      type="button"
      onClick={() => column.toggleSorting(sorted === "asc")}
      className={cn(
        "inline-flex min-h-9 w-full cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        align === "right" ? "justify-end text-right" : "justify-start text-left",
        sorted && "text-foreground",
        className
      )}
    >
      <span>{label}</span>
      <Icon
        aria-hidden="true"
        className={cn("h-3.5 w-3.5 shrink-0", !sorted && "opacity-60")}
      />
    </button>
  );
}

