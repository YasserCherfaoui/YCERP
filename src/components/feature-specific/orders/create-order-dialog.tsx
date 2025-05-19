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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { OrderStatus } from "@/models/data/order.model";
import { WooOrder } from "@/models/data/woo-order.model";
import { getCompanyInventory } from "@/services/inventory-service";
import { createOrder } from "@/services/order-service";
import { cities } from "@/utils/algeria-cities";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useSelector } from "react-redux";
import { ClientStatusDialog } from "./client-status-dialog";

function CreateOrderDialog({ wooOrder, open, setOpen }: { wooOrder: WooOrder; open: boolean; setOpen: (open: boolean) => void }) {
  const company = useSelector((state: RootState) => state.company.company);
  if (!company) {
    return null;
  }
  const [shipping, setShipping] = useState({
    full_name: wooOrder.billing_name || wooOrder.shipping_name || "",
    phone_number: wooOrder.customer_phone || "",
    address: wooOrder.shipping_address_1 || wooOrder.billing_address_1 || "",
    city: wooOrder.billing_city || "",
    state: wooOrder.shipping_city || "",
    delivery_id: undefined as number | undefined,
  });
  const [status, setStatus] = useState("unconfirmed");
  const [discount, setDiscount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [clientStatusDialogOpen, setClientStatusDialogOpen] = useState(false);

  // Fetch all product variants for the company
  const { data: inventoryData } = useQuery({
    queryKey: ["inventory", company.ID],
    queryFn: () => getCompanyInventory(company.ID),
    enabled: Boolean(company && company.ID),
  });
  const allVariants = (inventoryData?.data?.items
    .map((item) => item.product_variant)
    .filter((v): v is NonNullable<typeof v> => Boolean(v))) || [];

  // Map product_variant_id to cost for quick lookup
  const variantCostMap: Record<number, number> = {};
  if (inventoryData?.data?.items) {
    for (const item of inventoryData.data.items) {
      if (item.product_variant_id && typeof item.product?.price === 'number') {
        variantCostMap[item.product_variant_id] = item.product.price;
      }
    }
  }

  // Helper to find variant by SKU
  function findVariantBySku(sku: string) {
    return allVariants.find((variant) => variant && variant.qr_code === sku);
  }

  const [orderItems, setOrderItems] = useState(() =>
    wooOrder.line_items.map(item => {
      const matchedVariant = findVariantBySku(item.sku);
      return {
        product_id: matchedVariant?.product_id ?? item.product_id,
        product_variant_id: matchedVariant?.ID ?? item.variation_id,
        discount: 0,
        quantity: item.quantity,
        price: item.price || 0,
      };
    })
  );

  const mutation = useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      setOpen(false);
    },
    onError: (err: any) => {
      setError(err.message || "Failed to create order");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const orderData = {
      company_id: company.ID,
      shipping,
      order_items: orderItems.map(({ price, ...item }) => item),
      total: Number(wooOrder.total),
      status,
      discount,
      taken_by_id: wooOrder.taken_by_id || undefined,
    };
    mutation.mutate(orderData);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-4xl w-full">
        <DialogHeader>
          <DialogTitle>Create Order from WooOrder #{wooOrder.number}</DialogTitle>
          <DialogDescription>
            Fill or adjust the details below to create a new Order.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end">
          <Button type="button" variant="secondary" onClick={() => setClientStatusDialogOpen(true)}>
            Set Client Status
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label>Full Name</Label>
                <Input
                  value={shipping.full_name}
                  onChange={e => setShipping(s => ({ ...s, full_name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label>Phone Number</Label>
                <Input
                  value={shipping.phone_number}
                  onChange={e => setShipping(s => ({ ...s, phone_number: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label>Address</Label>
                <Input
                  value={shipping.address}
                  onChange={e => setShipping(s => ({ ...s, address: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label>City</Label>
                <Input
                  value={shipping.city}
                  onChange={e => setShipping(s => ({ ...s, city: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Combobox
                  items={cities.map(city => ({ value: city.key, label: city.label }))}
                  value={shipping.state}
                  onChange={(value: string) => setShipping(s => ({ ...s, state: value }))}
                  placeholder="Select a wilaya"
                  label="State"
                  searchPlaceholder="Search wilaya..."
                />
              </div>
              <div>
                <Label>Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(OrderStatus).map((statusValue) => (
                      <SelectItem key={statusValue} value={statusValue}>
                        {statusValue.charAt(0).toUpperCase() + statusValue.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Discount</Label>
                <Input
                  type="number"
                  value={discount}
                  onChange={e => setDiscount(Number(e.target.value))}
                  min={0}
                />
              </div>
            </div>
            <div className="space-y-4">
              <Label>Order Items</Label>
              <div className="overflow-x-auto">
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
                            onChange={variantId => {
                              const selectedVariant = allVariants.find(v => v.ID === variantId);
                              const variantCost = variantId ? variantCostMap[variantId] : undefined;
                              setOrderItems(items => items.map((it, i) =>
                                i === idx
                                  ? {
                                      ...it,
                                      product_variant_id: variantId ?? 0,
                                      product_id: selectedVariant?.product_id ?? 0,
                                      price: variantCost !== undefined ? variantCost * it.quantity : it.price
                                    }
                                  : it
                              ));
                            }}
                            key={`variant-combobox-${idx}`}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min={1}
                            value={item.quantity}
                            onChange={e => {
                              const quantity = Number(e.target.value);
                              const cost = item.product_variant_id ? variantCostMap[item.product_variant_id] : undefined;
                              setOrderItems(items => items.map((it, i) =>
                                i === idx
                                  ? {
                                      ...it,
                                      quantity,
                                      price: cost !== undefined ? cost * quantity : it.price
                                    }
                                  : it
                              ));
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          {(() => {
                            const variantCost = item.product_variant_id ? variantCostMap[item.product_variant_id] : undefined;
                            return variantCost !== undefined ? variantCost * item.quantity : item.price;
                          })()}
                        </TableCell>
                        <TableCell>
                          <Button type="button" variant="destructive" size="sm" onClick={() => setOrderItems(items => items.filter((_, i) => i !== idx))}>
                            Remove
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-2"
                  onClick={() => setOrderItems(items => [...items, { product_id: 0, product_variant_id: 0, discount: 0, quantity: 1, price: 0 }])}
                >
                  Add Item
                </Button>
              </div>
            </div>
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <DialogFooter>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Creating..." : "Create Order"}
            </Button>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
      <ClientStatusDialog open={clientStatusDialogOpen} setOpen={setClientStatusDialogOpen} orderID={wooOrder.id} />
    </Dialog>
  );
}

export default CreateOrderDialog; 