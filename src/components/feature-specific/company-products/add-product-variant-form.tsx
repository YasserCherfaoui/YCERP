import { RootState } from "@/app/store";
import Autocomplete from "@/components/ui/autocomplete";
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
import { TagsInput } from "@/components/ui/tags_input";
import { useToast } from "@/hooks/use-toast";
import {
    CreateProductVariantSchema,
    createProductVariantSchema,
} from "@/schemas/product";
import { createProductVariant, getAllProductsWithVariantsByCompany } from "@/services/product-service";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";

export default function () {
  const [open, setOpen] = useState(false);
  const company = useSelector((state: RootState) => state.company.company);
  const form = useForm<CreateProductVariantSchema>({
    resolver: zodResolver(createProductVariantSchema),
    defaultValues: {
      company_id: company?.ID ?? 0,
      product_id: 0,
      color: [],
      size: [],
    },
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: products } = useQuery({
    queryKey: ["products"],
    queryFn: () => getAllProductsWithVariantsByCompany(company?.ID ?? 0),
  });
  const { mutate: createProductVariantMutation, isPending } = useMutation({
    mutationFn: createProductVariant,
    onSuccess: () => {
      toast({
        title: "Product Variant Created",
        description: "Product Variant was created successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
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
        <Button>
          <Plus />
          Add Product Variant
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Product Variant</DialogTitle>
        </DialogHeader>
        <>
          <Form {...form}>
            <Autocomplete
              options={products?.data ?? []}
              displayField="name"
              valueField="ID"
              form={form}
              name="product_id"
              label="Product"
            />
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <FormControl>
                    <TagsInput
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="enter your color"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="size"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Size</FormLabel>
                  <FormControl>
                    <TagsInput
                      typeof="number"
                      value={field.value.map((size) => size.toString())}
                      onValueChange={(value) => field.onChange(value.map(Number))}
                      placeholder="enter your size"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Form>
        </>
        <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isPending} onClick={form.handleSubmit((data) => createProductVariantMutation(data))}>{isPending ? <Loader2 className="w-4 h-4 mr-2" /> : "Add Product Variant"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
