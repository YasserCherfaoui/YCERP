import { RootState } from "@/app/store";
import Comp13 from "@/components/comp-13";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { SupplierResponse } from "@/models/data/supplier.model";
import {
  CreateSupplierPayment,
  createSupplierPayment,
} from "@/schemas/supplier";
import { addSupplierPayment } from "@/services/supplier-service";
import { zodResolver } from "@hookform/resolvers/zod";
import { Icon } from "@iconify/react";
import { DialogTitle } from "@radix-ui/react-dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";

interface Props {
  supplier: SupplierResponse;
}

export default function ({ supplier }: Props) {
  const company = useSelector((state: RootState) => state.company.company);
  const user = useSelector((state: RootState) => state.auth.user);

  const form = useForm<CreateSupplierPayment>({
    resolver: zodResolver(createSupplierPayment),
    defaultValues: {
      company_id: company?.ID ?? 0,
      supplier_id: supplier.supplier.ID,
      administrator_id: user?.ID,
      amount: 0,
      comment: "",
    },
  });

  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { isPending, mutate: createSupplierPaymentMutation } = useMutation({
    mutationFn: addSupplierPayment,
    onSuccess: () => {
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["supplier-bills"] });
      queryClient.invalidateQueries({ queryKey: ["supplier"] });
      toast({
        title: "Success",
        description: "Payment recorded successfully",
      });
    },
    onError: (error) => {
      console.log(error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Icon icon="solar:hand-money-linear" />
          Record Payment
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex gap-2">
            <Icon icon="solar:hand-money-linear" />
            Record Payment
          </DialogTitle>
        </DialogHeader>
        <Card>
          <CardHeader>
            <CardTitle>{supplier.supplier.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              <span className="text-muted-foreground text-sm">Amount Due</span>
              <span className="text-2xl">
                {new Intl.NumberFormat("en-DZ", {
                  style: "currency",
                  currency: "DZD",
                }).format(supplier.totals.Due)}
              </span>
            </div>
          </CardContent>
        </Card>
        <Form {...form}>
          <FormField
            name="amount"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount to Pay</FormLabel>
                <FormControl>
                  <Comp13
                    {...field}
                    type="number"
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="comment"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount to Pay</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Form>
        <DialogFooter>
          <Button onClick={() => setOpen(false)}>Close</Button>
          <Button
            disabled={isPending}
            onClick={form.handleSubmit(
              (data) => createSupplierPaymentMutation(data),
              console.error
            )}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
