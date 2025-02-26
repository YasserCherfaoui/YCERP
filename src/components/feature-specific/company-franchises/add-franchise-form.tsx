import { RootState } from "@/app/store";
import { Button } from "@/components/ui/button";
import Combobox from "@/components/ui/combobox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import {
  CreateFranchiseSchema,
  createFranchiseSchema,
} from "@/schemas/franchise";
import { createFranchise } from "@/services/franchise-service";
import { algeriaCitiesList, algeriaWilaya } from "@/utils/algeria-cities";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";

export default function () {
  const [isOpen, setIsOpen] = useState(false);
  const company = useSelector((state: RootState) => state.company.company);
  const form = useForm<CreateFranchiseSchema>({
    resolver: zodResolver(createFranchiseSchema),
    defaultValues: {
      company_id: company?.ID,
    },
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { mutate: createFranchiseMutation, isPending } = useMutation({
    onSuccess: () => {
      setIsOpen(false);
      form.reset();
      queryClient.invalidateQueries({
        queryKey: ["franchises"],
      });
    },
    onError: () => {
      toast({
        title: "Error creating franchise",
        description: "Something went wrong",
        variant: "destructive",
      });
    },
    mutationFn: createFranchise,
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          Add Franchise
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Add Franchise</DialogTitle>
        <DialogDescription className="flex flex-col gap-4">
          <Form {...form}>
            <FormField
              name="name"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Franchise Name</FormLabel>
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
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Combobox
              name="state"
              label="Wilaya"
              values={algeriaWilaya}
              form={form}
            />
            <Combobox
              name="city"
              label="City"
              values={algeriaCitiesList
                .filter((c) => {
                  return c.wilaya_name_ascii == form.watch("state");
                })
                .map((c) => c.commune_name_ascii)}
              form={form}
            />
            <FormField
              name="franchise_admin_name"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Franchise Admin Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="franchise_admin_email"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Franchise Admin Email</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="franchise_admin_password"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Franchise Admin Password</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Form>
        </DialogDescription>
        <DialogFooter>
          <DialogTrigger asChild>
            <Button variant="outline">Cancel</Button>
          </DialogTrigger>
          <Button
            disabled={isPending}
            onClick={form.handleSubmit((data) => createFranchiseMutation(data))}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
