import { RootState } from "@/app/store";
import { Button } from "@/components/ui/button";
import Combobox from "@/components/ui/combobox";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { FRANCHISE_TYPES } from "@/models/data/franchise.model";
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
      name: "",
      address: "",
      city: "",
      state: "",
      franchise_admin_name: "",
      franchise_admin_email: "",
      franchise_admin_password: "",
      franchise_type: "normal",
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
    onError: (error) => {
      toast({
        title: "Error creating franchise",
        description: error.message,
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
        <DialogHeader>
          <DialogTitle>Add Franchise</DialogTitle>
          <DialogDescription>Create a new franchise for your company.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
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
            <div className="flex gap-2">
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
            </div>
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
            <FormField
              name="franchise_type"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Franchise Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select franchise type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={FRANCHISE_TYPES.NORMAL}>Normal Franchise</SelectItem>
                      <SelectItem value={FRANCHISE_TYPES.VIP}>VIP Franchise</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Form>
        </div>
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
