import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { DeliveryEmployee } from "@/models/data/delivery.model";
import { printDeliveryEmployeeTable } from "@/services/woocommerce-service";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const schema = z.object({
  delivery_employee_id: z.number({ required_error: "Employee is required" }),
  delivery_date: z.date({ required_error: "Date is required" }),
});

type PrintDeliveryEmployeeTableForm = z.infer<typeof schema>;

export default function PrintDeliveryEmployeeTableDialog({ open, onOpenChange, employees }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employees: DeliveryEmployee[];
}) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const form = useForm<PrintDeliveryEmployeeTableForm>({
    resolver: zodResolver(schema),
    defaultValues: { delivery_employee_id: undefined, delivery_date: undefined },
  });

  const mutation = useMutation({
    mutationFn: async (data: PrintDeliveryEmployeeTableForm) => {
      const d = data.delivery_date;
      const localDate = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
      await printDeliveryEmployeeTable({
        delivery_employee_id: data.delivery_employee_id,
        delivery_date: localDate,
      });
    },
    onSuccess: () => {
      toast({ title: "Print Started", description: "The delivery employee table is being printed." });
      onOpenChange(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({ title: "Error Printing Table", description: error.message, variant: "destructive" });
    },
    onSettled: () => setLoading(false),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Print Delivery Employee Table</DialogTitle>
          <DialogDescription>Select an employee and expected date to print the table.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => { setLoading(true); mutation.mutate(data); })} className="space-y-4">
            <FormField
              control={form.control}
              name="delivery_employee_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employee</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value ? String(field.value) : undefined}
                      onValueChange={(val) => field.onChange(Number(val))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select employee" />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.map((emp) => (
                          <SelectItem key={emp.ID} value={String(emp.ID)}>{emp.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormDescription>Choose the delivery employee.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="delivery_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expected Date</FormLabel>
                  <FormControl>
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </FormControl>
                  <FormDescription>Pick the expected delivery date.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" type="button">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={loading}>{loading ? "Printing..." : "Print"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 