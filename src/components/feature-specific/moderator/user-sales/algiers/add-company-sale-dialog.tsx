import { RootState } from "@/app/store";
import { PairableCombinableProductIcons } from "@/components/feature-specific/products/pairable-combinable-product-icons";
import { SaleLinePackBadge } from "@/components/feature-specific/products/sale-line-pack-badge";
import { Badge } from "@/components/ui/badge";
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
import { SaleItemEntity } from "@/models/data/sale.model";
import { CreateSaleSchema, createSaleSchema } from "@/schemas/sale";
import { getCompanyInventory } from "@/services/inventory-service";
import { listProductPacks } from "@/services/product-service";
import { createCompanySale } from "@/services/sale-service";
import { computeCompanyCartTotals } from "@/utils/pricing-utils";
import { processSaleBarcode } from "@/utils/process-sale-barcodes";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, ShoppingCart } from "lucide-react";
import { ChangeEvent, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";

export default function () {
  const company = useSelector((state: RootState) => state.user.company);
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
      sale_type: "algiers",
    },
  });

  const { data: inventory } = useQuery({
    queryKey: ["inventory"],
    queryFn: () => getCompanyInventory(company.ID),
  });
  const { data: productPacksRes } = useQuery({
    queryKey: ["product-packs", company.ID, "active"],
    queryFn: () => listProductPacks(company.ID, { activeOnly: true }),
    enabled: Boolean(company.ID) && open,
  });
  const activePacks = productPacksRes?.data ?? [];

  const barcodes: string[] =
    inventory?.data?.items.map((item) => item.product_variant?.qr_code ?? "") ??
    [];
  const myProcessBarcode = (barcodeValue?: string) =>
    processSaleBarcode({
      inventory: inventory!,
      input: barcodeValue ?? input,
      saleItems,
      setSaleItems,
      toast,
      setInput,
      barcodes,
      getDefaultPrice: (item) => item.product?.price ?? 0,
    });

  useEffect(() => {
    let timeout;
    const BARCODE_INPUT_ID = "add-user-sale-algiers-barcode-input";

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key !== "Enter") return;
      const target = e.target as HTMLElement;
      const barcodeInput = document.getElementById(BARCODE_INPUT_ID);
      if (!barcodeInput || target !== barcodeInput) return;
      e.preventDefault();
      const currentValue = (target as HTMLInputElement).value;
      myProcessBarcode(currentValue);
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
        product_variant_id: item.product_variant_id,
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
  function handlePriceChange(event: ChangeEvent<HTMLInputElement>): void {
    const { name, value } = event.target;
    const index = parseInt(name.split(".")[1]);
    const updatedSaleItems = [...saleItems];
    updatedSaleItems[index].price = Number.isNaN(parseInt(value))
      ? 0
      : parseInt(value);
    setSaleItems(updatedSaleItems);

    form.setValue(
      `sale_items.${index}.price`,
      Number.isNaN(parseInt(value)) ? 0 : parseInt(value)
    );
  }
  const queryClient = useQueryClient();

  const { mutate: createCompanySaleMutation, isPending } = useMutation({
    mutationFn: createCompanySale,
    onSuccess: () => {
      setOpen(false);
      toast({
        title: "Sale Created",
        description: "Sale was created successfully",
      });
      // downloadAndPrintPDFMutation(data.data?.ID ?? 0)
      form.reset();
      setSaleItems([]);
      queryClient.invalidateQueries({
        queryKey: ["inventory"],
      });
      queryClient.invalidateQueries({
        queryKey: ["sales", "algiers"],
      });
      queryClient.invalidateQueries({
        queryKey: ["sales-total-today", company.ID],
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
            id="add-user-sale-algiers-barcode-input"
            value={input}
            placeholder="Scan barcode..."
            className="w-full"
            onChange={(e) => setInput(e.target.value)}
            autoFocus
          />

          <Form {...form}>
            <ScrollArea className="max-h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Quantity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(() => {
                    const invItems = inventory?.data?.items ?? [];
                    const cart = computeCompanyCartTotals(
                      saleItems,
                      invItems,
                      activePacks
                    );
                    return saleItems.map((saleItem, idx) => {
                    const inventoryItem = invItems.find(
                      (s) =>
                        s.product_variant_id ==
                        saleItem.product_variant_id
                    );
                    const product = inventoryItem?.product;
                    const hasPromo = product?.promo_price != null && product.promo_price > 0;
                    const remQty = cart.multi.remainingSaleItems[idx]?.quantity ?? 0;
                    const multiMatches = cart.multi.matchesByLine.get(idx);
                    const isPackLine =
                      remQty > 0 &&
                      inventoryItem != null &&
                      cart.singlePack.activeProductIds.has(inventoryItem.product_id);
                    const packLineNet = cart.singlePack.lineTotals[idx] ?? 0;

                    return (
                    <TableRow key={idx}>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span>{inventoryItem?.name}</span>
                          <div className="flex flex-wrap items-center gap-1">
                            {hasPromo && (
                              <Badge variant="destructive" className="w-fit">
                                Promo: {new Intl.NumberFormat("en-DZ", {
                                  style: "currency",
                                  currency: "DZD",
                                }).format(product.promo_price ?? 0)}
                              </Badge>
                            )}
                            <SaleLinePackBadge
                              product={product}
                              isPackActive={isPackLine}
                              lineTotal={packLineNet}
                              multiPackMatches={multiMatches}
                            />
                            <PairableCombinableProductIcons
                              combinable={product?.combinable}
                              pairable={product?.pairable}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <FormField
                          name={`sale_items.${idx}.price`}
                          control={form.control}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  className="w-24"
                                  type="number"
                                  {...field}
                                  onChange={handlePriceChange}
                                  value={
                                    Number.isNaN(field.value) ? 0 : field.value
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
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TableCell>
                    </TableRow>
                  );
                  });
                  })()}
                </TableBody>
              </Table>
            </ScrollArea>

            {(() => {
              const cart = computeCompanyCartTotals(
                saleItems,
                inventory?.data?.items ?? [],
                activePacks
              );
              const subtotalAmount = cart.subtotal;
              const netTotal = subtotalAmount - form.watch("discount");
              const formatMoney = (v: number) =>
                new Intl.NumberFormat("en-DZ", {
                  style: "currency",
                  currency: "DZD",
                }).format(v);

              return (
                <div className="grid grid-cols-2 gap-2 w-fit self-end">
                  <div className="text-lg">Amount: </div>
                  <span className="text-lg font-bold">
                    {formatMoney(subtotalAmount)}
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
                            onChange={(e) => {
                              const value = e.target.value;
                              form.setValue(
                                "discount",
                                Number.isNaN(parseInt(value)) ? 0 : parseInt(value)
                              );
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="text-lg">Total:</div>
                  <span className="text-lg font-bold">
                    {formatMoney(netTotal)}
                  </span>
                </div>
              );
            })()}
          </Form>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
          <Button
            disabled={isPending}
            onClick={form.handleSubmit(handleCreateSale)}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
