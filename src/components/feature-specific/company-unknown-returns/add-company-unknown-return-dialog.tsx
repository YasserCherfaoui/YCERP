import { RootState } from "@/app/store";
import { ProductVariantCombobox } from "@/components/feature-specific/company-products/product-variant-combobox";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import {
    createUnknownReturnSchema,
    CreateUnknownReturnSchema,
} from "@/schemas/return-schema";
import { getCompanyInventory } from "@/services/inventory-service";
import { createCompanyUnknownReturn } from "@/services/return-service";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";

export default function () {
  const [isOpen, setIsOpen] = useState(false);
  const company = useSelector((state: RootState) => state.company.company);
  const form = useForm<CreateUnknownReturnSchema>({
    resolver: zodResolver(createUnknownReturnSchema),
    defaultValues: {
      return_items: [],
      cost: 0,
      location_id: company?.ID ?? 0,
    },
  });
  const { data: inventory } = useQuery({
    queryKey: ["products-variants"],
    queryFn: () => getCompanyInventory(company?.ID ?? 0),
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { mutate: createUnknownReturn, isPending } = useMutation({
    mutationFn: createCompanyUnknownReturn,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["company-unknown-returns"],
      });
      toast({
        title: "Return created",
        description: "Return created successfully",
      });
      setIsOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          Unknown Return
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Unknown Return</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <>
            <Button
              onClick={() => {
                form.setValue("return_items", [
                  {
                    product_variant_id: 0,
                    quantity: 1,
                  },
                  ...form.watch("return_items"),
                ]);
              }}
            >
              <Plus /> Add Product
            </Button>
            <ScrollArea className="max-h-[400px]">
              <Table>
                <TableHeader>
                  <TableHead>Product</TableHead>
                  <TableHead>Qty</TableHead>
                </TableHeader>
                <TableBody>
                  {form.watch("return_items").map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <FormField
                          name={`return_items.${i}.product_variant_id`}
                          control={form.control}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <ProductVariantCombobox
                                  variants={
                                    inventory?.data?.items.map(
                                      (item) => item.product_variant!
                                    ) ?? []
                                  }
                                  value={field.value}
                                  onChange={field.onChange}
                                  placeholder="Select a variant..."
                                  disabled={field.disabled}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <FormField
                          name={`return_items.${i}.quantity`}
                          control={form.control}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="number"
                                  onChange={(e) => {
                                    field.onChange(
                                      parseInt(e.target.value) ?? 0
                                    );
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TableCell>

                      <TableCell>
                        <Button
                          variant={"ghost"}
                          onClick={() =>
                            form.setValue(
                              "return_items",
                              form
                                .watch("return_items")
                                .filter((_, idx) => idx !== i)
                            )
                          }
                        >
                          <X />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </>
          <FormField
            name={`cost`}
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cost</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    onChange={(e) => {
                      field.onChange(parseInt(e.target.value) ?? 0);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Form>
        {/* Card of Totals */}
        <div className="flex justify-end">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between gap-2">
              <p>Amount:</p>
              <p>
                {form.watch("return_items").reduce((acc, item) => {
                  const variant = inventory?.data?.items.find(
                    (i) => i.product_variant?.ID === item.product_variant_id
                  );
                  if (!variant) return acc;
                  return acc + (variant.product?.price ?? 0) * item.quantity;
                }, 0)}
              </p>
            </div>
            <div className="flex justify-between">
              <p>Total</p>
              <p>
                {form.watch("return_items").reduce((acc, item) => {
                  const variant = inventory?.data?.items.find(
                    (i) => i.product_variant?.ID === item.product_variant_id
                  );
                  if (!variant) return acc;
                  return acc + (variant.product?.price ?? 0) * item.quantity;
                }, 0) + form.watch("cost")}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant={"outline"} onClick={() => setIsOpen(false)}>
            Close
          </Button>
          <Button
            disabled={isPending}
            onClick={form.handleSubmit((data) => {
              createUnknownReturn(data);
            }, console.error)}
            type="submit"
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
