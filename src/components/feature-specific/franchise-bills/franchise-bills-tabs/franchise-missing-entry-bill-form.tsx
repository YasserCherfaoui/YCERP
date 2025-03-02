import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { BillItem } from "@/models/data/bill.model";
import {
    MissingItemsFormSchema,
    MissingItemsSchema,
} from "@/schemas/missing-items";
import { zodResolver } from "@hookform/resolvers/zod";
import { FieldErrors, UseFormReturn, useForm } from "react-hook-form";

interface Props {
  form: UseFormReturn<MissingItemsSchema>;
  products: Array<BillItem>;
}

export default function ({ products }: Props) {
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

  function handleError(
    errors: FieldErrors<{
      items: {
        productId: number;
        broken: number;
        missing: number;
        total: number;
      }[];
    }>  ) {
        console.log(errors)
    toast({
      variant: "destructive",
      title: "Error",
      description: errors.items?.root?.message ?? "They should be",
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(console.log, handleError)}>
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
          <TableFooter>
            <Button type="submit">Validate</Button>
          </TableFooter>
        </Table>
      </form>
    </Form>
  );
}
