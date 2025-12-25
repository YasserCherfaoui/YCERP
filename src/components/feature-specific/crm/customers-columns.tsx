import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { Customer } from "@/models/data/customer.model";
import { Phone, Mail, Calendar, Eye } from "lucide-react";
import { Link } from "react-router-dom";

export type CustomerTableRow = {
  customer: Customer;
  delivery_rate: number;
};

export const getCustomersColumns = (companyID?: string): ColumnDef<CustomerTableRow>[] => [
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
      const linkPath = companyID 
        ? `/company/${companyID}/crm/customers/${customer.phone}`
        : `/crm/customers/${customer.phone}`;
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

// Backward compatibility - export default columns without companyID
export const customersColumns = getCustomersColumns();

