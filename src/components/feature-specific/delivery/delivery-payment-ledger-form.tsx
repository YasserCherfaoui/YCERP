import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { DeliveryEmployee } from "@/models/data/delivery.model";
import {
  CreateDeliveryPaymentSchema,
  createDeliveryPaymentSchema,
} from "@/schemas/delivery";
import { createDeliveryEmployeePayment } from "@/services/delivery-payments-service";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";

export default function DeliveryPaymentLedgerForm({
  employees,
}: {
  employees: DeliveryEmployee[];
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const form = useForm<CreateDeliveryPaymentSchema>({
    resolver: zodResolver(createDeliveryPaymentSchema),
    defaultValues: {
      delivery_employee_id: undefined as unknown as number,
      amount: undefined as unknown as number,
      notes: "",
    },
  });

  const mutation = useMutation({
    mutationFn: createDeliveryEmployeePayment,
    onSuccess: (_res, vars) => {
      toast({
        title: "Payment recorded",
        description: "Cash collected from the delivery employee was saved.",
      });
      queryClient.invalidateQueries({ queryKey: ["delivery-employee-payments"] });
      queryClient.invalidateQueries({ queryKey: ["employee-payments-sum"] });
      queryClient.invalidateQueries({
        queryKey: ["delivery-employee-payments", vars.delivery_employee_id],
      });
      form.reset({
        delivery_employee_id: undefined as unknown as number,
        amount: undefined as unknown as number,
        notes: "",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to record payment",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>Payment ledger</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
            className="flex flex-col sm:flex-row gap-4 items-end"
          >
            <FormField
              control={form.control}
              name="delivery_employee_id"
              render={({ field }) => (
                <FormItem className="w-full sm:w-[220px]">
                  <FormLabel>Delivery employee</FormLabel>
                  <Select
                    value={field.value ? String(field.value) : undefined}
                    onValueChange={(v) => field.onChange(Number(v))}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select employee" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {employees.map((emp) => (
                        <SelectItem key={emp.ID} value={String(emp.ID)}>
                          {emp.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem className="w-full sm:w-[160px]">
                  <FormLabel>Amount (DZD)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      step={1}
                      placeholder="0"
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === "" ? undefined : Number(e.target.value)
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving..." : "Record payment"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
