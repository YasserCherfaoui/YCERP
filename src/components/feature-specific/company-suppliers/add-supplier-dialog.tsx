import { RootState } from "@/app/store";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { CreateSupplierSchema, createSupplierSchema } from "@/schemas/supplier";
import { createSupplier } from "@/services/supplier-service";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UserPlus, UserRoundPlus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

export default function () {
  let company = useSelector((state: RootState) => state.company.company);
  const user = useSelector((state: RootState) => state.user.user);
  const { pathname } = useLocation();
  if (pathname.includes("moderator")) {
    company = useSelector((state: RootState) => state.user.company);
  }
  const administrator = useSelector((state: RootState) => state.auth.user);

  if (!company) return;
  const [open, setOpen] = useState(false);
  const form = useForm<CreateSupplierSchema>({
    resolver: zodResolver(createSupplierSchema),
    defaultValues: {
      company_id: company.ID,
      administrator_id: administrator?.ID,
      user_id: user?.ID,
    },
  });
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { mutate: createSupplierMutation, isPending } = useMutation({
    mutationFn: createSupplier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      toast({
        title: "Supplier Created",
        description: "Supplier was created successfully",
      });
      form.reset();
      setOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error creating supplier",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSaveClicked = (data: CreateSupplierSchema) => {
    createSupplierMutation(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button>
          <UserRoundPlus />
          Add Supplier
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex gap-2 items-center">
            <UserPlus /> Add Supplier
          </DialogTitle>
          <DialogDescription>
            Please fill the form below to add a new supplier.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <FormField
            name="supplier_name"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Supplier Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="address"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Supplier Address</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="phone_number"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Supplier Phone</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Form>
        <DialogFooter>
          <Button variant={"outline"}>Cancel</Button>
          <Button
            disabled={isPending}
            onClick={form.handleSubmit(onSaveClicked, console.error)}
          >
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
