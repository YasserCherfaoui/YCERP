import { RootState } from "@/app/store";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { VariantDepositResponse } from "@/models/data/variant-deposit.model";
import { CreateSaleSchema, createSaleSchema } from "@/schemas/sale";
import {
    createFranchiseSale,
    downloadAndPrintFranchisePDF,
    getFranchiseInventory,
} from "@/services/franchise-service";
import { fulfillVariantDeposit } from "@/services/variant-deposits-service";
import {
    computeCombinableLineTotals,
    computePairPromoLineTotals,
    getBOGOLineTotal,
} from "@/utils/pricing-utils";
import { processSaleBarcode } from "@/utils/process-sale-barcodes";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Info, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { ChangeEvent, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";

export interface AddFranchiseSaleDialogInitialDeposit {
  deposit: VariantDepositResponse;
  depositId: number;
}

export interface AddFranchiseSaleDialogProps {
  /** When set, dialog is controlled and opened from outside (e.g. variant deposits "Create sale") */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** When set, prefill from this deposit and on submit call fulfill API instead of create sale */
  initialFromDeposit?: AddFranchiseSaleDialogInitialDeposit | null;
  /** Hide the trigger button (use when opening from variant deposits) */
  hideTrigger?: boolean;
}

export default function AddFranchiseSaleDialog(props?: AddFranchiseSaleDialogProps) {
  const { open: controlledOpen, onOpenChange, initialFromDeposit, hideTrigger } = props ?? {};
  const franchise = useSelector(
    (state: RootState) => state.franchise.franchise
  );
  if (!franchise) return null;
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = (value: boolean) => {
    if (onOpenChange) onOpenChange(value);
    else setInternalOpen(value);
  };
  const [input, setInput] = useState("");
  const [saleItems, setSaleItems] = useState<Array<SaleItemEntity>>([]);
  const { toast } = useToast();
  const form = useForm<CreateSaleSchema>({
    resolver: zodResolver(createSaleSchema),
    defaultValues: {
      location_id: franchise.ID,
      sale_items: [],
      discount: 0,
      sale_type: "franchise",
      phone_number: "",
      rating: undefined,
    },
  });
  const { data: inventory } = useQuery({
    queryKey: ["franchise-inventory", franchise.ID],
    queryFn: () => getFranchiseInventory(franchise.ID),
  });

  // Prefill from deposit when dialog opens with initialFromDeposit and inventory is loaded
  useEffect(() => {
    if (!initialFromDeposit || !open || !inventory?.data?.items) return;
    const { deposit } = initialFromDeposit;
    const invItem = inventory.data.items.find(
      (i: { product_variant_id: number }) => i.product_variant_id === deposit.product_variant_id
    );
    if (!invItem?.product) return;
    const product = invItem.product as { price?: number };
    const listPrice = product.price ?? 0;
    const item: SaleItemEntity = {
      product_variant_id: deposit.product_variant_id,
      variant_qr_code: (invItem as { product_variant?: { qr_code?: string } }).product_variant?.qr_code ?? "",
      price: listPrice,
      quantity: deposit.quantity,
      discount: 0,
    };
    setSaleItems([item]);
    form.setValue("phone_number", deposit.customer_phone);
    form.setValue("discount", 0);
    form.setValue("sale_items", [
      { product_variant_id: deposit.product_variant_id, price: listPrice, quantity: deposit.quantity, discount: 0 },
    ]);
  }, [initialFromDeposit, open, inventory?.data?.items, franchise.ID, form]);

  const barcodes: string[] =
    inventory?.data?.items.map((item: { product_variant?: { qr_code?: string } }) => item.product_variant?.qr_code ?? "") ??
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
      getDefaultPrice: (item) => item.product ? item.product.price : 0,
    });

  useEffect(() => {
    let timeout;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key !== "Enter") return;
      const target = e.target as HTMLElement;
      const barcodeInput = document.getElementById("barcde-input");
      // Only process when Enter is pressed in the barcode input (avoid stale closure
      // and avoid processing when Enter is pressed in quantity/price inputs)
      if (!barcodeInput || target !== barcodeInput) return;
      e.preventDefault();
      const currentValue = (target as HTMLInputElement).value;
      myProcessBarcode(currentValue);
    };
    const barcodeInput = document.getElementById("barcde-input");
    if (barcodeInput) {
      barcodeInput.addEventListener("keypress", handleKeyPress);
    }

    // Barcode scanners typically send data quickly, so we use a timeout
    // to determine when the full barcode has been entered
    timeout = setTimeout(() => {
      if (input.length > 0) {
        myProcessBarcode();
      }
    }, 1000); // Adjust timeout based on your scanner's speed

    return () => {
      if (barcodeInput) {
        barcodeInput.removeEventListener("keypress", handleKeyPress);
      }
      clearTimeout(timeout);
    };
  }, [input]);

  useEffect(() => {
    form.setValue(
      "sale_items",
      saleItems.map((item) => ({
        product_variant_id: item.product_variant_id,
        price: item.price,
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
    const saleItem = saleItems[index];
    const inventoryItem = inventory?.data?.items.find(
      (s) => s.product_variant_id == saleItem.product_variant_id
    );
    const product = inventoryItem?.product;
    const maxPrice = product?.price ?? 0;
    const newPrice = Number.isNaN(parseInt(value)) ? 0 : parseInt(value);
    
    const updatedSaleItems = [...saleItems];
    updatedSaleItems[index].price = newPrice;
    setSaleItems(updatedSaleItems);

    form.setValue(
      `sale_items.${index}.price`,
      newPrice,
      { shouldValidate: true }
    );
    
    // Validate price doesn't exceed product price
    if (newPrice > maxPrice) {
      form.setError(`sale_items.${index}.price`, {
        type: "manual",
        message: `Price cannot exceed product price (${maxPrice} DZD)`,
      });
    } else {
      // Clear error if validation passes
      form.clearErrors(`sale_items.${index}.price`);
    }
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

  function removeSaleItem(index: number) {
    setSaleItems((prev) => prev.filter((_, i) => i !== index));
  }

  const queryClient = useQueryClient();
  const { mutate: downloadAndPrintFranchisePDFMutation } = useMutation({
    mutationFn: downloadAndPrintFranchisePDF,
  });
  const { mutate: createFranchiseSaleMutation, isPending: isCreatePending } = useMutation({
    mutationFn: createFranchiseSale,
    onSuccess: (data) => {
      setOpen(false);
      toast({
        title: "Sale Created",
        description: "Sale was created successfully",
      });
      downloadAndPrintFranchisePDFMutation(data?.data?.ID ?? 0);
      form.reset();
      setSaleItems([]);
      queryClient.invalidateQueries({
        queryKey: ["franchise-inventory", franchise.ID],
      });
      queryClient.invalidateQueries({
        queryKey: ["sales"],
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
  const { mutate: fulfillDepositMutation, isPending: isFulfillPending } = useMutation({
    mutationFn: (payload: {
      depositId: number;
      discount: number;
      rating?: number;
    }) =>
      fulfillVariantDeposit(payload.depositId, {
        discount: payload.discount,
        rating: payload.rating,
      }),
    onSuccess: () => {
      setOpen(false);
      onOpenChange?.(false);
      toast({
        title: "Sale created",
        description: "Variant deposit fulfilled; sale created successfully.",
      });
      form.reset();
      setSaleItems([]);
      queryClient.invalidateQueries({ queryKey: ["franchise-variant-deposits"] });
      queryClient.invalidateQueries({ queryKey: ["franchise-inventory", franchise.ID] });
      queryClient.invalidateQueries({ queryKey: ["sales"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message ?? "Failed to create sale from deposit",
        variant: "destructive",
      });
    },
  });
  const isPending = isCreatePending || isFulfillPending;
  const handleCreateSale = (data: CreateSaleSchema) => {
    if (initialFromDeposit) {
      fulfillDepositMutation({
        depositId: initialFromDeposit.depositId,
        discount: Math.max(0, data.discount ?? 0),
        rating: data.rating,
      });
      return;
    }
    // Validate all prices don't exceed product prices
    let hasInvalidPrice = false;
    data.sale_items.forEach((item, idx) => {
      const inventoryItem = inventory?.data?.items.find(
        (s) => s.product_variant_id == item.product_variant_id
      );
      const product = inventoryItem?.product;
      const maxPrice = product?.price ?? 0;
      
      if (item.price > maxPrice) {
        form.setError(`sale_items.${idx}.price`, {
          type: "manual",
          message: `Price cannot exceed product price (${maxPrice} DZD)`,
        });
        hasInvalidPrice = true;
      }
    });
    
    if (hasInvalidPrice) {
      toast({
        title: "Validation Error",
        description: "Please fix price errors before submitting",
        variant: "destructive",
      });
      return;
    }
    
    createFranchiseSaleMutation(data);
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!hideTrigger && (
        <DialogTrigger asChild>
          <Button>
            <Plus />
            Sale
          </Button>
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex gap-2 items-center">
            <ShoppingCart />
            {initialFromDeposit ? "Create sale from deposit" : `Add Sale to ${franchise.name}`}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          {initialFromDeposit && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                The client has submitted a deposit of{" "}
                <strong>
                  {new Intl.NumberFormat("en-DZ", {
                    style: "currency",
                    currency: "DZD",
                  }).format(initialFromDeposit.deposit.amount_paid)}
                </strong>{" "}
                before. Use the summary below to set an optional sale discount if needed.
              </AlertDescription>
            </Alert>
          )}
          <Input
            id="barcde-input"
            value={input}
            placeholder="Scan barcode..."
            className="w-full"
            onChange={(e) => setInput(e.target.value)}
            autoFocus={!initialFromDeposit}
            disabled={!!initialFromDeposit}
          />

          <Form {...form}>
            <ScrollArea className="max-h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead className="w-[52px]">
                      <span className="sr-only">Remove line</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(() => {
                    const productTotalQty: Record<number, number> = {};
                    saleItems.forEach((curr) => {
                      const inv = inventory?.data?.items.find((s) => s.product_variant_id === curr.product_variant_id);
                      if (inv) {
                        productTotalQty[inv.product_id] = (productTotalQty[inv.product_id] ?? 0) + curr.quantity;
                      }
                    });
                    const pairTotals = computePairPromoLineTotals(
                      saleItems,
                      inventory?.data?.items ?? [],
                      franchise
                    );
                    const combTotals = computeCombinableLineTotals(
                      saleItems,
                      inventory?.data?.items ?? []
                    );
                    return saleItems.map((saleItem, idx) => {
                    const inventoryItem = inventory?.data?.items.find(
                      (s) =>
                        s.product_variant_id ==
                        saleItem.product_variant_id
                    );
                    const product = inventoryItem?.product;
                    const productId = inventoryItem?.product_id;
                    const totalQtyForProduct = productId != null ? (productTotalQty[productId] ?? 0) : 0;
                    const hasPromo = product?.promo_price != null && product.promo_price > 0;
                    const isCombLine =
                      combTotals.active && product?.combinable;
                    const isPairLine =
                      pairTotals.active &&
                      product?.pairable &&
                      !(combTotals.active && product?.combinable);
                    const isBOGO =
                      !isPairLine &&
                      !isCombLine &&
                      product?.is_bogo &&
                      totalQtyForProduct >= 2;
                    const bogoProductTotal = isBOGO && product ? getBOGOLineTotal(product.price, totalQtyForProduct) : 0;
                    const pairLineNet =
                      isPairLine ? pairTotals.lineTotals[idx] ?? 0 : 0;
                    const combLineNet =
                      isCombLine ? combTotals.lineTotals[idx] ?? 0 : 0;

                    return (
                    <TableRow key={idx}>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span>{inventoryItem?.name}</span>
                          {hasPromo && (
                            <Badge variant="destructive" className="w-fit">
                              Promo: {new Intl.NumberFormat("en-DZ", {
                                style: "currency",
                                currency: "DZD",
                              }).format(product.promo_price ?? 0)}
                            </Badge>
                          )}
                          {isPairLine && (
                            <Badge variant="secondary" className="w-fit">
                              Pair:{" "}
                              {new Intl.NumberFormat("en-DZ", {
                                style: "currency",
                                currency: "DZD",
                              }).format(pairLineNet)}
                            </Badge>
                          )}
                          {isCombLine && (
                            <Badge variant="secondary" className="w-fit">
                              Combinable:{" "}
                              {new Intl.NumberFormat("en-DZ", {
                                style: "currency",
                                currency: "DZD",
                              }).format(combLineNet)}
                            </Badge>
                          )}
                          {isBOGO && (
                            <Badge variant="secondary" className="w-fit">
                              BOGO: {totalQtyForProduct} for {new Intl.NumberFormat("en-DZ", {
                                style: "currency",
                                currency: "DZD",
                              }).format(bogoProductTotal)}
                            </Badge>
                          )}
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
                                  max={product?.price ?? 0}
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
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TableCell>
                      <TableCell className="align-middle">
                        <Button
                          type="button"
                          size="icon"
                          className="h-8 w-8 shrink-0 bg-red-600 text-white hover:bg-red-700 hover:text-white"
                          onClick={() => removeSaleItem(idx)}
                          aria-label="Remove line"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                  });
                  })()}
                </TableBody>
              </Table>
            </ScrollArea>
            <div className="flex gap-2 items-center text-lg">Phone Number:</div>
            <FormField
              name={`phone_number`}
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value}
                      onChange={(e) => {
                        const value = e.target.value;
                        form.setValue("phone_number", value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-2 items-center text-lg">Rating (1-5):</div>
            <FormField
              name={`rating`}
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      max="5"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        form.setValue("rating", value ? parseInt(value) : undefined);
                      }}
                      placeholder="Optional: Rate customer experience (1-5)"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-2 w-fit self-end">
              <div className="text-lg">Amount: </div>
              <span className="text-lg font-bold">
                {new Intl.NumberFormat("en-DZ", {
                  style: "currency",
                  currency: "DZD",
                }                ).format(
                  (() => {
                    const productTotalQty: Record<number, number> = {};
                    saleItems.forEach((c) => {
                      const inv = inventory?.data?.items.find((s) => s.product_variant_id === c.product_variant_id);
                      if (inv) productTotalQty[inv.product_id] = (productTotalQty[inv.product_id] ?? 0) + c.quantity;
                    });
                    const pairTotals = computePairPromoLineTotals(
                      saleItems,
                      inventory?.data?.items ?? [],
                      franchise
                    );
                    const combTotals = computeCombinableLineTotals(
                      saleItems,
                      inventory?.data?.items ?? []
                    );
                    return saleItems.reduce((prev, curr, idx) => {
                      const invItem = inventory?.data?.items.find((s) => s.product_variant_id === curr.product_variant_id);
                      const prod = invItem?.product;
                      const pid = invItem?.product_id;
                      const totalQty = pid != null ? (productTotalQty[pid] ?? 0) : 0;
                      if (combTotals.active && prod?.combinable) {
                        return prev + (combTotals.lineTotals[idx] ?? 0);
                      }
                      if (pairTotals.active && prod?.pairable) {
                        return prev + (pairTotals.lineTotals[idx] ?? 0);
                      }
                      const lineTotal =
                        prod?.is_bogo && totalQty >= 2
                          ? Math.round((getBOGOLineTotal(prod.price, totalQty) / totalQty) * curr.quantity) - curr.discount * curr.quantity
                          : (curr.price - curr.discount) * curr.quantity;
                      return prev + lineTotal;
                    }, 0);
                  })()
                )}
              </span>

              {initialFromDeposit && (
                <>
                  <div className="text-lg text-muted-foreground">Deposit:</div>
                  <span className="text-lg font-medium text-muted-foreground">
                    {new Intl.NumberFormat("en-DZ", {
                      style: "currency",
                      currency: "DZD",
                    }).format(initialFromDeposit.deposit.amount_paid)}
                  </span>
                </>
              )}

              <div className="flex gap-2 items-center text-lg">Discount:</div>
              <FormField
                name={`discount`}
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        className="w-28"
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
                {new Intl.NumberFormat("en-DZ", {
                  style: "currency",
                  currency: "DZD",
                }                ).format(
                  (() => {
                    const productTotalQty: Record<number, number> = {};
                    saleItems.forEach((c) => {
                      const inv = inventory?.data?.items.find((s) => s.product_variant_id === c.product_variant_id);
                      if (inv) productTotalQty[inv.product_id] = (productTotalQty[inv.product_id] ?? 0) + c.quantity;
                    });
                    const pairTotals = computePairPromoLineTotals(
                      saleItems,
                      inventory?.data?.items ?? [],
                      franchise
                    );
                    const combTotals = computeCombinableLineTotals(
                      saleItems,
                      inventory?.data?.items ?? []
                    );
                    return saleItems.reduce((prev, curr, idx) => {
                      const invItem = inventory?.data?.items.find((s) => s.product_variant_id === curr.product_variant_id);
                      const prod = invItem?.product;
                      const pid = invItem?.product_id;
                      const totalQty = pid != null ? (productTotalQty[pid] ?? 0) : 0;
                      if (combTotals.active && prod?.combinable) {
                        return prev + (combTotals.lineTotals[idx] ?? 0);
                      }
                      if (pairTotals.active && prod?.pairable) {
                        return prev + (pairTotals.lineTotals[idx] ?? 0);
                      }
                      const lineTotal =
                        prod?.is_bogo && totalQty >= 2
                          ? Math.round((getBOGOLineTotal(prod.price, totalQty) / totalQty) * curr.quantity) - curr.discount * curr.quantity
                          : (curr.price - curr.discount) * curr.quantity;
                      return prev + lineTotal;
                    }, 0) - form.watch("discount");
                  })()
                )}
              </span>
            </div>
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
