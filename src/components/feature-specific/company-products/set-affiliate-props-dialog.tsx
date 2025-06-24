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
import { useToast } from "@/hooks/use-toast";
import { Product } from "@/models/data/product.model";
import { setAffiliateProps } from "@/services/product-service";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import * as z from "zod";

const affiliatePropSchema = z.object({
  name: z.string().min(1, "Name is required"),
  creatives_link: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  product_link: z.string().url("Must be a valid URL"),
  commission: z.coerce.number().int().min(0, "Commission cannot be negative"),
});

const formSchema = z.object({
  affiliate_props: z.array(affiliatePropSchema),
  product_id: z.number(),
});

export type AffiliateFormValues = z.infer<typeof formSchema>;

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
    product_id: product.ID,
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
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { mutate: setAffiliatePropsMutation } = useMutation({
    mutationFn: setAffiliateProps,
    onSuccess: () => {
      toast({
        title: "Affiliate props updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to update affiliate props",
        description: error.message,
      });
    },
  });

  function onSubmit(data: AffiliateFormValues) {
    setAffiliatePropsMutation(data);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
