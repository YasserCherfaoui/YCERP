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
import { Product } from "@/models/data/product.model";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import * as z from "zod";

const affiliatePropSchema = z.object({
  name: z.string().min(1, "Name is required"),
  creatives_link: z.string().url("Must be a valid URL"),
  product_link: z.string().url("Must be a valid URL"),
  commission: z.coerce.number().int().min(0, "Commission cannot be negative"),
});

const formSchema = z.object({
  affiliate_props: z.array(affiliatePropSchema),
});

type AffiliateFormValues = z.infer<typeof formSchema>;

interface SetAffiliatePropsDialogProps {
  product: Product;
}

export function SetAffiliatePropsDialog({
  product,
}: SetAffiliatePropsDialogProps) {
  const uniqueColors = [
    ...new Set(
      product.product_variants.map(
        (variant) => product.name + " " + variant.color.toLocaleUpperCase()
      )
    ),
  ];

  const defaultValues: Partial<AffiliateFormValues> = {
    affiliate_props: uniqueColors.map((color) => {
      const existingProp = product.affiliate_props?.find(
        (p) => p.name === color
      );
      return {
        name: color,
        creatives_link: existingProp?.creatives_link || "",
        product_link: existingProp?.product_link || "",
        commission: existingProp?.commission || 0,
      };
    }),
  };

  const form = useForm<AffiliateFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const { fields } = useFieldArray({
    control: form.control,
    name: "affiliate_props",
  });

  function onSubmit(data: AffiliateFormValues) {
    console.log({
      product_id: product.ID,
      ...data,
    });
    // Here we'd call the service to update affiliate props
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={(e: Event) => e.preventDefault()}>
          Set Affiliate Props
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Set Affiliate Props for {product.name}</DialogTitle>
          <DialogDescription>
            Configure affiliate properties for each product variant. The name is
            pre-filled with the color.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-6">
              {fields.map((field, index) => (
                <div key={field.id} className="p-4 border rounded-md space-y-2">
                  <FormField
                    control={form.control}
                    name={`affiliate_props.${index}.name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name (Color)</FormLabel>
                        <FormControl>
                          <Input {...field} disabled />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`affiliate_props.${index}.creatives_link`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Creatives Link</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://example.com/creatives"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`affiliate_props.${index}.product_link`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Link</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://example.com/product"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`affiliate_props.${index}.commission`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Commission (DZD)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
