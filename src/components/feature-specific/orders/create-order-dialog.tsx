import { RootState } from "@/app/store";
import { ProductVariantCombobox } from "@/components/feature-specific/company-products/product-variant-combobox";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox-standalone";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell, TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useOrder } from "@/hooks/use-orders-with-realtime";
import { useToast } from "@/hooks/use-toast";
import { Order } from "@/models/data/order.model";
import { WooOrder } from "@/models/data/woo-order.model";
import { createOrderSchema, CreateOrderSchema } from "@/schemas/order";
import { getDeliveryCompanies } from "@/services/delivery-service";
import { getCompanyInventory } from "@/services/inventory-service";
import { getYalidineCenters, getYalidineCommunes, getYalidinePricing } from "@/services/order-service";
import { confirmWooCommerceOrder } from "@/services/woocommerce-service";
import { cities } from "@/utils/algeria-cities";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { ClientStatusDialog } from "./client-status-dialog";

function CreateOrderDialog({
  wooOrder,
  open,
  setOpen,
}: {
  wooOrder: WooOrder;
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const company = useSelector((state: RootState) => state.company.company);
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

  // Build a map from qr_code to ProductVariant
  const qrCodeToVariant: Record<string, typeof allVariants[number]> = {};
  for (const variant of allVariants) {
    if (variant.qr_code) {
      qrCodeToVariant[variant.qr_code] = variant;
    }
  }

  // Find the wilaya (state) object by matching the label to billing_city or shipping_city
  const matchedWilaya = cities.find(
    c =>
      c.key === wooOrder.shipping_city 
  );

  const form = useForm<CreateOrderSchema>({
    resolver: zodResolver(createOrderSchema),
    defaultValues: {
      company_id: company.ID,
      woo_order_id: wooOrder.id,
      shipping: {
        full_name: wooOrder.billing_name || wooOrder.shipping_name || "",
        phone_number: wooOrder.customer_phone || "",
        address: wooOrder.shipping_address_1 || wooOrder.billing_address_1 || "",
        city: wooOrder.billing_city || "",
        state: matchedWilaya?.key || "",
        delivery_id: undefined,
        comments: "",
        commune: "",
        wilaya: matchedWilaya?.label || "",
      },
      order_items: wooOrder.line_items.map((item) => {
        const variant = item.sku ? qrCodeToVariant[item.sku] : undefined;
        return {
          product_id: variant?.product_id || 0,
          product_variant_id: variant?.ID || 0,
          discount: 0,
          quantity: item.quantity,
        };
      }),
      total: Number(wooOrder.total),
      status: "unconfirmed",
      discount: 0,
      taken_by_id: wooOrder.taken_by_id || undefined,
      shipping_provider: 'yalidine',
      delivery_type: 'home',
      selected_commune: '',
      selected_center: '',
      first_delivery_cost: 0,
      second_delivery_cost: 0,
    },
    // mode: "onChange",
  });

  const {
    setValue,
    watch,
    handleSubmit,
    formState: { errors },
  } = form;

  const shipping = watch("shipping");
  const discount = watch("discount");
  const orderItems = watch("order_items");

  const [clientStatusDialogOpen, setClientStatusDialogOpen] = useState(false);

  // Fetch yalidine Pricing with react-query
  const { data: yalidinePricing } = useQuery({
    queryKey: [
      "yalidine-pricing",
      shipping.state,
      watch('delivery_type') === "home" ? watch('selected_commune') : watch('selected_center'),
      watch('delivery_type')
    ],
    queryFn: () => getYalidinePricing(16, Number(shipping.state) ?? 16),
    select: (res) => res.data,
    enabled:
      watch('shipping_provider') === "yalidine" &&
      Boolean(shipping.state) &&
      ((watch('delivery_type') === "home" && Boolean(watch('selected_commune'))) ||
        (watch('delivery_type') === "stopdesk" && Boolean(watch('selected_center')))) &&
      open,
  });

  // Fetch yalidine Centers with react-query (for centers only)
  const { data: yalidineCenters } = useQuery({
    queryKey: ["yalidine-centers", shipping.state],
    queryFn: () => getYalidineCenters(Number(shipping.state)),
    select: (res) => res.data,
    enabled: watch('shipping_provider') === "yalidine" && watch('delivery_type') === "stopdesk" && Boolean(shipping.state) && open,
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
      watch('shipping_provider') === "yalidine" &&
      watch('delivery_type') === "home" &&
      Boolean(shipping.state) && open
  });

  // Fetch delivery companies for 'My Delivery Companies' option
  const {
    data: deliveryCompaniesData,
    isLoading: deliveryCompaniesLoading,
    isError: deliveryCompaniesError,
  } = useQuery({
    queryKey: ["delivery-companies"],
    queryFn: getDeliveryCompanies,
    enabled: watch('shipping_provider') === "my_companies" && open,
    select: (res) => res.data,
  });

  // Reset commune/center when state or delivery type changes
  useEffect(() => {
    setValue('selected_commune', '');
    setValue('selected_center', '');
  }, [shipping.state, watch('delivery_type')]);

  // Set commune when center changes
  const yalidineCenter = watch('selected_center');
  useEffect(() => {
    if (yalidineCenter) {
      const center = (yalidineCenters?.data || []).find(c => String(c.center_id) === yalidineCenter);
      if (center) {
        setValue('selected_commune', String(center.commune_id));
        setValue('shipping.commune', String(center.commune_name));
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

  // Compute the delivery fee
  const computeDeliveryFee = () => {
    let deliveryFee = 0;
    if (watch('shipping_provider') === 'yalidine' && yalidinePricing) {
      let communePricing = null;
      if (watch('delivery_type') === 'home') {
        communePricing = (watch('selected_commune') && yalidinePricing.per_commune)
          ? yalidinePricing.per_commune[String(watch('selected_commune'))]
          : undefined;
        deliveryFee = communePricing?.express_home ?? 0;
      } else if (watch('delivery_type') === 'stopdesk' && yalidineCenters && watch('selected_center')) {
        const center = (yalidineCenters.data || []).find(c => String(c.center_id) === watch('selected_center'));
        if (center && center.commune_id && yalidinePricing.per_commune) {
          communePricing = yalidinePricing.per_commune[String(center.commune_id)];
          deliveryFee = communePricing?.express_desk ?? 0;
        }
      }
    }
    return deliveryFee;
  };

  const deliveryFee = computeDeliveryFee();

  // Add a ref to track if the user has edited second_delivery_cost
  const userEditedSecondDelivery = useRef(false);

  useEffect(() => {
    setValue('first_delivery_cost', deliveryFee);
    // Only set second_delivery_cost if the user hasn't edited it
    if (!userEditedSecondDelivery.current) {
      setValue('second_delivery_cost', deliveryFee);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deliveryFee, setValue]);
  const {toast} = useToast();
  const queryClient = useQueryClient();
  const {mutate: confirmWooCommerceOrderMutation, isPending} = useMutation({
    mutationFn: confirmWooCommerceOrder,
    onSuccess: () => {
      toast({
        title: "Order confirmed",
        description: "Order confirmed successfully",
      });
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (err: any) => {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
      console.error("Failed to create order:", err);
    },
  });

  const handleSubmitForm = (data: CreateOrderSchema) => {
    console.log(data);
    confirmWooCommerceOrderMutation(data);
  };
  
  useOrder(wooOrder.id);

  useEffect(() => {
    const handleQueryUpdate = () => {
      // Check if the order was updated externally
      const cachedOrder = queryClient.getQueryData(['orders', wooOrder.id]) as Order;
      const originalOrder = queryClient.getQueryState(['orders', wooOrder.id])?.dataUpdatedAt;
      
      // If data was updated recently (within last 2 seconds), it might be from external source
      if (cachedOrder && originalOrder && Date.now() - originalOrder < 2000) {
        console.log('Order updated externally, closing dialog');
        setOpen(false);
      }
    };

    if (open && wooOrder.id) {
      // Subscribe to query changes
      const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
        if (
          event.type === 'updated' &&
          event.query.queryKey[0] === 'orders' &&
          event.query.queryKey[1] === wooOrder.id
        ) {
          handleQueryUpdate();
        }
      });

      return unsubscribe;
    }
  }, [open, wooOrder.id, queryClient]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-[100rem] w-full overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            Create Order from WooOrder #{wooOrder.number}
          </DialogTitle>
          <DialogDescription>
            Fill or adjust the details below to create a new Order.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setClientStatusDialogOpen(true)}
          >
            Set Client Status
          </Button>
        </div>
        <Form {...form}>
          <form onSubmit={handleSubmit(handleSubmitForm)} className="space-y-4">
            {/* Main sections in a row on desktop, stacked on mobile */}
            <div className="flex flex-col gap-6 xl:flex-row xl:gap-4">
              {/* Shipping Section */}
              <section className="border rounded p-4 flex flex-col gap-4 min-w-[320px] xl:w-1/3">
                <h3 className="font-semibold mb-2">Shipping</h3>
                <div>
                  <FormField
                    control={form.control}
                    name="shipping_provider"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Shipping Provider</FormLabel>
                        <FormControl>
                          <RadioGroup
                            value={field.value}
                            onValueChange={val => field.onChange(val)}
                            className="flex flex-row gap-6 mt-2"
                          >
                            <RadioGroupItem value="yalidine" id="yalidine" />
                            <FormLabel htmlFor="yalidine" className="mr-4">Yalidine</FormLabel>
                            <RadioGroupItem value="my_companies" id="my_companies" />
                            <FormLabel htmlFor="my_companies">My Delivery Companies</FormLabel>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                {watch('shipping_provider') === 'yalidine' && (
                  <div>
                    <FormField
                      control={form.control}
                      name="delivery_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Delivery Type</FormLabel>
                          <FormControl>
                            <RadioGroup
                              value={field.value}
                              onValueChange={val => field.onChange(val)}
                              className="flex flex-row gap-6 mt-2"
                            >
                              <RadioGroupItem value="home" id="home" />
                              <FormLabel htmlFor="home" className="mr-4">Home</FormLabel>
                              <RadioGroupItem value="stopdesk" id="stopdesk" />
                              <FormLabel htmlFor="stopdesk">Stop Desk</FormLabel>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
                {watch('shipping_provider') === 'yalidine' && watch('delivery_type') === 'home' && (
                  <div>
                    <FormField
                      control={form.control}
                      name="selected_commune"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Select Commune</FormLabel>
                          <FormControl>
                            <Select
                              value={field.value}
                              onValueChange={(val) => {
                                field.onChange(val);
                                const communeName = (yalidineCommunes || []).find(c => String(c.id) === val)?.name || '';
                                setValue('shipping.commune', communeName);
                              }}
                            >
                              <SelectTrigger className="w-full mt-1">
                                <SelectValue placeholder={communesLoading ? "Loading..." : "Select a commune"} />
                              </SelectTrigger>
                              <SelectContent>
                                {communesLoading && <div className="p-2 text-muted-foreground">Loading...</div>}
                                {communesError && <div className="p-2 text-red-500">Error loading communes</div>}
                                {!communesLoading && !communesError && (yalidineCommunes || []).filter(c => c.is_deliverable).map(commune => (
                                  <SelectItem key={commune.id} value={String(commune.id)}>{commune.name}</SelectItem>
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
                {watch('shipping_provider') === 'yalidine' && watch('delivery_type') === 'stopdesk' && (
                  <FormField
                    control={form.control}
                    name="selected_center"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select Center</FormLabel>
                        <FormControl>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger className="w-full mt-1">
                              <SelectValue placeholder="Select a center" />
                            </SelectTrigger>
                            <SelectContent>
                              {(yalidineCenters?.data || []).map(center => (
                                <SelectItem key={center.center_id} value={String(center.center_id)}>{center.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                {watch('shipping_provider') === 'my_companies' && (
                  <FormField
                    control={form.control}
                    name="shipping.delivery_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select Delivery Company</FormLabel>
                        <FormControl>
                          <Select value={field.value ? String(field.value) : ""} onValueChange={val => field.onChange(val ? Number(val) : undefined)}>
                            <SelectTrigger className="w-full mt-1">
                              <SelectValue placeholder={deliveryCompaniesLoading ? "Loading..." : "Select a delivery company"} />
                            </SelectTrigger>
                            <SelectContent>
                              {deliveryCompaniesLoading && <div className="p-2 text-muted-foreground">Loading...</div>}
                              {deliveryCompaniesError && <div className="p-2 text-red-500">Error loading companies</div>}
                              {!deliveryCompaniesLoading && !deliveryCompaniesError && (deliveryCompaniesData || []).map(company => (
                                <SelectItem key={company.ID} value={String(company.ID)}>{company.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                {watch('shipping_provider') === 'yalidine' && yalidinePricing && (
                  <div>
                    <Label>Pricing</Label>
                    {(() => {
                      let communePricing: any = null;
                      if (watch('delivery_type') === 'home') {
                        communePricing = (watch('selected_commune') && yalidinePricing.per_commune)
                          ? yalidinePricing.per_commune[String(watch('selected_commune'))]
                          : undefined;
                      } else if (watch('delivery_type') === 'stopdesk' && yalidineCenters && watch('selected_center')) {
                        const center = (yalidineCenters.data || []).find(c => String(c.center_id) === watch('selected_center'));
                        if (center && center.commune_id && yalidinePricing.per_commune) {
                          communePricing = yalidinePricing.per_commune[String(center.commune_id)];
                        }
                      }
                      return communePricing ? (
                        <div className="border rounded p-2 bg-muted/30">
                          <div className="font-medium mb-1">{communePricing.commune_name}</div>
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
                                <td>{communePricing.express_home !== null ? new Intl.NumberFormat("en-US", { style: "currency", currency: "DZD" }).format(communePricing.express_home) : "-"}</td>
                                <td>{communePricing.express_desk !== null ? new Intl.NumberFormat("en-US", { style: "currency", currency: "DZD" }).format(communePricing.express_desk) : "-"}</td>
                              </tr>
                              <tr>
                                <td>Economic</td>
                                <td>{communePricing.economic_home !== null ? new Intl.NumberFormat("en-US", { style: "currency", currency: "DZD" }).format(communePricing.economic_home) : "-"}</td>
                                <td>{communePricing.economic_desk !== null ? new Intl.NumberFormat("en-US", { style: "currency", currency: "DZD" }).format(communePricing.economic_desk) : "-"}</td>
                              </tr>
                            </tbody>
                          </table>
                          <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                            <div>Retour Fee: <span className="font-medium">{new Intl.NumberFormat("en-US", { style: "currency", currency: "DZD" }).format(yalidinePricing.retour_fee)}</span></div>
                            <div>COD %: <span className="font-medium">{yalidinePricing.cod_percentage}%</span></div>
                            <div>Insurance %: <span className="font-medium">{yalidinePricing.insurance_percentage}%</span></div>
                            <div>Oversize Fee: <span className="font-medium">{new Intl.NumberFormat("en-US", { style: "currency", currency: "DZD" }).format(yalidinePricing.oversize_fee)}</span></div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-muted-foreground">No pricing found for this {watch('delivery_type') === 'home' ? 'commune' : 'center'}.</div>
                      );
                    })()}
                  </div>
                )}
              </section>
              {/* Customer/Order Info Section */}
              <div className="space-y-4 border rounded p-4 min-w-[320px] xl:w-1/3">
                <FormField
                  control={form.control}
                  name="shipping.full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input {...field} required />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="shipping.phone_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input {...field} required />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="shipping.address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input {...field} required />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div>
                  <Combobox
                    items={cities.map((city) => ({
                      value: city.key,
                      label: city.label,
                    }))}
                    value={shipping.state}
                    onChange={(value: string) => {
                      setValue('shipping.state', value);
                      const wilayaName = cities.find(c => c.key === value)?.label || '';
                      setValue('shipping.wilaya', wilayaName);
                    }}
                    placeholder="Select a wilaya"
                    label="State"
                    searchPlaceholder="Search wilaya..."
                  />
                </div>
                <FormField
                  control={form.control}
                  name="shipping.comments"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client Comments</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {/* Order Items Table Section */}
              <div className="space-y-4 border rounded p-4 flex-1 min-w-[340px] xl:w-1/3 flex flex-col">
                <Label>Order Items</Label>
                <ol className="flex flex-col gap-2">
                  {wooOrder.line_items.map((item, idx) => (
                    <li key={idx}>
                      {idx + 1}. {item.name} ({item.quantity} x{" "}
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "DZD",
                      }).format(item.price)}
                      )
                    </li>
                  ))}
                </ol>
                <div className="overflow-x-auto flex-1 flex flex-col min-h-0">
                  <div className="flex-1 min-h-0 max-h-52 overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product Variant</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orderItems.map((item, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="min-w-[200px]">
                              <ProductVariantCombobox
                                variants={allVariants}
                                value={item.product_variant_id}
                                onChange={(variantId) => {
                                  const selectedVariant = allVariants.find(
                                    (v) => v.ID === variantId
                                  );
                                  setValue(`order_items.${idx}.product_variant_id`, variantId ?? 0);
                                  setValue(`order_items.${idx}.product_id`, selectedVariant?.product_id ?? 0);
                                }}
                                key={`variant-combobox-${idx}`}
                                error={errors.order_items?.[idx]?.product_variant_id?.message}
                                extraText={inventoryData?.data?.items.find(i => i.product_variant_id === item.product_variant_id)?.quantity.toString()}
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min={1}
                                value={item.quantity}
                                onChange={(e) => {
                                  const quantity = Number(e.target.value);
                                  setValue(`order_items.${idx}.quantity`, quantity);
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              {getVariantCost(item.product_variant_id) * item.quantity}
                            </TableCell>
                            <TableCell>
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  setValue(
                                    "order_items",
                                    orderItems.filter((_, i) => i !== idx)
                                  );
                                }}
                              >
                                Remove
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-2"
                    onClick={() =>
                      setValue('order_items', [
                        ...orderItems,
                        {
                          product_id: 0,
                          product_variant_id: 0,
                          discount: 0,
                          quantity: 1,
                        },
                      ])
                    }
                  >
                    Add Item
                  </Button>
                </div>
                {/* Summary area below the table */}
                <div className="mt-4 p-4 bg-muted/40 rounded flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Products Total</span>
                    <span className="font-semibold">
                      {new Intl.NumberFormat("en-US", { style: "currency", currency: "DZD" }).format(orderItems.reduce((sum, item) => sum + (getVariantCost(item.product_variant_id) * item.quantity), 0))}
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
                              onChange={e => {
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
                            <Input type="number" min={0} {...field} className="max-w-[120px] text-right" />
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
                        let productsTotal = orderItems.reduce((sum, item) => sum + (getVariantCost(item.product_variant_id) * item.quantity), 0);
                        let deliveryFee = 0;
                        if (watch('shipping_provider') === 'yalidine' && yalidinePricing) {
                          let communePricing = null;
                          if (watch('delivery_type') === 'home') {
                            communePricing = (watch('selected_commune') && yalidinePricing.per_commune)
                              ? yalidinePricing.per_commune[String(watch('selected_commune'))]
                              : undefined;
                            deliveryFee = communePricing?.express_home ?? 0;
                          } else if (watch('delivery_type') === 'stopdesk' && yalidineCenters && watch('selected_center')) {
                            const center = (yalidineCenters.data || []).find(c => String(c.center_id) === watch('selected_center'));
                            if (center && center.commune_id && yalidinePricing.per_commune) {
                              communePricing = yalidinePricing.per_commune[String(center.commune_id)];
                              deliveryFee = communePricing?.express_desk ?? 0;
                            }
                          }
                        }
                        const total = productsTotal + deliveryFee - (discount || 0);
                        return new Intl.NumberFormat("en-US", { style: "currency", currency: "DZD" }).format(Math.max(total, 0));
                      })()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            {errors && <div className="text-red-500 text-sm">{errors.root?.message}</div>}
            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Creating..." : "Create Order"}
              </Button>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
      <ClientStatusDialog
        open={clientStatusDialogOpen}
        setOpen={setClientStatusDialogOpen}
        orderID={wooOrder.id}
      />
    </Dialog>
  );
}

export default CreateOrderDialog;
