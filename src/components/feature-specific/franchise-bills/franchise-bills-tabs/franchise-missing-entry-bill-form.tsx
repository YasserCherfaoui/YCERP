import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { BillItem } from "@/models/data/bill.model";
import { CreateEntryBillSchema } from "@/schemas/bill";
import {
    MissingItemsFormSchema,
    MissingItemsSchema,
} from "@/schemas/missing-items";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { FieldErrors, UseFormReturn, useForm } from "react-hook-form";

interface Props {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  products: Array<BillItem>;
  primaryForm: UseFormReturn<CreateEntryBillSchema>;
  setPrimaryFormOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function ({
  products,
  setOpen,
  primaryForm,
  setPrimaryFormOpen,
}: Props) {
  const defaultValues = {
    items: products.map((product) => ({
      productId: product.product_variant_id,
      broken: 0,
      missing: product.quantity,
      total: product.quantity,
    })),
  };
  const form = useForm<MissingItemsSchema>({
    resolver: zodResolver(MissingItemsFormSchema),
    defaultValues,
  });

  const { toast } = useToast();
  const {mutate:saveEntryBillMutation} = useMutation({
    
  });
  function handleError(
    errors: FieldErrors<{
      items: {
        productId: number;
        broken: number;
        missing: number;
        total: number;
      }[];
    }>
  ) {
    console.log(errors);
    toast({
      variant: "destructive",
      title: "Error",
      description: errors.items?.root?.message ?? "They should be",
    });
  }

  function onSaveClicked(data: MissingItemsSchema) {
    primaryForm.setValue(
      "missing_items",
      data.items
        .filter((item) => item.missing > 0)
        .map((item) => ({
          product_variant_id: item.productId,
          quantity: item.missing,
        }))
    );
    primaryForm.setValue(
      "broken_items",
      data.items
        .filter((item) => item.broken > 0)
        .map((item) => ({
          product_variant_id: item.productId,
          quantity: item.broken,
        }))
    );
    setOpen(false);
    console.log(primaryForm.getValues());
    setPrimaryFormOpen(false);
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(console.log, handleError)}>
          <ScrollArea className="h-[300px]">
            <Table>
              <TableCaption>Product Inventory Adjustment</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Product (QR Code)</TableHead>
                  <TableHead>Missing Qty</TableHead>
                  <TableHead>Broken Qty</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((item, index) => (
                  <TableRow key={item.product_variant_id}>
                    <TableCell>{item.qr_code}</TableCell>
                    <TableCell>
                      <FormField
                        control={form.control}
                        name={`items.${index}.missing`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                {...field}
                                type="number"
                                placeholder="Missing Qty"
                                id={`missing-${index}`}
                                value={field.value}
                                min={0}
                                max={item.quantity}
                                onChange={(e) =>
                                  field.onChange(Number(e.target.value))
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <FormField
                        control={form.control}
                        name={`items.${index}.broken`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                {...field}
                                type="number"
                                placeholder="Broken Qty"
                                id={`broken-${index}`}
                                value={field.value}
                                min={0}
                                max={item.quantity}
                                onChange={(e) =>
                                  field.onChange(Number(e.target.value))
                                }
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
          </ScrollArea>
        </form>
      </Form>
      <DialogFooter>
        <Button
          variant={"outline"}
          onClick={() => {
            setOpen(false);
          }}
        >
          Cancel
        </Button>
        <Button onClick={form.handleSubmit(onSaveClicked, handleError)}>
          Save
        </Button>
      </DialogFooter>
    </>
  );
}
