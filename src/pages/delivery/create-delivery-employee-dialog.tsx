import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { DeliveryCompany } from "@/models/data/delivery.model";
import { CreateEmployeeSchema, createEmployeeSchema } from "@/schemas/delivery";
import { createDeliveryEmployee } from "@/services/delivery-service";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

export default function CreateDeliveryEmployeeDialog({ open, onOpenChange, company }: { open: boolean; onOpenChange: (open: boolean) => void; company: DeliveryCompany | null }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const form = useForm<CreateEmployeeSchema>({
    resolver: zodResolver(createEmployeeSchema),
    defaultValues: { delivery_company_id: company?.ID ?? 0 },
  });
  useEffect(() => {
    form.setValue("delivery_company_id", company?.ID ?? 0);
  }, [company, form]);

  const mutation = useMutation({
    mutationFn: createDeliveryEmployee,
    onSuccess: () => {
      toast({ title: "Employee Created", description: "Delivery employee created successfully!" });
      queryClient.invalidateQueries({ queryKey: ["delivery-employees", Number(company?.ID)] });
      queryClient.invalidateQueries({ queryKey: ["delivery-companies"] });
      onOpenChange(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({ title: "Error Creating Employee", description: error.message, variant: "destructive" });
    },
    onSettled: () => setLoading(false),
  });
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Delivery Employee</DialogTitle>
          <DialogDescription>Create a new delivery employee for this company.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => { setLoading(true); mutation.mutate(data); })} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>Employee name</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormDescription>Employee email</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormDescription>Employee password</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <input type="hidden" {...form.register("delivery_company_id")}/>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" type="button">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={loading || !company}>{loading ? "Creating..." : "Create"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 