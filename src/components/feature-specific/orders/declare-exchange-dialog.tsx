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
    getYalidineCenters,
    getYalidineCommunes,
    getYalidinePricing,
} from "@/services/order-service";
import { exchangeWooCommerceOrder } from "@/services/woocommerce-service";
import { algerCities, cities } from "@/utils/algeria-cities";
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
            state: order.shipping_city,
            wilaya: order.shipping_city,
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

  const shipping = watch("shipping");
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
    return deliveryFee;
  };
  const { toast } = useToast();
  // Mutation
  const { mutate: exchangeWooCommerceOrderMutation } = useMutation({
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

  useEffect(() => {
    setValue("first_delivery_cost", deliveryFee);
    // Only set second_delivery_cost if the user hasn't edited it
    if (!userEditedSecondDelivery.current) {
      setValue("second_delivery_cost", deliveryFee);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deliveryFee, setValue]);

  // Reset commune/center when state or delivery type changes
  useEffect(() => {
    setValue("selected_commune", "");
    setValue("selected_center", "");
  }, [shipping.state, watch("delivery_type")]);

  // Set commune when center changes
  const yalidineCenter = watch("selected_center");
  useEffect(() => {
    if (yalidineCenter) {
      const center = (yalidineCenters?.data || []).find(
        (c) => String(c.center_id) === yalidineCenter
      );
      if (center) {
        setValue("selected_commune", String(center.commune_id));
        setValue("shipping.commune", String(center.commune_name));
      }
    }
  }, [yalidineCenter]);
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
      <DialogContent className="max-w-[100rem] w-fit overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Declare Exchange for Order #{order.number}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          {/* 1. Customer Details Header */}
          <section className="mb-4 p-4 border rounded bg-muted">
            <div className="font-semibold mb-2">Customer Details</div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="font-medium">Name:</span> {order.billing_name}
              </div>
              <div>
                <span className="font-medium">Phone:</span>{" "}
                {order.customer_phone}
              </div>
              <div>
                <span className="font-medium">City:</span>{" "}
                {order.woo_shipping?.commune_name || "N/A"}
              </div>
              <div>
                <span className="font-medium">Wilaya:</span>{" "}
                {order.woo_shipping?.wilaya_name || "N/A"}
              </div>
              <div>
                <span className="font-medium">Address:</span>{" "}
                {order.billing_address_1}
              </div>
            </div>
          </section>
          {/* 2. Previous Confirmed Items */}
          <section className="mb-4">
            <div className="font-semibold mb-2">Previous Confirmed Items</div>
            {Array.isArray(order.confirmed_order_items) &&
            order.confirmed_order_items.length > 0 ? (
              <ul className="list-disc pl-6">
                {order.confirmed_order_items.map((item: ConfirmedOrderItem) => (
                  <li key={item.product_variant_id}>
                    <span className="font-medium">QR:</span>{" "}
                    {item.product_variant?.qr_code || "N/A"}{" "}
                    <span className="font-medium">Qty:</span> {item.quantity}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-muted-foreground">No confirmed items.</div>
            )}
          </section>
          {/* 3 & 4. Collectable Products and Exchange Products side by side */}
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            {/* Collectable Products */}
            <section className="flex-1">
              <div className="font-semibold mb-2">Collectable Products</div>
              {Array.isArray(order.confirmed_order_items) &&
              order.confirmed_order_items.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full border text-sm">
                    <thead>
                      <tr className="bg-muted">
                        <th className="px-3 py-2 text-left">
                          Product (QR Code)
                        </th>
                        <th className="px-3 py-2 text-left">Quantity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.confirmed_order_items.map(
                        (item: ConfirmedOrderItem) => (
                          <tr key={item.product_variant_id}>
                            <td className="px-3 py-2">
                              {item?.product_variant?.qr_code || "N/A"}
                            </td>
                            <td className="px-3 py-2">
                              <Input
                                type="number"
                                min={1}
                                value={item.quantity}
                                onChange={(e) => {
                                  console.log(e.target.value);
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
                <div className="text-muted-foreground">
                  No collectable products.
                </div>
              )}
            </section>
            {/* Exchange Products */}
            <section className="flex-1">
              <div className="font-semibold mb-2">Exchange Products</div>
              {/* TODO: Table for exchange products with ProductVariantCombobox, add/remove row logic */}
              <div className="overflow-x-auto">
                <Table className="min-w-full border text-sm">
                  <TableHeader>
                    <TableHead className="px-3 py-2 text-left">
                      Product
                    </TableHead>
                    <TableHead className="px-3 py-2 text-left">
                      Quantity
                    </TableHead>
                    <TableHead className="px-3 py-2 text-left">
                      Discount
                    </TableHead>
                    <TableHead className="px-3 py-2"></TableHead>
                  </TableHeader>
                  <TableBody>
                    {/* Placeholder for exchange items rows */}
                    {/* To be replaced with dynamic row logic */}
                    {watch("exchange_items").map((item, idx) => (
                      <TableRow>
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
                            className="w-16 border rounded px-1"
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
                            className="w-16 border rounded px-1"
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
                          <button
                            className="text-red-500"
                            onClick={() => {
                              setValue(
                                "exchange_items",
                                watch("exchange_items").filter(
                                  (_, i) => i !== idx
                                )
                              );
                            }}
                          >
                            Remove
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <Button
                  className="mt-2 px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition"
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
                  Add Product
                </Button>
              </div>
            </section>
            {/* 5. Shipping Section */}
            <section className="mb-4">
              <div className="font-semibold mb-2">Shipping</div>
              {/* Shipping Section */}
              <section className="border rounded p-4 flex flex-col gap-4 min-w-[320px] xl:w-1/3">
                <Combobox
                  items={cities.map((city) => ({
                    value: city.key,
                    label: city.label,
                  }))}
                  value={shipping.state}
                  onChange={(value: string) => {
                    setValue("shipping.state", value);
                    const wilayaName =
                      cities.find((c) => c.key === value)?.label || "";
                    setValue("shipping.wilaya", wilayaName);
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
                          <RadioGroup
                            value={field.value}
                            onValueChange={(val) => field.onChange(val)}
                            className="flex flex-row gap-6 mt-2"
                          >
                            <RadioGroupItem value="yalidine" id="yalidine" />
                            <FormLabel htmlFor="yalidine" className="mr-4">
                              Yalidine
                            </FormLabel>
                            <RadioGroupItem
                              value="my_companies"
                              id="my_companies"
                            />
                            <FormLabel htmlFor="my_companies">
                              My Delivery Companies
                            </FormLabel>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                {watch("shipping_provider") === "yalidine" && (
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
                          <div className="border rounded p-2 bg-muted/30">
                            <div className="font-medium mb-1">
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
          <section className="mb-4">
            <div className="font-semibold mb-2">Summary</div>
            {/* TODO: Summary calculation and dynamic text */}
            <div className="mt-4 p-4 bg-muted/40 rounded flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Products Total</span>
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
                <span>Delivery Fee</span>
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
                          className="max-w-[120px] text-right border rounded px-2 py-1 bg-background"
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
                          className="max-w-[120px] text-right"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex justify-between items-center text-lg font-bold mt-2">
                <span>Total</span>
                <span>
                  {(() => {
                    let returnTotals = returnedItems.reduce(
                      (sum, item) =>
                        sum +
                        getVariantCost(item.product_variant_id) * item.quantity,
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

          {/* TODO: Form submit button */}
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handleSubmit((data) =>
                exchangeWooCommerceOrderMutation(data)
              )}
            >
              Submit
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
