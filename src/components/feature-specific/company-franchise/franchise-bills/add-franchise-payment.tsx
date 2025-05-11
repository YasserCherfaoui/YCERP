import { RootState } from "@/app/store";
import Comp13 from "@/components/comp-13";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { CreateFranchisePayment, createFranchisePaymentSchema } from "@/schemas/bill";
import { recordFranchisePayment } from "@/services/bill-service";
import { getFranchisePaymentTotals } from "@/services/franchise-service";
import { zodResolver } from "@hookform/resolvers/zod";
import { Icon } from "@iconify/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";





export default function AddFranchisePayment() {
  const company = useSelector((state: RootState) => state.company.company);
  const user = useSelector((state: RootState) => state.auth.user);
  const franchise = useSelector((state:RootState)=> state.franchise.franchise);
  const form = useForm<CreateFranchisePayment>({
    resolver: zodResolver(createFranchisePaymentSchema),
    defaultValues: {
      company_id: company?.ID ?? 0,
      franchise_id: franchise?.ID ?? 0,
      administrator_id: user?.ID,
      amount: 0,
      comment: "",
    },
  });

  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { isPending, mutate: createFranchisePaymentMutation } = useMutation({
    mutationFn: recordFranchisePayment,
    onSuccess: () => {
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["franchise-exit-bills"] });
      queryClient.invalidateQueries({ queryKey: ["franchise-entry-bills"] });
      queryClient.invalidateQueries({ queryKey: ["franchise-totals"] });
      toast({
        title: "Success",
        description: "Payment recorded successfully",
      });
      form.reset();
    },
    onError: (error) => {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to record payment",
        variant: "destructive",
      });
    },
  });

  const { data: paymentTotals } = useQuery({
    queryKey: ["franchise-totals"],
    queryFn: () => getFranchisePaymentTotals(franchise?.ID ?? 0),
    enabled: !!franchise,
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Icon icon="solar:hand-money-linear" className="mr-2" />
          Record Payment
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon icon="solar:hand-money-linear" />
            Record Franchise Payment
          </DialogTitle>
        </DialogHeader>
        <Card>
          <CardHeader>
            <CardTitle>{franchise?.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              <span className="text-muted-foreground text-sm">Amount Due</span>
              <span className="text-2xl">
                {new Intl.NumberFormat("en-DZ", {
                  style: "currency",
                  currency: "DZD",
                }).format(paymentTotals?.data?.totals.due ?? 0)}
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
                <FormLabel>Comment</FormLabel>
                <FormControl>
                  <Textarea {...field} placeholder="Add payment details..." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Form>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            disabled={isPending}
            onClick={form.handleSubmit(
              (data) => createFranchisePaymentMutation(data),
              console.error
            )}
          >
            {isPending ? "Recording..." : "Record Payment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
