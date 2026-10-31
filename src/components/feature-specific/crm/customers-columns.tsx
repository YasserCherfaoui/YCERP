import CustomerPhoneCell from "@/components/feature-specific/crm/customer-phone-cell";
import { avatarTone, customerInitials, rateTier, tone } from "@/components/feature-specific/crm/crm-theme";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Customer } from "@/models/data/customer.model";
import { Column, ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Cake, ChevronDown, ChevronsUpDown, ChevronUp, Clock, Eye, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";

export type CustomerTableRow = {
  customer: Customer;
  delivery_rate: number;
  sales_count?: number;
};

// Column ids match the backend `sort_by` keys of GET /customers.
const sortableHeader =
  (label: string, align: "left" | "right" = "left") =>
  ({ column }: { column: Column<CustomerTableRow, unknown> }) => {
    const sorted = column.getIsSorted();
    const Icon = sorted === "asc" ? ChevronUp : sorted === "desc" ? ChevronDown : ChevronsUpDown;
    return (
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={cn(
          "h-8 px-2",
          align === "right" ? "-mr-2 ml-auto flex" : "-ml-2",
          sorted && "bg-indigo-100 text-indigo-800 hover:bg-indigo-100 dark:bg-indigo-500/20 dark:text-indigo-100"
        )}
        onClick={() => column.toggleSorting(sorted === "asc")}
      >
        {label}
        <Icon className={cn("size-3.5", !sorted && "opacity-40")} />
      </Button>
    );
  };

function formatParts(value?: string | Date | null) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime()) || date.getFullYear() < 2000) return null;
  return { day: format(date, "d MMM yyyy"), time: format(date, "HH:mm") };
}

function daysUntilBirthday(value: string | Date) {
  const birthday = new Date(value);
  if (Number.isNaN(birthday.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const next = new Date(today.getFullYear(), birthday.getMonth(), birthday.getDate());
  if (next < today) next.setFullYear(today.getFullYear() + 1);
  return Math.round((next.getTime() - today.getTime()) / 86_400_000);
}

export const getCustomersColumns = (companyID?: string, franchiseId?: string): ColumnDef<CustomerTableRow>[] => {
  const isFranchise = !!franchiseId;

  const detailPath = (phone: string) => {
    if (franchiseId && companyID) return `/myFranchise/crm/customers/${phone}`;
    if (companyID) return `/company/${companyID}/crm/customers/${phone}`;
    return `/moderator/crm/customers/${phone}`;
  };

  return [
    {
      id: "name",
      accessorKey: "customer.first_name",
      header: sortableHeader("Customer"),
      cell: ({ row }) => {
        const customer = row.original.customer;
        const name = `${customer.first_name ?? ""} ${customer.last_name ?? ""}`.trim();
        const tier = rateTier(row.original.delivery_rate ?? 0, customer.total_orders ?? 0);
        const otherNames = (customer.name_history?.length ?? 0) - 1;
        const address = customer.address_history?.[customer.address_history.length - 1];
        return (
          <Link to={detailPath(customer.phone)} className="group flex min-w-[13rem] items-center gap-3">
            <span
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ring-2 ring-offset-2 ring-offset-background",
                avatarTone(customer.phone),
                isFranchise ? "ring-transparent" : tier.ring
              )}
            >
              {customerInitials(customer.first_name, customer.last_name)}
            </span>
            <span className="min-w-0 space-y-0.5">
              <span className="flex items-center gap-1.5">
                <span
                  className={cn(
                    "truncate text-sm font-semibold group-hover:text-indigo-700 group-hover:underline dark:group-hover:text-indigo-300",
                    !name && "text-muted-foreground"
                  )}
                >
                  {name || "Unnamed customer"}
                </span>
                {otherNames > 0 && (
                  <Badge
                    variant="outline"
                    className="h-5 border-violet-200 bg-violet-50 px-1.5 text-[10px] font-normal text-violet-700 dark:border-violet-800 dark:bg-violet-950 dark:text-violet-200"
                    title={customer.name_history?.join(", ")}
                  >
                    +{otherNames} name{otherNames === 1 ? "" : "s"}
                  </Badge>
                )}
              </span>
              <span className="block max-w-[16rem] truncate text-xs text-muted-foreground">
                {customer.email || address || "No email or address"}
              </span>
            </span>
          </Link>
        );
      },
    },
    {
      id: "phone",
      accessorKey: "customer.phone",
      header: sortableHeader("Phone"),
      cell: ({ row }) => <CustomerPhoneCell phone={row.original.customer.phone} />,
    },
    ...(isFranchise
      ? ([
          {
            id: "total_orders",
            accessorKey: "customer.total_orders",
            header: sortableHeader("Online orders", "right"),
            cell: ({ row }) => (
              <div className="flex justify-end">
                <span className="rounded-md bg-indigo-100 px-2 py-0.5 text-sm font-semibold tabular-nums text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-100">
                  {row.original.customer.total_orders ?? 0}
                </span>
              </div>
            ),
          },
          {
            id: "sales_count",
            accessorKey: "sales_count",
            header: () => <div className="text-right">Store sales</div>,
            enableSorting: false,
            cell: ({ row }) => (
              <div className="flex justify-end">
                <span className="inline-flex items-center gap-1.5 rounded-md bg-sky-100 px-2 py-0.5 text-sm font-semibold tabular-nums text-sky-800 dark:bg-sky-500/20 dark:text-sky-100">
                  <ShoppingCart className="size-3.5" />
                  {row.original.sales_count ?? 0}
                </span>
              </div>
            ),
          },
        ] as ColumnDef<CustomerTableRow>[])
      : ([
          {
            id: "total_orders",
            accessorKey: "customer.total_orders",
            header: sortableHeader("Orders", "right"),
            cell: ({ row }) => {
              const total = row.original.customer.total_orders ?? 0;
              const delivered = row.original.customer.delivered_orders ?? 0;
              const other = Math.max(0, total - delivered);
              return (
                <div className="ml-auto w-24 space-y-1 text-right tabular-nums">
                  <div className="text-sm font-semibold">{total.toLocaleString()}</div>
                  <div className="flex h-1 overflow-hidden rounded-full bg-muted" aria-hidden>
                    <div className="bg-emerald-500" style={{ flexGrow: delivered }} />
                    <div className="bg-rose-300 dark:bg-rose-500/60" style={{ flexGrow: other }} />
                  </div>
                  <div className="text-[11px] text-emerald-700 dark:text-emerald-300">{delivered.toLocaleString()} delivered</div>
                </div>
              );
            },
          },
          {
            id: "delivery_rate",
            accessorKey: "delivery_rate",
            header: sortableHeader("Delivery rate"),
            cell: ({ row }) => {
              const rate = row.original.delivery_rate ?? 0;
              const tier = rateTier(rate, row.original.customer.total_orders ?? 0);
              return (
                <div className="w-36 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className={cn("text-sm font-semibold tabular-nums", tier.text)}>{rate.toFixed(0)}%</span>
                    <Badge variant="outline" className={cn("h-5 px-1.5 text-[10px] font-medium", tier.chip)}>
                      {tier.label}
                    </Badge>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden>
                    <div className={cn("h-full rounded-full", tier.bar)} style={{ width: `${Math.min(100, Math.max(0, rate))}%` }} />
                  </div>
                </div>
              );
            },
          },
        ] as ColumnDef<CustomerTableRow>[])),
    {
      id: "last_update",
      accessorKey: "customer.updated_at",
      header: sortableHeader("Last update"),
      cell: ({ row }) => {
        const updated = formatParts(row.original.customer.updated_at);
        const synced = formatParts(row.original.customer.stats_updated_at);
        if (!updated) return <span className="text-sm text-muted-foreground">—</span>;
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="flex cursor-default items-center gap-2">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-200">
                    <Clock className="size-3.5" />
                  </span>
                  <span>
                    <span className="block text-sm font-medium">{updated.day}</span>
                    <span className="block text-xs text-muted-foreground">{updated.time}</span>
                  </span>
                </span>
              </TooltipTrigger>
              <TooltipContent>{synced ? `Stats synced ${synced.day}, ${synced.time}` : "Stats never synced"}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      },
    },
    {
      id: "birthday",
      accessorKey: "customer.birthday",
      header: sortableHeader("Birthday"),
      cell: ({ row }) => {
        const birthday = row.original.customer.birthday;
        if (!birthday) return <span className="text-sm text-muted-foreground">—</span>;
        const days = daysUntilBirthday(birthday);
        const soon = days !== null && days <= 7;
        return (
          <div className="flex items-center gap-1.5">
            <Cake className={cn("size-4", soon ? "text-pink-500" : "text-pink-300 dark:text-pink-400/60")} />
            <span className="text-sm">{format(new Date(birthday), "d MMM")}</span>
            {soon && (
              <Badge className="h-5 border-transparent bg-gradient-to-r from-pink-500 to-rose-500 px-1.5 text-[10px] text-white hover:from-pink-500">
                {days === 0 ? "Today" : `in ${days}d`}
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => (
        <Button asChild variant="outline" size="sm" className={tone.indigo}>
          <Link to={detailPath(row.original.customer.phone)}>
            <Eye />
            View
          </Link>
        </Button>
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ];
};

// Backward compatibility - export default columns without companyID
export const customersColumns = getCustomersColumns();
