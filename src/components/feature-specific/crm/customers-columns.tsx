import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { Customer } from "@/models/data/customer.model";
import { Phone, Mail, Calendar, Eye, Package, PackageCheck, Clock, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";

export type CustomerTableRow = {
  customer: Customer;
  delivery_rate: number;
};

export const getCustomersColumns = (companyID?: string, franchiseId?: string): ColumnDef<CustomerTableRow>[] => {
  const isFranchise = !!franchiseId;
  
  const baseColumns: ColumnDef<CustomerTableRow>[] = [
    {
      accessorKey: "customer.first_name",
      header: "Name",
      cell: ({ row }) => {
        const customer = row.original.customer;
        return (
          <div className="font-medium">
            {customer.first_name} {customer.last_name}
          </div>
        );
      },
    },
    {
      accessorKey: "customer.phone",
      header: "Phone",
      cell: ({ row }) => {
        const phone = row.original.customer.phone;
        return (
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            {phone}
          </div>
        );
      },
    },
    {
      accessorKey: "customer.email",
      header: "Email",
      cell: ({ row }) => {
        const email = row.original.customer.email;
        if (!email) return <span className="text-muted-foreground">-</span>;
        return (
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            {email}
          </div>
        );
      },
    },
    // Total Sales for franchise, Total Orders for regular customers
    {
      accessorKey: "customer.total_orders",
      header: isFranchise ? "Total Sales" : "Total Orders",
      cell: ({ row }) => {
        const totalOrders = row.original.customer.total_orders ?? 0;
        return (
          <div className="flex items-center gap-2">
            {isFranchise ? (
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Package className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="font-medium">{totalOrders}</span>
          </div>
        );
      },
    },
    // Only show delivered orders and delivery rate for non-franchise customers
    ...(isFranchise ? [] : [
      {
        accessorKey: "customer.delivered_orders",
        header: "Delivered Orders",
        cell: ({ row }) => {
          const deliveredOrders = row.original.customer.delivered_orders ?? 0;
          return (
            <div className="flex items-center gap-2">
              <PackageCheck className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{deliveredOrders}</span>
            </div>
          );
        },
      } as ColumnDef<CustomerTableRow>,
      {
        accessorKey: "delivery_rate",
        header: "Delivery Rate",
        cell: ({ row }) => {
          const rate = row.original.delivery_rate;
          return (
            <span
              className={
                rate >= 80
                  ? "text-green-600 font-semibold"
                  : rate >= 50
                  ? "text-yellow-600 font-semibold"
                  : "text-red-600 font-semibold"
              }
            >
              {rate.toFixed(1)}%
            </span>
          );
        },
      } as ColumnDef<CustomerTableRow>,
    ]),
  {
    accessorKey: "customer.updated_at",
    header: "Last Update",
    cell: ({ row }) => {
      const updatedAt = row.original.customer.updated_at;
      if (!updatedAt) return <span className="text-muted-foreground">-</span>;
      const date = new Date(updatedAt);
      return (
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            {date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "customer.birthday",
    header: "Birthday",
    cell: ({ row }) => {
      const birthday = row.original.customer.birthday;
      if (!birthday) return <span className="text-muted-foreground">-</span>;
      return (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          {new Date(birthday).toLocaleDateString()}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const customer = row.original.customer;
      let linkPath = `/crm/customers/${customer.phone}`;
      if (franchiseId && companyID) {
        // For franchise routes accessed from /myFranchise, use the myFranchise path
        linkPath = `/myFranchise/crm/customers/${customer.phone}`;
      } else if (companyID) {
        linkPath = `/company/${companyID}/crm/customers/${customer.phone}`;
      }
      return (
        <Link to={linkPath}>
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
        </Link>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
];

  return baseColumns;
};

// Backward compatibility - export default columns without companyID
export const customersColumns = getCustomersColumns();

