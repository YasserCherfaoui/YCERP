import { RootState } from "@/app/store";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
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
import { Sale } from "@/models/data/sale.model";
import {
    CreateSaleReturnSchema,
    makeCreateSaleReturnSchema,
} from "@/schemas/return-schema";
import { getCompanyInventory } from "@/services/inventory-service";
import { createReturnSale } from "@/services/return-service";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PackageMinus, Plus, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { ProductVariantCombobox } from "../company-products/product-variant-combobox";

interface Props {
  sale: Sale;
}

export default function ({ sale }: Props) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const form = useForm<CreateSaleReturnSchema>({
    resolver: zodResolver(makeCreateSaleReturnSchema(sale)),
    defaultValues: {
      sale_id: sale.ID,
      return_items: sale.sale_items.map((s) => ({
        product_variant_id: s.product_variant_id,
        quantity: 0,
      })),
      exchange_items: [],
      comment: "",
      type: "",
      cost: 0,
      exchange_discount: 0,
      extra_costs: 0,
      reason: "",
    },
  });
  const company = useSelector((state: RootState) => state.company.company);
  const { data: inventory } = useQuery({
    queryKey: ["products-variants"],
    queryFn: () => getCompanyInventory(company?.ID ?? 0),
  });
  const queryClient = useQueryClient();
  const { mutate: CreateReturnMutation, isPending } = useMutation({
    mutationFn: createReturnSale,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["sales"],
      });
      toast({
        title: "Return created",
        description: "Return created successfully",
      });
      setOpen(false);
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <DropdownMenuItem
          className="text-blue-500"
          disabled={sale.return != null}
          onSelect={(e) => e.preventDefault()}
        >
          <PackageMinus />
          Make a return
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a return for sale S-{sale.ID}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <ScrollArea className="max-h-[400px]">
            <Accordion type="single" collapsible>
              <AccordionItem value="returned-items">
                <AccordionTrigger>Return Items</AccordionTrigger>
                <AccordionContent>
                  <Table>
                    <TableHeader>
                      <TableHead>Product</TableHead>
                      <TableHead>Qty</TableHead>
                    </TableHeader>
                    <TableBody>
                      {sale.sale_items.map((s, i) => (
                        <TableRow>
                          <TableCell>{s.product_variant.qr_code}</TableCell>
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
                                      max={s.quantity}
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
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <FormField
                    name={`cost`}
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Return Cost</FormLabel>
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
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="exchanged-items">
                <AccordionTrigger>Exchanged Items</AccordionTrigger>
                <AccordionContent>
                  <>
                    <Button
                      onClick={() => {
                        form.setValue("exchange_items", [
                          {
                            product_variant_id: 0,
                            quantity: 1,
                            discount: 0,
                          },
                          ...form.watch("exchange_items"),
                        ]);
                      }}
                    >
                      <Plus /> Add Product
                    </Button>
                    <Table>
                      <TableHeader>
                        <TableHead>Product</TableHead>
                        <TableHead>Qty</TableHead>
                        <TableHead>Discount</TableHead>
                      </TableHeader>
                      <TableBody>
                        {form.watch("exchange_items").map((_, i) => (
                          <TableRow>
                            <TableCell>
                              <FormField
                                name={`exchange_items.${i}.product_variant_id`}
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
                                name={`exchange_items.${i}.quantity`}
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
                              <FormField
                                name={`exchange_items.${i}.discount`}
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
                                    "exchange_items",
                                    form
                                      .watch("exchange_items")
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
                  </>
                  <FormField
                    name={`exchange_discount`}
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Exchange Discount</FormLabel>
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
                    name={`extra_costs`}
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Extra Costs</FormLabel>
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
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </ScrollArea>
        </Form>
        <DialogFooter>
          <Button variant={"outline"} onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            disabled={isPending}
            onClick={form.handleSubmit(
              (data) => CreateReturnMutation(data),
              console.error
            )}
          >
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
