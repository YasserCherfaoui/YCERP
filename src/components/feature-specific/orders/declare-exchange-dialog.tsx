import { RootState } from "@/app/store";
import { ProductVariantCombobox } from "@/components/feature-specific/company-products/product-variant-combobox";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { ConfirmedOrderItem, WooOrder } from "@/models/data/woo-order.model";
import {
    exchangeWooOrderSchema,
    ExchangeWooOrderSchema,
} from "@/schemas/order";
import { getCompanyInventory } from "@/services/inventory-service";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";

import { Combobox } from "@/components/ui/combobox-standalone";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { getDeliveryCompanies } from "@/services/delivery-service";
import {
    getNoestCommunes,
    getNoestDesks,
    getNoestFees,
    getNoestWilayas,
    getYalidineCenters,
    getYalidineCommunes,
    getYalidinePricing,
} from "@/services/order-service";
import { exchangeWooCommerceOrder } from "@/services/woocommerce-service";
import { CarrierRadioGroup } from "@/components/feature-specific/orders/carrier-radio-group";
import { liquidGlass, tile, tone } from "@/components/feature-specific/crm/crm-theme";
import { cn } from "@/lib/utils";
import { algerCities, cities } from "@/utils/algeria-cities";
import { ArrowDownToLine, ArrowUpFromLine, Loader2, MapPin, Package, Plus, Receipt, Repeat, Trash2, Truck, User } from "lucide-react";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

interface DeclareExchangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: WooOrder;
}

export default function DeclareExchangeDialog({
  open,
  onOpenChange,
  order,
}: DeclareExchangeDialogProps) {
  let company = useSelector((state: RootState) => state.company.company);
  const { pathname } = useLocation();
  const isModerator = pathname.includes("moderator");
  if (isModerator) {
    company = useSelector((state: RootState) => state.user.company);
  }
  if (!company) {
    return null;
  }
  const { data: inventoryData } = useQuery({
    queryKey: ["inventory", company.ID],
    queryFn: () => getCompanyInventory(company.ID),
    enabled: Boolean(company && company.ID),
  });
  const allVariants =
    inventoryData?.data?.items
      .map((item) => item.product_variant)
      .filter((v): v is NonNullable<typeof v> => Boolean(v)) || [];
  // EXCHANGE FORM
  const form = useForm<ExchangeWooOrderSchema>({
    resolver: zodResolver(exchangeWooOrderSchema),
    defaultValues: {
      original_order_id: order.id,
      returned_items: order.confirmed_order_items?.map((item) => ({
        product_variant_id: item.product_variant_id,
        quantity: item.quantity,
      })),
      exchange_items: [],
      shipping: order.woo_shipping
        ? {
            full_name: order.billing_name,
            phone_number: order.customer_phone,
            address: order.billing_address_1,
            city: order.woo_shipping.commune_name,
            state: order.woo_shipping.state_id,
            wilaya: order.woo_shipping.wilaya_name,
            commune: order.woo_shipping.commune_name,
            delivery_id: order.woo_shipping.delivery_company_id,
            comments: order.comments,
          }
        : undefined,
      total: order.final_price,
      discount: order.discount,
      shipping_provider: order.woo_shipping?.shipping_provider as
        | "yalidine"
        | "my_companies"
        | undefined,
      delivery_type: order.woo_shipping?.delivery_type as
        | "home"
        | "stopdesk"
        | undefined,
      selected_commune: order.woo_shipping?.selected_commune,
      selected_center: order.woo_shipping?.selected_center,
      first_delivery_cost: order.woo_shipping?.first_delivery_cost || 0,
      second_delivery_cost: order.woo_shipping?.second_delivery_cost || 0,
    },
  });

  const { watch, setValue, control, handleSubmit } = form;

  const shipping = watch("shipping") ?? {
    full_name: "",
    phone_number: "",
    address: "",
    city: "",
    state: "",
    wilaya: "",
    commune: "",
  };
  const exchangeItems = watch("exchange_items");
  const returnedItems = watch("returned_items");
  const discount = watch("discount");
  // Fetch yalidine Pricing with react-query
  const { data: yalidinePricing } = useQuery({
    queryKey: [
      "yalidine-pricing",
      shipping.state,
      watch("delivery_type") === "home"
        ? watch("selected_commune")
        : watch("selected_center"),
      watch("delivery_type"),
    ],
    queryFn: () => getYalidinePricing(16, Number(shipping.wilaya) ?? 16),
    select: (res) => res.data,
    enabled:
      watch("shipping_provider") === "yalidine" &&
      Boolean(shipping.state) &&
      ((watch("delivery_type") === "home" &&
        Boolean(watch("selected_commune"))) ||
        (watch("delivery_type") === "stopdesk" &&
          Boolean(watch("selected_center")))) &&
      open,
  });

  // Fetch yalidine Centers with react-query (for centers only)
  const { data: yalidineCenters } = useQuery({
    queryKey: ["yalidine-centers", shipping.state],
    queryFn: () => getYalidineCenters(Number(shipping.state)),
    select: (res) => res.data,
    enabled:
      watch("shipping_provider") === "yalidine" &&
      watch("delivery_type") === "stopdesk" &&
      Boolean(shipping.state) &&
      open,
  });

  // Fetch communes for selected state using getYalidineCommunes
  const {
    data: yalidineCommunes,
    isLoading: communesLoading,
    isError: communesError,
  } = useQuery({
    queryKey: ["yalidine-communes", shipping.state],
    queryFn: () => getYalidineCommunes(Number(shipping.state)),
    select: (res) => res.data?.data ?? [],
    enabled:
      watch("shipping_provider") === "yalidine" &&
      watch("delivery_type") === "home" &&
      Boolean(shipping.state) &&
      open,
  });

  const { data: noestWilayas } = useQuery({
    queryKey: ["noest-wilayas"],
    queryFn: getNoestWilayas,
    select: (res) => (res.data ?? []).filter((wilaya) => wilaya.is_active !== 0),
    enabled: watch("shipping_provider") === "noest" && open,
  });
  const { data: noestFees } = useQuery({
    queryKey: ["noest-fees", shipping.state],
    queryFn: () => getNoestFees(Number(shipping.state)),
    select: (res) => res.data,
    enabled:
      watch("shipping_provider") === "noest" && Boolean(shipping.state) && open,
  });
  const {
    data: noestCommunes,
    isLoading: noestCommunesLoading,
    isError: noestCommunesError,
  } = useQuery({
    queryKey: ["noest-communes", shipping.state],
    queryFn: () => getNoestCommunes(Number(shipping.state)),
    select: (res) => res.data ?? [],
    enabled:
      watch("shipping_provider") === "noest" &&
      watch("delivery_type") === "home" &&
      Boolean(shipping.state) &&
      open,
  });
  const { data: noestDesks } = useQuery({
    queryKey: ["noest-desks", shipping.state],
    queryFn: () => getNoestDesks(Number(shipping.state)),
    select: (res) => res.data ?? [],
    enabled:
      watch("shipping_provider") === "noest" &&
      watch("delivery_type") === "stopdesk" &&
      Boolean(shipping.state) &&
      open,
  });

  // Fetch delivery companies for 'My Delivery Companies' option
  const {
    data: deliveryCompaniesData,
    isLoading: deliveryCompaniesLoading,
    isError: deliveryCompaniesError,
  } = useQuery({
    queryKey: ["delivery-companies"],
    queryFn: getDeliveryCompanies,
    enabled: watch("shipping_provider") === "my_companies" && open,
    select: (res) => res.data,
  });

  // Compute the delivery fee
  const computeDeliveryFee = () => {
    let deliveryFee = 0;
    if (watch("shipping_provider") === "yalidine" && yalidinePricing) {
      let communePricing = null;
      if (watch("delivery_type") === "home") {
        communePricing =
          watch("selected_commune") && yalidinePricing.per_commune
            ? yalidinePricing.per_commune[String(watch("selected_commune"))]
            : undefined;
        deliveryFee = communePricing?.express_home ?? 0;
      } else if (
        watch("delivery_type") === "stopdesk" &&
        yalidineCenters &&
        watch("selected_center")
      ) {
        const center = (yalidineCenters.data || []).find(
          (c) => String(c.center_id) === watch("selected_center")
        );
        if (center && center.commune_id && yalidinePricing.per_commune) {
          communePricing =
            yalidinePricing.per_commune[String(center.commune_id)];
          deliveryFee = communePricing?.express_desk ?? 0;
        }
      }
    }
    if (watch("shipping_provider") === "noest" && noestFees) {
      if (watch("delivery_type") === "stopdesk" && watch("selected_center")) {
        deliveryFee = noestFees.stopdesk;
      } else if (watch("delivery_type") === "home" && watch("selected_commune")) {
        deliveryFee = noestFees.home;
      }
    }
    return deliveryFee;
  };
  const { toast } = useToast();
  // Mutation
  const { mutate: exchangeWooCommerceOrderMutation, isPending } = useMutation({
    mutationFn: exchangeWooCommerceOrder,
    onSuccess: () => {
      onOpenChange(false);
      toast({
        title: "Order exchanged successfully",
        description: "The order has been exchanged successfully",
      });
    },
    onError: (error) => {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to exchange order",
      });
    },
  });

  const userEditedSecondDelivery = useRef(false);
  const deliveryFee = computeDeliveryFee();
  const noestQuoteSelection = [
    watch("shipping_provider"),
    shipping.state,
    watch("delivery_type"),
    watch("selected_commune"),
    watch("selected_center"),
  ].join("|");

  useEffect(() => {
    if (!noestQuoteSelection.startsWith("noest|")) return;
    userEditedSecondDelivery.current = false;
  }, [noestQuoteSelection]);

  useEffect(() => {
    if (watch("shipping_provider") !== "noest" || !noestWilayas || !shipping.state) return;
    const known = noestWilayas.some((wilaya) => String(wilaya.code) === String(shipping.state));
    if (!known) {
      setValue("shipping.state", "");
      setValue("shipping.wilaya", "");
      setValue("shipping.city", "");
      setValue("selected_commune", "");
      setValue("selected_center", "");
      setValue("shipping.commune", "");
    }
  }, [noestWilayas, shipping.state, watch("shipping_provider"), setValue]);

  useEffect(() => {
    if (watch("shipping_provider") !== "noest" || watch("delivery_type") !== "home" || !noestCommunes) return;
    const selected = watch("selected_commune");
    if (selected && !noestCommunes.some((commune) => commune.name === selected)) {
      setValue("selected_commune", "");
      setValue("shipping.commune", "");
    }
  }, [noestCommunes, shipping.state, watch("delivery_type"), watch("shipping_provider"), setValue]);

  useEffect(() => {
    if (watch("shipping_provider") !== "noest" || watch("delivery_type") !== "stopdesk" || !noestDesks) return;
    const selected = watch("selected_center");
    if (selected && !noestDesks.some((desk) => desk.code === selected)) {
      setValue("selected_center", "");
    }
  }, [noestDesks, shipping.state, watch("delivery_type"), watch("shipping_provider"), setValue]);

  useEffect(() => {
    setValue("first_delivery_cost", deliveryFee);
    // Only set second_delivery_cost if the user hasn't edited it
    if (!userEditedSecondDelivery.current) {
      setValue("second_delivery_cost", deliveryFee);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deliveryFee, noestQuoteSelection, setValue]);

  // Reset commune/center when state or delivery type changes
  useEffect(() => {
    setValue("selected_commune", "");
    setValue("selected_center", "");
  }, [shipping.state, watch("delivery_type")]);

  // Set commune when center changes
  const yalidineCenter = watch("selected_center");
  useEffect(() => {
    if (watch("shipping_provider") !== "yalidine" || !yalidineCenter) return;
    const center = (yalidineCenters?.data || []).find(
      (c) => String(c.center_id) === yalidineCenter
    );
    if (center) {
      setValue("selected_commune", String(center.commune_id));
      setValue("shipping.commune", String(center.commune_name));
    }
  }, [yalidineCenter, watch("shipping_provider")]);
  // Map product_variant_id to cost for quick lookup
  const variantCostMap: Record<number, number> = {};
  if (inventoryData?.data?.items) {
    for (const item of inventoryData.data.items) {
      if (item.product_variant_id && typeof item.product?.price === "number") {
        variantCostMap[item.product_variant_id] = item.product.price;
      }
    }
  }

  // Helper to find variant by SKU
  const getVariantCost = (variantId: number) => variantCostMap[variantId] || 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("flex max-h-[92vh] w-full max-w-[100rem] flex-col gap-0 overflow-hidden p-0 sm:p-0", liquidGlass, "bg-white/85 dark:bg-slate-950/85")}>
        <DialogHeader className="space-y-3 border-b border-white/40 bg-gradient-to-r from-violet-100/80 via-indigo-50/60 to-sky-100/60 px-5 py-4 pr-12 text-left dark:border-white/10 dark:from-violet-500/15 dark:via-indigo-500/10 dark:to-sky-500/10">
          <div className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 text-white shadow-md shadow-violet-500/30">
              <Repeat className="size-5" />
            </span>
            <div className="min-w-0 space-y-0.5">
              <DialogTitle>Declare exchange for order #{order.number}</DialogTitle>
              <p className="text-sm text-muted-foreground">Pick what the courier collects, what you send back, and how it ships.</p>
            </div>
          </div>
        </DialogHeader>
        <Form {...form}>
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
          {/* 1. Customer Details Header */}
          <section className="space-y-3 rounded-xl border border-white/60 bg-white/60 p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <span className={cn("flex size-7 items-center justify-center rounded-lg", tile.sky.icon)}>
                <User className="size-4" />
              </span>
              Customer
            </h3>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {[
                { label: "Name", value: order.billing_name },
                { label: "Phone", value: order.customer_phone },
                { label: "Wilaya", value: order.woo_shipping?.wilaya_name },
                { label: "Commune", value: order.woo_shipping?.commune_name },
                { label: "Address", value: order.billing_address_1 },
                { label: "Delivery type", value: order.woo_shipping?.delivery_type },
                { label: "Selected center", value: order.woo_shipping?.selected_center },
              ].map((field) => (
                <div key={field.label} className="space-y-0.5">
                  <div className="text-xs text-muted-foreground">{field.label}</div>
                  <div className="truncate text-sm font-medium capitalize">{field.value || "—"}</div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-1.5 border-t border-black/5 pt-3 dark:border-white/10">
              <span className="mr-1 text-xs font-medium text-muted-foreground">Previously confirmed</span>
              {Array.isArray(order.confirmed_order_items) &&
              order.confirmed_order_items.length > 0 ? (
                order.confirmed_order_items.map((item: ConfirmedOrderItem) => (
                  <span
                    key={item.product_variant_id}
                    className="inline-flex items-center gap-1 rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-xs text-indigo-800 dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-200"
                  >
                    <Package className="size-3" />
                    <span className="font-mono">{item.product_variant?.qr_code || "N/A"}</span>
                    <span className="font-semibold">×{item.quantity}</span>
                  </span>
                ))
              ) : (
                <span className="text-xs text-muted-foreground">No confirmed items.</span>
              )}
            </div>
          </section>
          {/* 3 & 4. Collectable Products and Exchange Products side by side */}
          <div className="flex flex-col gap-4 xl:flex-row">
            {/* Collectable Products */}
            <section className="flex-1 space-y-3 rounded-xl border border-white/60 bg-white/60 p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <span className={cn("flex size-7 items-center justify-center rounded-lg", tile.rose.icon)}>
                  <ArrowDownToLine className="size-4" />
                </span>
                Collect from customer
              </h3>
              {Array.isArray(order.confirmed_order_items) &&
              order.confirmed_order_items.length > 0 ? (
                <div className="overflow-x-auto rounded-lg border border-rose-100 dark:border-rose-500/20">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="bg-rose-50/80 text-rose-900 dark:bg-rose-500/10 dark:text-rose-100">
                        <th className="px-3 py-2 text-left font-medium">
                          Product (QR code)
                        </th>
                        <th className="px-3 py-2 text-left font-medium">Quantity</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-rose-100 dark:divide-rose-500/20">
                      {returnedItems.map(
                        (item) => (
                          <tr key={item.product_variant_id}>
                            <td className="px-3 py-2 font-mono text-xs">
                              {inventoryData?.data?.items.find((i) => i.product_variant_id === item.product_variant_id)?.product_variant?.qr_code || "N/A"}
                            </td>
                            <td className="px-3 py-2">
                              <Input
                                type="number"
                                min={1}
                                value={item.quantity ?? 0}
                                className="h-8 w-20 bg-white/80 dark:bg-white/5"
                                onChange={(e) => {
                                  setValue("returned_items", returnedItems.map((i) => i.product_variant_id === item.product_variant_id ? { ...i, quantity: Number(e.target.value) } : i));
                                }}
                              />
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  No collectable products.
                </div>
              )}
            </section>
            {/* Exchange Products */}
            <section className="flex-1 space-y-3 rounded-xl border border-white/60 bg-white/60 p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
              <div className="flex items-center justify-between gap-2">
                <h3 className="flex items-center gap-2 text-sm font-semibold">
                  <span className={cn("flex size-7 items-center justify-center rounded-lg", tile.emerald.icon)}>
                    <ArrowUpFromLine className="size-4" />
                  </span>
                  Send to customer
                </h3>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className={cn("h-8", tone.emerald)}
                  onClick={() => {
                    setValue("exchange_items", [
                      ...watch("exchange_items"),
                      {
                        product_variant_id: 0,
                        quantity: 1,
                        discount: 0,
                      },
                    ]);
                  }}
                >
                  <Plus />
                  Add product
                </Button>
              </div>
              <div className="overflow-x-auto rounded-lg border border-emerald-100 dark:border-emerald-500/20">
                <Table className="min-w-full text-sm">
                  <TableHeader>
                    <TableRow className="bg-emerald-50/80 hover:bg-emerald-50/80 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/10">
                      <TableHead className="h-9 px-3 text-left text-emerald-900 dark:text-emerald-100">
                        Product
                      </TableHead>
                      <TableHead className="h-9 px-3 text-left text-emerald-900 dark:text-emerald-100">
                        Quantity
                      </TableHead>
                      <TableHead className="h-9 px-3 text-left text-emerald-900 dark:text-emerald-100">
                        Discount
                      </TableHead>
                      <TableHead className="h-9 px-3"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {watch("exchange_items").length === 0 && (
                      <TableRow className="hover:bg-transparent">
                        <TableCell colSpan={4} className="py-6 text-center text-sm text-muted-foreground">
                          No products yet. Use “Add product”.
                        </TableCell>
                      </TableRow>
                    )}
                    {watch("exchange_items").map((item, idx) => (
                      <TableRow key={`exchange-item-${idx}`}>
                        <TableCell
                          className="px-3 py-2"
                          key={`exchange-item-${idx}-product-variant`}
                        >
                          <ProductVariantCombobox
                            variants={allVariants}
                            value={item.product_variant_id}
                            onChange={(variantId) => {
                              setValue(
                                `exchange_items.${idx}.product_variant_id`,
                                variantId ?? 0
                              );
                            }}
                            extraText={inventoryData?.data?.items
                              .find(
                                (i) =>
                                  i.product_variant_id ===
                                  item.product_variant_id
                              )
                              ?.quantity.toString()}
                          />
                        </TableCell>
                        <TableCell
                          className="px-3 py-2"
                          key={`exchange-item-${idx}-quantity`}
                        >
                          <Input
                            type="number"
                            className="h-8 w-20 bg-white/80 dark:bg-white/5"
                            min={1}
                            value={item.quantity}
                            onChange={(e) => {
                              setValue(
                                `exchange_items.${idx}.quantity`,
                                Number(e.target.value)
                              );
                            }}
                          />
                        </TableCell>
                        <TableCell
                          className="px-3 py-2"
                          key={`exchange-item-${idx}-discount`}
                        >
                          <Input
                            type="number"
                            className="h-8 w-20 bg-white/80 dark:bg-white/5"
                            min={0}
                            value={item.discount}
                            onChange={(e) => {
                              setValue(
                                `exchange_items.${idx}.discount`,
                                Number(e.target.value)
                              );
                            }}
                          />
                        </TableCell>
                        <TableCell
                          className="px-3 py-2"
                          key={`exchange-item-${idx}-remove`}
                        >
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-8 text-rose-600 hover:bg-rose-100 hover:text-rose-700 dark:text-rose-300 dark:hover:bg-rose-500/20"
                            aria-label="Remove product"
                            onClick={() => {
                              setValue(
                                "exchange_items",
                                watch("exchange_items").filter(
                                  (_, i) => i !== idx
                                )
                              );
                            }}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </section>
            {/* 5. Shipping Section */}
            <section className="space-y-3 rounded-xl border border-white/60 bg-white/60 p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04] xl:w-[22rem] xl:shrink-0">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <span className={cn("flex size-7 items-center justify-center rounded-lg", tile.violet.icon)}>
                  <Truck className="size-4" />
                </span>
                Shipping
              </h3>
              <section className="flex flex-col gap-4">
                <Combobox
                  items={
                    watch("shipping_provider") === "noest"
                      ? (noestWilayas || []).map((wilaya) => ({
                          value: String(wilaya.code),
                          label: wilaya.name,
                        }))
                      : cities.map((city) => ({
                          value: city.key,
                          label: city.label,
                        }))
                  }
                  value={shipping.state}
                  onChange={(value: string) => {
                    setValue("shipping.state", value);
                    const wilayaName =
                      watch("shipping_provider") === "noest"
                        ? (noestWilayas || []).find((wilaya) => String(wilaya.code) === value)?.name || ""
                        : cities.find((c) => c.key === value)?.label || "";
                    setValue("shipping.wilaya", wilayaName);
                    setValue("shipping.city", wilayaName);
                  }}
                  placeholder="Select a wilaya"
                  label="State"
                  searchPlaceholder="Search wilaya..."
                />
                <div>
                  <FormField
                    control={control}
                    name="shipping_provider"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Shipping Provider</FormLabel>
                        <FormControl>
                          <CarrierRadioGroup
                            value={field.value}
                            onChange={field.onChange}
                            idPrefix="exchange-carrier"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                {(watch("shipping_provider") === "yalidine" ||
                  watch("shipping_provider") === "noest") && (
                  <div>
                    <FormField
                      control={control}
                      name="delivery_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Delivery Type</FormLabel>
                          <FormControl>
                            <RadioGroup
                              value={field.value}
                              onValueChange={(val) => field.onChange(val)}
                              className="flex flex-row gap-6 mt-2"
                            >
                              <RadioGroupItem value="home" id="home" />
                              <FormLabel htmlFor="home" className="mr-4">
                                Home
                              </FormLabel>
                              <RadioGroupItem value="stopdesk" id="stopdesk" />
                              <FormLabel htmlFor="stopdesk">
                                Stop Desk
                              </FormLabel>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
                {watch("shipping_provider") === "yalidine" &&
                  watch("delivery_type") === "home" && (
                    <div>
                      <FormField
                        control={control}
                        name="selected_commune"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Select Commune</FormLabel>
                            <FormControl>
                              <Select
                                value={field.value}
                                onValueChange={(val) => {
                                  field.onChange(val);
                                  const communeName =
                                    (yalidineCommunes || []).find(
                                      (c) => String(c.id) === val
                                    )?.name || "";
                                  setValue("shipping.commune", communeName);
                                }}
                              >
                                <SelectTrigger className="w-full mt-1">
                                  <SelectValue
                                    placeholder={
                                      communesLoading
                                        ? "Loading..."
                                        : "Select a commune"
                                    }
                                  />
                                </SelectTrigger>
                                <SelectContent>
                                  {communesLoading && (
                                    <div className="p-2 text-muted-foreground">
                                      Loading...
                                    </div>
                                  )}
                                  {communesError && (
                                    <div className="p-2 text-red-500">
                                      Error loading communes
                                    </div>
                                  )}
                                  {!communesLoading &&
                                    !communesError &&
                                    (yalidineCommunes || [])
                                      .sort((a, b) =>
                                        a.name.localeCompare(b.name)
                                      )
                                      .filter((c) => c.is_deliverable)
                                      .map((commune) => (
                                        <SelectItem
                                          key={commune.id}
                                          value={String(commune.id)}
                                        >
                                          {commune.name}
                                        </SelectItem>
                                      ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                {watch("shipping_provider") === "yalidine" &&
                  watch("delivery_type") === "stopdesk" && (
                    <FormField
                      control={control}
                      name="selected_center"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Select Center</FormLabel>
                          <FormControl>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger className="w-full mt-1">
                                <SelectValue placeholder="Select a center" />
                              </SelectTrigger>
                              <SelectContent>
                                {(yalidineCenters?.data || []).map((center) => (
                                  <SelectItem
                                    key={center.center_id}
                                    value={String(center.center_id)}
                                  >
                                    {center.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                {watch("shipping_provider") === "noest" &&
                  watch("delivery_type") === "home" && (
                    <FormField
                      control={control}
                      name="selected_commune"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>NOEST Commune</FormLabel>
                          <FormControl>
                            <Select
                              value={field.value}
                              onValueChange={(val) => {
                                field.onChange(val);
                                setValue("shipping.commune", val);
                              }}
                            >
                              <SelectTrigger className="w-full mt-1">
                                <SelectValue
                                  placeholder={
                                    noestCommunesLoading
                                      ? "Loading..."
                                      : "Select a commune"
                                  }
                                />
                              </SelectTrigger>
                              <SelectContent>
                                {noestCommunesError && (
                                  <div className="p-2 text-red-500">
                                    Error loading communes
                                  </div>
                                )}
                                {(noestCommunes || [])
                                  .slice()
                                  .sort((a, b) => a.name.localeCompare(b.name))
                                  .map((commune) => (
                                    <SelectItem key={commune.name} value={commune.name}>
                                      {commune.name}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                {watch("shipping_provider") === "noest" &&
                  watch("delivery_type") === "stopdesk" && (
                    <FormField
                      control={control}
                      name="selected_center"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>NOEST Desk</FormLabel>
                          <FormControl>
                            <Select
                              value={field.value}
                              onValueChange={(val) => {
                                field.onChange(val);
                                const desk = (noestDesks || []).find((item) => item.code === val);
                                if (desk) setValue("shipping.commune", desk.name);
                              }}
                            >
                              <SelectTrigger className="w-full mt-1">
                                <SelectValue placeholder="Select a desk" />
                              </SelectTrigger>
                              <SelectContent>
                                {(noestDesks || [])
                                  .slice()
                                  .sort((a, b) => a.name.localeCompare(b.name))
                                  .map((desk) => (
                                    <SelectItem key={desk.code} value={desk.code}>
                                      {desk.name}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                {watch("shipping_provider") === "noest" && noestFees && (
                  <div className={cn("grid grid-cols-3 gap-2 rounded-lg border p-2 text-center text-xs", tile.sky.surface)}>
                    <div>
                      <div className="opacity-70">Home</div>
                      <div className="font-semibold tabular-nums">{noestFees.home} DZD</div>
                    </div>
                    <div>
                      <div className="opacity-70">Stop desk</div>
                      <div className="font-semibold tabular-nums">{noestFees.stopdesk} DZD</div>
                    </div>
                    <div>
                      <div className="opacity-70">Return</div>
                      <div className="font-semibold tabular-nums">{noestFees.return} DZD</div>
                    </div>
                  </div>
                )}
                {watch("shipping_provider") === "my_companies" && (
                  <>
                    <FormField
                      control={control}
                      name="shipping.delivery_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Select Delivery Company</FormLabel>
                          <FormControl>
                            <Select
                              value={field.value ? String(field.value) : ""}
                              onValueChange={(val) =>
                                field.onChange(val ? Number(val) : undefined)
                              }
                            >
                              <SelectTrigger className="w-full mt-1">
                                <SelectValue
                                  placeholder={
                                    deliveryCompaniesLoading
                                      ? "Loading..."
                                      : "Select a delivery company"
                                  }
                                />
                              </SelectTrigger>
                              <SelectContent>
                                {deliveryCompaniesLoading && (
                                  <div className="p-2 text-muted-foreground">
                                    Loading...
                                  </div>
                                )}
                                {deliveryCompaniesError && (
                                  <div className="p-2 text-red-500">
                                    Error loading companies
                                  </div>
                                )}
                                {!deliveryCompaniesLoading &&
                                  !deliveryCompaniesError &&
                                  (deliveryCompaniesData || []).map(
                                    (company) => (
                                      <SelectItem
                                        key={company.ID}
                                        value={String(company.ID)}
                                      >
                                        {company.name}
                                      </SelectItem>
                                    )
                                  )}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {/* Algerian Cities Select for My Delivery Companies */}
                    <FormField
                      control={control}
                      name="shipping.commune"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Select City (Commune)</FormLabel>
                          <FormControl>
                            <Select
                              value={field.value || ""}
                              onValueChange={(val) => field.onChange(val)}
                            >
                              <SelectTrigger className="w-full mt-1">
                                <SelectValue placeholder="Select a city (commune)" />
                              </SelectTrigger>
                              <SelectContent>
                                {algerCities.map((city) => (
                                  <SelectItem key={city.key} value={city.key}>
                                    {city.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
                {watch("shipping_provider") === "yalidine" &&
                  yalidinePricing && (
                    <div>
                      <Label>Pricing</Label>
                      {(() => {
                        let communePricing: any = null;
                        if (watch("delivery_type") === "home") {
                          communePricing =
                            watch("selected_commune") &&
                            yalidinePricing.per_commune
                              ? yalidinePricing.per_commune[
                                  String(watch("selected_commune"))
                                ]
                              : undefined;
                        } else if (
                          watch("delivery_type") === "stopdesk" &&
                          yalidineCenters &&
                          watch("selected_center")
                        ) {
                          const center = (yalidineCenters.data || []).find(
                            (c) =>
                              String(c.center_id) === watch("selected_center")
                          );
                          if (
                            center &&
                            center.commune_id &&
                            yalidinePricing.per_commune
                          ) {
                            communePricing =
                              yalidinePricing.per_commune[
                                String(center.commune_id)
                              ];
                          }
                        }
                        return communePricing ? (
                          <div className={cn("mt-1 rounded-lg border p-2 text-sm", tile.rose.surface)}>
                            <div className="mb-1 flex items-center gap-1.5 font-medium">
                              <MapPin className="size-3.5" />
                              {communePricing.commune_name}
                            </div>
                            <table className="text-sm w-full">
                              <thead>
                                <tr>
                                  <th className="text-left">Type</th>
                                  <th className="text-left">Home</th>
                                  <th className="text-left">Desk</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td>Express</td>
                                  <td>
                                    {communePricing.express_home !== null
                                      ? new Intl.NumberFormat("en-US", {
                                          style: "currency",
                                          currency: "DZD",
                                        }).format(communePricing.express_home)
                                      : "-"}
                                  </td>
                                  <td>
                                    {communePricing.express_desk !== null
                                      ? new Intl.NumberFormat("en-US", {
                                          style: "currency",
                                          currency: "DZD",
                                        }).format(communePricing.express_desk)
                                      : "-"}
                                  </td>
                                </tr>
                                <tr>
                                  <td>Economic</td>
                                  <td>
                                    {communePricing.economic_home !== null
                                      ? new Intl.NumberFormat("en-US", {
                                          style: "currency",
                                          currency: "DZD",
                                        }).format(communePricing.economic_home)
                                      : "-"}
                                  </td>
                                  <td>
                                    {communePricing.economic_desk !== null
                                      ? new Intl.NumberFormat("en-US", {
                                          style: "currency",
                                          currency: "DZD",
                                        }).format(communePricing.economic_desk)
                                      : "-"}
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                            <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                              <div>
                                Retour Fee:{" "}
                                <span className="font-medium">
                                  {new Intl.NumberFormat("en-US", {
                                    style: "currency",
                                    currency: "DZD",
                                  }).format(yalidinePricing.retour_fee)}
                                </span>
                              </div>
                              <div>
                                COD %:{" "}
                                <span className="font-medium">
                                  {yalidinePricing.cod_percentage}%
                                </span>
                              </div>
                              <div>
                                Insurance %:{" "}
                                <span className="font-medium">
                                  {yalidinePricing.insurance_percentage}%
                                </span>
                              </div>
                              <div>
                                Oversize Fee:{" "}
                                <span className="font-medium">
                                  {new Intl.NumberFormat("en-US", {
                                    style: "currency",
                                    currency: "DZD",
                                  }).format(yalidinePricing.oversize_fee)}
                                </span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-xs text-muted-foreground">
                            No pricing found for this{" "}
                            {watch("delivery_type") === "home"
                              ? "commune"
                              : "center"}
                            .
                          </div>
                        );
                      })()}
                    </div>
                  )}
              </section>
            </section>
          </div>

          {/* 6. Summary */}
          <section className="space-y-3 rounded-xl border border-white/60 bg-white/60 p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <span className={cn("flex size-7 items-center justify-center rounded-lg", tile.amber.icon)}>
                <Receipt className="size-4" />
              </span>
              Summary
            </h3>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Products total</span>
                <span className="font-semibold">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "DZD",
                  }).format(
                    exchangeItems.reduce(
                      (sum, item) =>
                        sum +
                        getVariantCost(item.product_variant_id) * item.quantity,
                      0
                    )
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Delivery fee</span>
                <FormField
                  control={form.control}
                  name="first_delivery_cost"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <input type="hidden" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="second_delivery_cost"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <input
                          type="number"
                          className="h-8 w-[120px] rounded-md border border-input bg-white/80 px-2 text-right tabular-nums dark:bg-white/5"
                          value={field.value}
                          onChange={(e) => {
                            userEditedSecondDelivery.current = true;
                            field.onChange(Number(e.target.value));
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex justify-between items-center">
                <span>Discount</span>
                <FormField
                  control={form.control}
                  name="discount"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                          className="h-8 w-[120px] bg-white/80 text-right tabular-nums dark:bg-white/5"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className={cn("mt-1 flex items-center justify-between rounded-lg border px-3 py-2 text-lg font-bold", tile.emerald.surface)}>
                <span>Total</span>
                <span className="tabular-nums">
                  {(() => {
                    let returnTotals = returnedItems.reduce(
                      (sum, item) =>
                        sum +
                        getVariantCost(item.product_variant_id) * (item.quantity ?? 0),
                      0
                    );
                    console.log("returnedItems", returnedItems);
                    console.log(`returnedItems total: ${returnTotals}`);
                    let productsTotal = exchangeItems.reduce(
                      (sum, item) =>
                        sum +
                        getVariantCost(item.product_variant_id) * item.quantity,
                      0
                    );
                    // Use only the value of second_delivery_cost for the delivery part of the total
                    const secondDeliveryCost = watch("second_delivery_cost");
                    const total =
                      productsTotal -
                      returnTotals +
                      (secondDeliveryCost || 0) -
                      (discount || 0) +
                      (order.discount || 0);

                    setValue("total", total);
                    return new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "DZD",
                    }).format(Math.max(total, 0));
                  })()}
                  <input type="hidden" {...form.register("total")} />
                </span>
              </div>
            </div>
          </section>
          </div>

          <DialogFooter className="gap-2 border-t border-white/40 px-5 py-3 dark:border-white/10 sm:space-x-0">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/25 hover:from-violet-500 hover:to-indigo-500"
              onClick={handleSubmit((data) =>
                exchangeWooCommerceOrderMutation(data), (err) => {
                    console.error(err);
                    
                }
              )}
              disabled={isPending}
            >
              {isPending ? <Loader2 className="animate-spin" /> : <Repeat />}
              {isPending ? "Submitting…" : "Declare exchange"}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
