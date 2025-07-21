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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

export default function () {
  const [isOpen, setIsOpen] = useState(false);
  let company = useSelector((state: RootState) => state.company.company);
  const { pathname } = useLocation();
  const isModerator = pathname.includes("moderator");
  if (isModerator) {
    company = useSelector((state: RootState) => state.user.company);
  }
  const [input, setInput] = useState<string>("");
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
  useEffect(() => {
    let timeout = setTimeout(() => {
      if (input.length != 0) {
        let found = false;
        for (let item of inventory?.data?.items ?? []) {
          if (item.product_variant && item.product_variant.qr_code == input) {
            toast({
              title: "Product added",
              description: `Added ${item.product_variant?.qr_code} to return`,
            });
            let inputIndex = form
              .watch("return_items")
              .findIndex(
                (i) => i.product_variant_id === item.product_variant?.ID
              );
            if (inputIndex != -1) {
              form.setValue(
                `return_items.${inputIndex}.quantity`,
                form.watch(`return_items.${inputIndex}.quantity`) + 1
              );
              found = true;
              break;
            } else {
              form.setValue(
                `return_items.${form.watch("return_items").length}`,
                {
                  product_variant_id: item.product_variant_id,
                  quantity: 1,
                }
              );
              found = true;
              break;
            }
          }
        }
        if (!found) {
          toast({
            title: "Product not found",
            description: `Product with barcode ${input} not found`,
            variant: "destructive",
          });
        }
        setInput("");
      }
    }, 1000);
    return () => {
      clearTimeout(timeout);
    };
  }, [input]);
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
            <Input
              autoFocus
              placeholder="Scan barcode..."
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
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
          <FormField
            name={`return_type`}
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Return Type</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="algiers" />
                      </FormControl>
                      <FormLabel className="font-normal">Algiers</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="warehouse" />
                      </FormControl>
                      <FormLabel className="font-normal">Warehouse</FormLabel>
                    </FormItem>
                  </RadioGroup>
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
