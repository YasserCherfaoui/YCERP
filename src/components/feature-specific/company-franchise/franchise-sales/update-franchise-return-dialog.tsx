import { RootState } from "@/app/store";
import { ProductVariantCombobox } from "@/components/feature-specific/company-products/product-variant-combobox";
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
    UpdateReturnSchema,
    updateReturnSchema,
} from "@/schemas/return-schema";
import { getFranchiseInventory } from "@/services/franchise-service";
import { updateFranchiseReturnSale } from "@/services/return-service";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PackageMinus, Plus, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";

interface Props {
  sale: Sale;
}

export default function ({ sale }: Props) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const form = useForm<UpdateReturnSchema>({
    resolver: zodResolver(updateReturnSchema),
    defaultValues: {
      id: sale.return?.ID,
      sale_id: sale.ID,
      return_items: sale.return?.items.map((s) => ({
        product_variant_id: s.product_variant_id,
        quantity: s.quantity,
      })),
      exchange_items: sale.return?.exchange?.exchange_items.map((ei) => ({
        product_variant_id: ei.product_variant_id,
        quantity: ei.quantity,
        discount: ei.discount,
      })),
      comment: sale.return?.comment,
      type: sale.return?.type,
      cost: sale.return?.cost,
      exchange_discount: sale.return?.exchange?.discount,
      extra_costs: sale.return?.exchange?.extra_costs,
      reason: sale.return?.reason,
    },
  });
  const franchise = useSelector((state: RootState) => state.franchise.franchise);
  const { data: inventory } = useQuery({
    queryKey: ["products-variants"],
    queryFn: () => getFranchiseInventory(franchise?.ID ?? 0),
  });
  const queryClient = useQueryClient();
  const { mutate: updateReturnMutation, isPending } = useMutation({
    mutationFn: updateFranchiseReturnSale,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["sales"],
      });
      toast({
        title: "Return updated",
        description: "Return updated successfully",
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

  if (!sale.return) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <DropdownMenuItem
          className="text-blue-500"
          onSelect={(e) => e.preventDefault()}
        >
          <PackageMinus />
          Update return
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update return for sale S-{sale.ID}</DialogTitle>
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
                          ...(form.watch("exchange_items") ?? []),
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
                        {(form.watch("exchange_items") ?? []).map((_, i) => (
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
                                    (form.watch("exchange_items") ?? [])
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
              (data) => updateReturnMutation(data),
              console.error
            )}
          >
            Update
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 