import DeliveryOrdersActions from "@/components/feature-specific/delivery/delivery-orders-actions";
import { ConfirmedOrderItemsAccordion } from "@/components/feature-specific/orders/order-line-items-accordion";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { DeliveryEmployee } from "@/models/data/delivery.model";
import { WooOrder } from "@/models/data/woo-order.model";
import { getDeliveryEmployees } from "@/services/delivery-service";
import { updateWooCommerceOrder } from "@/services/woocommerce-service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { Calendar as CalendarIcon } from "lucide-react";
import { useEffect, useState } from "react";

export const deliveryOrdersColumns = ({ ordersQueryKey }: { ordersQueryKey: any[] }) : ColumnDef<WooOrder, { id: number }>[] => [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }: { row: { original: WooOrder } }) => (
      <div
        className="text-center"
        style={{
          backgroundColor: row.original.is_exchange ? "red" : "transparent",
          color: "white",
          padding: "2px 4px",
          borderRadius: "4px",
        }}
      >
        {row.original.id}
      </div>
    ),
  },
  {
    accessorKey: "billing_name",
    header: "Full Name",
  },
  {
    accessorKey: "total",
    header: "Total",
    cell: ({ row }: { row: { original: WooOrder } }) =>
      new Intl.NumberFormat("en-DZ", {
        style: "currency",
        currency: "DZD",
      }).format(Number(row.original.total)),
  },

  {
    id: "confirmed_order_items",
    header: "Confirmed Items",
    cell: ({ row }: { row: { original: WooOrder } }) => (
      <ConfirmedOrderItemsAccordion
        confirmedOrderItems={row.original.confirmed_order_items || []}
        orderNumber={row.original.number}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "customer_phone",
    header: "Customer Phone",
    id: "customer_phone",
  },
  {
    accessorKey: "date_created",
    header: "Date Created",
    cell: ({ row }: { row: { original: WooOrder } }) =>
      new Date(row.original.date_created).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
  },
  {
    header: "Commune",
    cell: ({ row }: { row: { original: WooOrder } }) => {
      const communeName = row.original.woo_shipping?.commune_name;
      return <div className="text-center">{communeName}</div>;
    },
  },
  {
    header: "Price",
    accessorKey: "final_price",
    cell: ({ row }: { row: { original: WooOrder } }) =>
      new Intl.NumberFormat("en-DZ", {
        style: "currency",
        currency: "DZD",
      }).format(Number(row.original.final_price)),
  },
  {
    id: "delivery_employee",
    header: "Delivery Employee",
    cell: ({ row }: { row: { original: WooOrder } }) => {
      const [employees, setEmployees] = useState<DeliveryEmployee[]>([]);
      const [selectedEmployee, setSelectedEmployee] = useState<number | undefined>(row.original.woo_shipping?.employee_id);
      const { toast } = useToast();
      const queryClient = useQueryClient();
      const mutation = useMutation({
        mutationFn: updateWooCommerceOrder,
        onSuccess: () => {
          toast({ title: "Success", description: "Employee updated successfully" });
          queryClient.invalidateQueries({ queryKey: ordersQueryKey });
        },
        onError: (err: any) => {
          toast({ title: "Error", description: err.message, variant: "destructive" });
        },
      });
      useEffect(() => {
        getDeliveryEmployees(1).then(res => setEmployees(res.data || []));
      }, []);
      const handleChange = (val: string) => {
        const employeeId = val ? Number(val) : undefined;
        setSelectedEmployee(employeeId);
        mutation.mutate({
          id: row.original.id,
          shipping: {
            ...row.original.woo_shipping,
            employee_id: employeeId,
          },
        });
      };
      return (
        <Select
          value={selectedEmployee ? String(selectedEmployee) : ""}
          onValueChange={handleChange}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Select employee" />
          </SelectTrigger>
          <SelectContent>
            {employees.map(emp => (
              <SelectItem key={emp.ID} value={String(emp.ID)}>
                {emp.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "expected_delivery_date",
    header: "Expected Delivery Date",
    cell: ({ row }: { row: { original: WooOrder } }) => {
      const [date, setDate] = useState<Date | undefined>(row.original.woo_shipping?.expected_delivery_date ? new Date(row.original.woo_shipping?.expected_delivery_date) : undefined);
      const { toast } = useToast();
      const queryClient = useQueryClient();
      const mutation = useMutation({
        mutationFn: updateWooCommerceOrder,
        onSuccess: () => {
          toast({ title: "Success", description: "Expected delivery date updated successfully" });
          queryClient.invalidateQueries({ queryKey: ordersQueryKey });
        },
        onError: (err: any) => {
          toast({ title: "Error", description: err.message, variant: "destructive" });
        },
      });
      const handleDateChange = (selected?: Date) => {
        setDate(selected);
        mutation.mutate({
          id: row.original.id,
          shipping: {
            ...row.original.woo_shipping,
            expected_delivery_date: selected
              ? selected.toLocaleDateString("en-US")
              : undefined,
          },
        });
      };
      return (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={"w-44 justify-start text-left font-normal" + (!date ? " text-muted-foreground" : "")}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateChange}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "comments",
    header: "Comments",
    cell: ({ row }: { row: { original: WooOrder } }) => {
      const [open, setOpen] = useState(false);
      const [comment, setComment] = useState(row.original.comments || "");
      const [input, setInput] = useState(row.original.comments || "");
      const { toast } = useToast();
      const queryClient = useQueryClient();
      const mutation = useMutation({
        mutationFn: updateWooCommerceOrder,
        onSuccess: () => {
          toast({ title: "Success", description: "Comment updated successfully" });
          queryClient.invalidateQueries({ queryKey: ordersQueryKey });
          setComment(input);
          setOpen(false);
        },
        onError: (err: any) => {
          toast({ title: "Error", description: err.message, variant: "destructive" });
        },
      });
      const handleSave = () => {
        mutation.mutate({
          id: row.original.id,
          shipping: {
            ...row.original.woo_shipping,
          },
          comments: input,
        });
      };
      return (
        <>
          <span
            className="underline cursor-pointer text-blue-600"
            onClick={() => setOpen(true)}
          >
            {comment ? comment : <span className="text-muted-foreground">Add comment</span>}
          </span>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Comment</DialogTitle>
              </DialogHeader>
              <Textarea
                value={input}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)}
                placeholder="Enter comment..."
                rows={5}
              />
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" type="button">Cancel</Button>
                </DialogClose>
                <Button onClick={handleSave} disabled={mutation.status === 'pending'}>
                  {mutation.status === 'pending' ? "Saving..." : "Save"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }: { row: { original: WooOrder } }) => (
      <DeliveryOrdersActions order={row.original} ordersQueryKey={ordersQueryKey} />
    ),
    enableSorting: false,
    enableHiding: false,
  },
];
