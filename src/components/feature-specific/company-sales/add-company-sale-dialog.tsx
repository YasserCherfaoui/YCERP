import { RootState } from "@/app/store";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { SaleItemEntity } from "@/models/data/sale.model";
import { CreateSaleSchema, createSaleSchema } from "@/schemas/sale";
import { getCompanyInventory } from "@/services/inventory-service";
import { createCompanySale } from "@/services/sale-service";
import { processSaleBarcode } from "@/utils/process-sale-barcodes";
import { DevTool } from "@hookform/devtools";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, ShoppingCart } from "lucide-react";
import { ChangeEvent, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";

export default function () {
  const company = useSelector((state: RootState) => state.company.company);
  if (!company) return;
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [saleItems, setSaleItems] = useState<Array<SaleItemEntity>>([]);
  const { toast } = useToast();
  const form = useForm<CreateSaleSchema>({
    resolver: zodResolver(createSaleSchema),
    defaultValues: {
      location_id: company.ID,
      sale_items: [],
      discount: 0,
    },
  });
  const { data: inventory } = useQuery({
    queryKey: ["inventory"],
    queryFn: () => getCompanyInventory(company.ID),
  });

  const barcodes: string[] =
    inventory?.data?.items.map((item) => item.product_variant?.qr_code ?? "") ??
    [];
  const myProcessBarcode = () =>
    processSaleBarcode({
      inventory: inventory!,
      input,
      saleItems,
      setSaleItems,
      toast,
      setInput,
      barcodes,
    });

  useEffect(() => {
    let timeout;

    const handleKeyPress = (e: any) => {
      console.log(e.key);
      // Prevent default form submission on Enter
      if (e.key === "Enter") {
        e.preventDefault();
        myProcessBarcode();
      }
    };

    window.addEventListener("keypress", handleKeyPress);

    // Barcode scanners typically send data quickly, so we use a timeout
    // to determine when the full barcode has been entered
    timeout = setTimeout(() => {
      if (input.length > 0) {
        myProcessBarcode();
      }
    }, 1000); // Adjust timeout based on your scanner's speed

    return () => {
      window.removeEventListener("keypress", handleKeyPress);
      clearTimeout(timeout);
    };
  }, [input]);

  useEffect(() => {
    form.setValue(
      "sale_items",
      saleItems.map((item) => ({
        prodcut_variant_id: item.product_variant_id,
        quantity: item.quantity,
        discount: item.discount,
      }))
    );
  }, [saleItems]);
  function handleQuantityChange(event: ChangeEvent<HTMLInputElement>): void {
    const { name, value } = event.target;
    const index = parseInt(name.split(".")[1]);
    const updatedSaleItems = [...saleItems];
    updatedSaleItems[index].quantity = Number.isNaN(parseInt(value))
      ? 0
      : parseInt(value);
    setSaleItems(updatedSaleItems);

    form.setValue(
      `sale_items.${index}.quantity`,
      Number.isNaN(parseInt(value)) ? 0 : parseInt(value)
    );
  }
  function handleDiscountChange(event: ChangeEvent<HTMLInputElement>): void {
    const { name, value } = event.target;
    const index = parseInt(name.split(".")[1]);
    const updatedSaleItems = [...saleItems];
    updatedSaleItems[index].discount = Number.isNaN(parseInt(value))
      ? 0
      : parseInt(value);
    setSaleItems(updatedSaleItems);

    form.setValue(
      `sale_items.${index}.discount`,
      Number.isNaN(parseInt(value)) ? 0 : parseInt(value)
    );
  }
  const queryClient = useQueryClient();
  const { mutate: createCompanySaleMutation } = useMutation({
    mutationFn: createCompanySale,
    onSuccess: () => {
      setOpen(false);
      toast({
        title: "Sale Created",
        description: "Sale was created successfully",
      });
      form.reset();
      setSaleItems([]);
      queryClient.invalidateQueries({
        queryKey: ["inventory", "sales"],
      });
    },
    onError: () => {
      toast({
        title: "Error creating sale",
        description: "Something went wrong",
        variant: "destructive",
      });
    },
  });
  const handleCreateSale = (data: CreateSaleSchema) => {
    createCompanySaleMutation(data);
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button>
          <Plus />
          Sale
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex gap-2 items-center">
            <ShoppingCart />
            Add Sale to {company.company_name}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <span></span>
          <Input
            value={input}
            placeholder="Scan barcode..."
            className="w-full"
            onChange={(e) => setInput(e.target.value)}
            autoFocus
          />
          <Form {...form}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Discount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {saleItems.map((saleItem, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      {
                        inventory?.data?.items.find(
                          (s) =>
                            s.product_variant_id == saleItem.product_variant_id
                        )?.name
                      }
                    </TableCell>
                    <TableCell>
                      <FormField
                        name={`sale_items.${idx}.quantity`}
                        control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                className="w-20"
                                {...field}
                                onChange={handleQuantityChange}
                                value={
                                  Number.isNaN(field.value) ? 0 : field.value
                                }
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <FormField
                        name={`sale_items.${idx}.discount`}
                        control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                className="w-20"
                                {...field}
                                onChange={handleDiscountChange}
                                value={
                                  Number.isNaN(field.value) ? 0 : field.value
                                }
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <DevTool control={form.control} />
            <div className="grid grid-cols-2 gap-2 w-fit self-end">
              <div className="text-lg">Amount: </div>
              <span className="text-lg font-bold">
                {new Intl.NumberFormat("en-DZ", {
                  style: "currency",
                  currency: "DZD",
                }).format(
                  saleItems.reduce(
                    (prev, curr) =>
                      prev +
                      ((inventory?.data?.items.find(
                        (s) => s.product_variant_id == curr.product_variant_id
                      )?.product?.price ?? 0) -
                        curr.discount) *
                        curr.quantity,
                    0
                  )
                )}
              </span>
              <div className="flex gap-2 items-center text-lg">Discount:</div>
              <FormField
                name={`discount`}
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        className="w-20"
                        {...field}
                        value={Number.isNaN(field.value) ? 0 : field.value}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <div className="text-lg">Total:</div>
              <span className="text-lg font-bold">
                {new Intl.NumberFormat("en-DZ", {
                  style: "currency",
                  currency: "DZD",
                }).format(
                  saleItems.reduce(
                    (prev, curr) =>
                      prev +
                      ((inventory?.data?.items.find(
                        (s) => s.product_variant_id == curr.product_variant_id
                      )?.product?.price ?? 0) -
                        curr.discount) *
                        curr.quantity,
                    0
                  ) - form.watch("discount")
                )}
              </span>
            </div>
          </Form>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
          <Button onClick={form.handleSubmit(handleCreateSale)}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
