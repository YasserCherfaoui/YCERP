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
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
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
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { WooOrder } from "@/models/data/woo-order.model";
import { getDeliveryCompanies } from "@/services/delivery-service";
import { getCompanyInventory } from "@/services/inventory-service";
import {
  getYalidineCenters,
  getYalidineCommunes,
  getYalidinePricing,
} from "@/services/order-service";
import { updateWooCommerceOrder } from "@/services/woocommerce-service";
import { algerCities, cities } from "@/utils/algeria-cities";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { ClientStatusDialog } from "./client-status-dialog";

// --- Types matching backend Go schemas ---
export interface UpdateWooOrderItemSchema {
  id?: number;
  product_id?: number;
  product_variant_id?: number;
  quantity?: number;
}

export interface UpdateWooShippingSchema {
  first_delivery_cost?: number;
  second_delivery_cost?: number;
  shipping_provider?: string;
  delivery_type?: string;
  selected_commune?: string;
  selected_center?: string;
  delivery_company_id?: number;
  state_id?: string;
  wilaya_name?: string;
  commune_name?: string;
  comments?: string;
  employee_id?: number;
  expected_delivery_date?: string;
}

export interface UpdateWooOrderSchema {
  id: number;
  woo_id?: number;
  number?: string;
  status?: string;
  total?: string;
  currency?: string;
  customer_id?: number;
  customer_email?: string;
  customer_phone?: string;
  customer_phone_2?: string;
  billing_name?: string;
  billing_address_1?: string;
  billing_city?: string;
  shipping_name?: string;
  shipping_address_1?: string;
  shipping_city?: string;
  payment_method?: string;
  payment_method_title?: string;
  order_key?: string;
  order_status?: string;
  tracking_number?: string;
  amount?: number;
  final_price?: number;
  comments?: string;
  company_id?: number;
  discount?: number;
  taken_by_id?: number;
  order_items?: UpdateWooOrderItemSchema[];
  shipping?: UpdateWooShippingSchema;
}

// --- Utility: Map form state to API payload ---
function mapFormToApiPayload(form: any): UpdateWooOrderSchema {
  // Helper to only include fields that are not undefined/null/empty string
  const clean = (obj: any) => {
    if (!obj) return undefined;
    const out: any = {};
    Object.entries(obj).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") out[k] = v;
    });
    return Object.keys(out).length ? out : undefined;
  };

  // Map order_items
  let order_items: UpdateWooOrderItemSchema[] | undefined = undefined;
  if (Array.isArray(form.order_items)) {
    order_items = form.order_items
      .map((item: any) =>
        clean({
          id: item.id,
          product_id: item.product_id,
          product_variant_id: item.product_variant_id,
          quantity: item.quantity,
        })
      )
      .filter(Boolean);
  }

  // Map shipping
  let shipping: UpdateWooShippingSchema | undefined = undefined;
  if (form.shipping || form.first_delivery_cost || form.second_delivery_cost) {
    shipping = clean({
      first_delivery_cost: form.first_delivery_cost,
      second_delivery_cost: form.second_delivery_cost,
      shipping_provider: form.shipping_provider,
      delivery_type: form.delivery_type,
      selected_commune: form.selected_commune,
      selected_center: form.selected_center,
      delivery_company_id: form.shipping?.delivery_id,
      state_id: form.shipping?.state,
      wilaya_name: form.shipping?.wilaya,
      commune_name: form.shipping?.commune,
      comments: form.shipping?.comments,
    });
  }

  // Main order
  const payload: UpdateWooOrderSchema = {
    id: form.woo_order_id,
    company_id: form.company_id,
    discount: form.discount,
    taken_by_id: form.taken_by_id,
    total: form.total !== undefined ? String(form.total) : undefined,
    order_items,
    shipping,
    // Add more fields as needed from form if you want to support them
    customer_phone: form.customer_phone,
    customer_phone_2: form.customer_phone_2,
    customer_email: form.customer_email,
    customer_id: form.customer_id,
    billing_name: form.billing_name,
    billing_address_1: form.billing_address_1,
    billing_city: form.billing_city,
    shipping_name: form.shipping_name,
    shipping_address_1: form.shipping_address_1,
    shipping_city: form.shipping_city,
    payment_method: form.payment_method,
    payment_method_title: form.payment_method_title,
    order_key: form.order_key,
    order_status: form.order_status,
    tracking_number: form.tracking_number,
    amount: form.amount,
    final_price: form.final_price,
    comments: form.comments,
  };
  return clean(payload) as UpdateWooOrderSchema;
}

// --- Types ---
interface UpdateOrderDialogProps {
  order: WooOrder;
  open: boolean;
  setOpen: (open: boolean) => void;
  ordersQueryKey?: any[];
}

// --- Custom Hooks for Data Fetching ---
function useCompanyInventory(companyId: number) {
  return useQuery({
    queryKey: ["inventory", companyId],
    queryFn: () => getCompanyInventory(companyId),
    enabled: Boolean(companyId),
  });
}

function useDeliveryCompanies(enabled: boolean) {
  return useQuery({
    queryKey: ["delivery-companies"],
    queryFn: getDeliveryCompanies,
    enabled,
    select: (res) => res.data,
  });
}

function useYalidineData(
  state: string | number,
  deliveryType: string,
  shippingProvider: string,
  open: boolean
) {
  const yalidinePricing = useQuery({
    queryKey: ["yalidine-pricing", state, deliveryType],
    queryFn: () => getYalidinePricing(16, Number(state) ?? 16),
    select: (res) => res.data,
    enabled: shippingProvider === "yalidine" && Boolean(state) && open,
  });
  const yalidineCenters = useQuery({
    queryKey: ["yalidine-centers", state],
    queryFn: () => getYalidineCenters(Number(state)),
    select: (res) => res.data,
    enabled:
      shippingProvider === "yalidine" &&
      deliveryType === "stopdesk" &&
      Boolean(state) &&
      open,
  });
  const yalidineCommunes = useQuery({
    queryKey: ["yalidine-communes", state],
    queryFn: () => getYalidineCommunes(Number(state)),
    select: (res) => res.data?.data ?? [],
    enabled:
      shippingProvider === "yalidine" &&
      deliveryType === "home" &&
      Boolean(state) &&
      open,
  });
  return { yalidinePricing, yalidineCenters, yalidineCommunes };
}

// --- Main Dialog Component ---
export default function UpdateOrderDialog({
  order,
  open,
  setOpen,
  ordersQueryKey,
}: UpdateOrderDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  let company = useSelector((state: RootState) => state.company.company);
  const { pathname } = useLocation();
  if (pathname.includes("moderator")) {
    company = useSelector((state: RootState) => state.user.company);
  } 
  const companyId = Number(company?.ID);
  if (!companyId) return null;

  // Add state for client status dialog
  const [clientStatusDialogOpen, setClientStatusDialogOpen] = useState(false);

  // Find matched wilaya
  const matchedWilaya = cities.find(
    (c) =>
      c.key === order.woo_shipping?.wilaya_name ||
      c.key === order.billing_city ||
      c.key === order.shipping_city
  );

  // --- Form Setup ---
  const methods = useForm<any>({
    defaultValues: {
      company_id: companyId,
      woo_order_id: order.id,
      shipping: {
        full_name: order.billing_name,
        phone_number: order.customer_phone,
        address: order.billing_address_1,
        city: order.billing_city,
        state: matchedWilaya?.key,
        wilaya: order.woo_shipping?.wilaya_name,
        commune: order.woo_shipping?.commune_name,
        delivery_id: order.woo_shipping?.delivery_company_id,
      },
      customer_phone: order.customer_phone,
      customer_phone_2: order.customer_phone_2,
      order_items: order.confirmed_order_items || [],
      total: Number(order.total),
      discount: (order as any).discount || 0,
      taken_by_id: order.taken_by_id ?? undefined,
      shipping_provider: order.woo_shipping?.shipping_provider || "yalidine",
      delivery_type: order.woo_shipping?.delivery_type || "home",
      selected_commune: order.woo_shipping?.selected_commune || "",
      selected_center: order.woo_shipping?.selected_center || "",
      first_delivery_cost: order.woo_shipping?.first_delivery_cost || 0,
      second_delivery_cost: order.woo_shipping?.second_delivery_cost || 0,
    },
  });
  const {
    setValue,
    watch,
    reset,
    handleSubmit,
    formState: { errors },
  } = methods;

  // --- Data Fetching ---
  const { data: inventoryData } = useCompanyInventory(companyId);
  const allVariants: any[] =
    inventoryData?.data?.items
      ?.map((item: any) => item.product_variant)
      .filter(Boolean) || [];

  // Helper to get price from inventoryData
  const getVariantCost = (variantId: number) => {
    const item = inventoryData?.data?.items?.find(
      (i: any) => i.product_variant_id === variantId
    );
    return item?.product?.price || 0;
  };

  const {
    data: deliveryCompaniesData,
    isLoading: deliveryCompaniesLoading,
    isError: deliveryCompaniesError,
  } = useDeliveryCompanies(
    watch("shipping_provider") === "my_companies" && open
  );
  const { yalidinePricing, yalidineCenters, yalidineCommunes } =
    useYalidineData(
      watch("shipping.state"),
      watch("delivery_type"),
      watch("shipping_provider"),
      open
    );

  // --- Effects ---
  useEffect(() => {
    setValue("company_id", companyId);
  }, [companyId, setValue]);

  useEffect(() => {
    if (open) {
      reset({
        ...methods.getValues(),
        company_id: companyId,
        woo_order_id: order.id,
        shipping: {
          full_name: order.billing_name,
          phone_number: order.customer_phone,
          address: order.billing_address_1,
          city: order.billing_city,
          state: matchedWilaya?.key,
          wilaya: order.woo_shipping?.wilaya_name,
          commune: order.woo_shipping?.commune_name,
          delivery_id: order.woo_shipping?.delivery_company_id,
        },
        order_items: order.confirmed_order_items || order.line_items || [],
        total: Number(order.total),
        discount: (order as any).discount || 0,
        taken_by_id: order.taken_by_id ?? undefined,
        shipping_provider: order.woo_shipping?.shipping_provider || "yalidine",
        delivery_type: order.woo_shipping?.delivery_type || "home",
        selected_commune: order.woo_shipping?.selected_commune || "",
        selected_center: order.woo_shipping?.selected_center || "",
        first_delivery_cost: order.woo_shipping?.first_delivery_cost || 0,
        second_delivery_cost: order.woo_shipping?.second_delivery_cost || 0,
      });
    }
  }, [open, order, companyId, reset, matchedWilaya]);

  // --- Mutation ---
  const { mutate: updateOrder, isPending } = useMutation<any, any, any>({
    mutationFn: updateWooCommerceOrder,
    onSuccess: () => {
      toast({
        title: "Order updated",
        description: "Order updated successfully",
      });
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ordersQueryKey || ["orders"] });
    },
    onError: (err: any) => {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  // --- Submit Handler ---
  const onSubmit = (data: any) => {
    const apiPayload = mapFormToApiPayload(data);
    updateOrder(apiPayload as any);
    console.log(apiPayload);
  };

  // --- Render ---
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-[100rem] w-full overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Update Order #{order.number}</DialogTitle>
          <DialogDescription>Update the order details below.</DialogDescription>
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
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex flex-col gap-6 xl:flex-row xl:gap-4">
              <ShippingSection
                deliveryCompaniesData={deliveryCompaniesData}
                deliveryCompaniesLoading={deliveryCompaniesLoading}
                deliveryCompaniesError={deliveryCompaniesError}
                yalidinePricing={yalidinePricing.data}
                yalidineCenters={yalidineCenters.data}
                yalidineCommunes={yalidineCommunes.data}
              />
              <CustomerInfoSection />
              <OrderItemsSection
                allVariants={allVariants}
                getVariantCost={getVariantCost}
                inventoryData={inventoryData}
              />
            </div>
            <SummarySection
              allVariants={allVariants}
              getVariantCost={getVariantCost}
            />
            {errors && (
              <div className="text-red-500 text-sm">{errors.root?.message}</div>
            )}
            <input type="hidden" {...methods.register("company_id")} />
            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Updating..." : "Update Order"}
              </Button>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
      <ClientStatusDialog
        open={clientStatusDialogOpen}
        setOpen={setClientStatusDialogOpen}
        orderID={order.id}
      />
    </Dialog>
  );
}

// --- Subcomponents ---
// ShippingSection, CustomerInfoSection, OrderItemsSection, SummarySection
// For brevity, these are stubs. You can expand them as needed.

function ShippingSection({
  deliveryCompaniesData,
  deliveryCompaniesLoading,
  deliveryCompaniesError,
  yalidineCenters,
  yalidineCommunes,
}: any) {
  const { control, watch, setValue } = useFormContext();
  const shippingProvider = watch("shipping_provider");
  const deliveryType = watch("delivery_type");

  return (
    <section className="border rounded p-4 flex flex-col gap-4 min-w-[320px] xl:w-1/3">
      <h3 className="font-semibold mb-2">Shipping</h3>
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
                <RadioGroupItem value="my_companies" id="my_companies" />
                <FormLabel htmlFor="my_companies">
                  My Delivery Companies
                </FormLabel>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      {shippingProvider === "yalidine" && (
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
                  <FormLabel htmlFor="stopdesk">Stop Desk</FormLabel>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
      {shippingProvider === "yalidine" && deliveryType === "home" && (
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
                        (c: any) => String(c.id) === val
                      )?.name || "";
                    setValue("shipping.commune", communeName);
                  }}
                >
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue placeholder="Select a commune" />
                  </SelectTrigger>
                  <SelectContent>
                    {(yalidineCommunes || [])
                      .sort((a: any, b: any) => a.name.localeCompare(b.name))
                      .filter((c: any) => c.is_deliverable)
                      .map((commune: any) => (
                        <SelectItem key={commune.id} value={String(commune.id)}>
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
      {shippingProvider === "yalidine" && deliveryType === "stopdesk" && (
        <FormField
          control={control}
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
                    {(yalidineCenters?.data || []).map((center: any) => (
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
      {shippingProvider === "my_companies" && (
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
                        (deliveryCompaniesData || []).map((company: any) => (
                          <SelectItem
                            key={company.ID}
                            value={String(company.ID)}
                          >
                            {company.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
                      {algerCities.map((city: any) => (
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
    </section>
  );
}

function CustomerInfoSection() {
  const { control, setValue, watch } = useFormContext();
  const shipping = watch("shipping");
  return (
    <section className="space-y-4 border rounded p-4 min-w-[320px] xl:w-1/3">
      <FormField
        control={control}
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
        control={control}
        name="customer_phone"
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
        control={control}
        name="customer_phone_2"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Phone Number 2</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
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
            setValue("shipping.state", value);
            const wilayaName = cities.find((c) => c.key === value)?.label || "";
            setValue("shipping.wilaya", wilayaName);
          }}
          placeholder="Select a wilaya"
          label="State"
          searchPlaceholder="Search wilaya..."
        />
      </div>
      <FormField
        control={control}
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
    </section>
  );
}

function OrderItemsSection({
  allVariants,
  getVariantCost,
  inventoryData,
}: {
  allVariants: any[];
  getVariantCost: (variantId: number) => number;
  inventoryData: any;
}) {
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();
  const orderItems = watch("order_items") || [];

  return (
    <section className="border rounded p-4 flex-1 min-w-[340px] xl:w-1/3 flex flex-col">
      <div className="mb-2 font-semibold">Order Items</div>
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
              {orderItems.map((item: any, idx: number) => {
                const inventoryItem = inventoryData?.data?.items?.find(
                  (i: any) => i.product_variant_id === item.product_variant_id
                );
                return (
                  <TableRow key={idx}>
                    <TableCell className="min-w-[200px]">
                      <ProductVariantCombobox
                        variants={allVariants}
                        value={item.product_variant_id}
                        onChange={(variantId: number | undefined) => {
                          const selectedVariant = allVariants.find(
                            (v: any) => v.ID === variantId
                          );
                          setValue(
                            `order_items.${idx}.product_variant_id`,
                            variantId ?? 0
                          );
                          setValue(
                            `order_items.${idx}.product_id`,
                            selectedVariant?.product_id ?? 0
                          );
                        }}
                        key={`variant-combobox-${idx}`}
                        error={
                          Array.isArray(errors.order_items) &&
                          errors.order_items[idx]?.product_variant_id
                            ? errors.order_items[idx]?.product_variant_id
                                ?.message
                            : undefined
                        }
                        extraText={
                          inventoryItem
                            ? inventoryItem.quantity.toString()
                            : undefined
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) =>
                          setValue(
                            `order_items.${idx}.quantity`,
                            Number(e.target.value)
                          )
                        }
                      />
                    </TableCell>
                    <TableCell>
                      {getVariantCost(item.product_variant_id) *
                        (item.quantity || 1)}
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setValue(
                            "order_items",
                            orderItems.filter((_: any, i: number) => i !== idx)
                          );
                        }}
                      >
                        Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        <Button
          type="button"
          variant="outline"
          className="mt-2"
          onClick={() =>
            setValue("order_items", [
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
    </section>
  );
}

function SummarySection({
  getVariantCost,
}: {
  allVariants: any[];
  getVariantCost: (variantId: number) => number;
}) {
  const { control, watch, setValue } = useFormContext();
  const orderItems = watch("order_items") || [];
  const discount = watch("discount") || 0;
  const secondDeliveryCost = watch("second_delivery_cost") || 0;

  const productsTotal = orderItems.reduce(
    (sum: number, item: any) =>
      sum + getVariantCost(item.product_variant_id) * (item.quantity || 1),
    0
  );
  const total = productsTotal + secondDeliveryCost - discount;

  useEffect(() => {
    setValue("total", total);
  }, [productsTotal, secondDeliveryCost, discount, total, setValue]);

  return (
    <section className="mt-4 p-4 bg-muted/40 rounded flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <span className="font-semibold">Products Total</span>
        <span className="font-semibold">
          {new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "DZD",
          }).format(productsTotal)}
        </span>
      </div>
      <div className="flex justify-between items-center">
        <span>Delivery Fee</span>
        <span>
          {new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "DZD",
          }).format(secondDeliveryCost)}
        </span>
      </div>
      <div className="flex justify-between items-center">
        <span>Discount</span>
        <FormField
          control={control}
          name="discount"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
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
          {new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "DZD",
          }).format(Math.max(total, 0))}
        </span>
      </div>
     
    </section>
  );
}
