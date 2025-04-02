import { RootState } from "@/app/store";
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
import { useToast } from "@/hooks/use-toast";
import {
  GenerateBarcodePDFSchema,
  defaultPDFValues,
  generateBarcodePDFSchema,
} from "@/schemas/product";
import { getCompanyInventory } from "@/services/inventory-service";
import {
  generateBarcodes,
  generateThermalBarcodes
} from "@/services/product-service";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Printer } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { ProductVariantCombobox } from "./product-variant-combobox";

export default function () {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItem] = useState([
    {
      product_variant_id: 0,
      quantity: 0,
    },
  ]);
  const form = useForm<GenerateBarcodePDFSchema>({
    resolver: zodResolver(generateBarcodePDFSchema),
    defaultValues: defaultPDFValues,
  });
  const company = useSelector((state: RootState) => state.company.company);
  const { data: inventory } = useQuery({
    queryKey: ["products-variants"],
    queryFn: () => getCompanyInventory(company?.ID ?? 0),
  });
  const { toast } = useToast();
  const { mutate: generateBarcodesMutation, isPending } = useMutation({
    mutationFn: generateBarcodes,
    onSuccess: () => {
      setIsOpen(false);
      toast({
        title: "Barcodes generated successfully",
        description: "Your barcodes have been generated.",
      });
    },
    onError: (error) => {
      console.log(error);
      toast({
        variant: "destructive",
        title: "Error generating barcodes",
        description: "There was an error generating your barcodes.",
      });
    },
  });
  const { mutate: generateThermalBarcodesMutation, isPending:isPendingThermal } =
    useMutation({
      mutationFn: generateThermalBarcodes,
      onSuccess: () => {
        setIsOpen(false);
        toast({
          title: "Barcodes generated successfully",
          description: "Your barcodes have been generated.",
        });
      },
      onError: (error) => {
        console.log(error);
        toast({
          variant: "destructive",
          title: "Error generating barcodes",
          description: "There was an error generating your barcodes.",
        });
      },
    });
  const onSaveClicked = (data: GenerateBarcodePDFSchema) => {
    generateBarcodesMutation(data);
  };
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger>
        <Button>
          <Printer />
          Labels
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Printer />
            Print Products Labels
          </DialogTitle>
          <DialogDescription>Print your products labels.</DialogDescription>
        </DialogHeader>
        <Button
          onClick={() =>
            setItem([...items, { product_variant_id: 0, quantity: 0 }])
          }
        >
          Add Product
        </Button>
        <ScrollArea className="max-h-[400px]">
          <Form {...form}>
            {items.map((_, idx) => (
              <div className="flex gap-2 items-baseline">
                <FormField
                  name={`variants.${idx}.product_variant_id`}
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity</FormLabel>
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
                <FormField
                  name={`variants.${idx}.quantity`}
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => {
                            field.onChange(Number(e.target.value));
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ))}
          </Form>
        </ScrollArea>
        <DialogFooter>
          <Button variant={"outline"}>Cancel</Button>
          <Button
            disabled={isPendingThermal || isPending}
            variant={"secondary"}
            onClick={form.handleSubmit(
              (data) => generateThermalBarcodesMutation(data),
              console.error
            )}
          >
            Small (50x30)
          </Button>
          <Button
            disabled={isPending || isPendingThermal}
            onClick={form.handleSubmit(onSaveClicked, console.error)}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
