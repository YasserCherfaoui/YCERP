import AppBarBackButton from "@/components/common/app-bar-back-button";
import { ProductVariantCombobox } from "@/components/feature-specific/company-products/product-variant-combobox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Franchise } from "@/models/data/franchise.model";
import { ProductVariant } from "@/models/data/product.model";
import {
  CreateFranchiseWooRefundRequest,
  FranchiseWooRefundExchangeItemInput,
  FranchiseWooRefundPreview,
  WooOrderSearchHit,
  WooRefundResolutionType,
} from "@/models/data/franchise-woo-refund.model";
import { getFranchiseInventory, getMyCompanyFranchises } from "@/services/franchise-service";
import {
  WooRefundApiScope,
  createFranchiseWooRefund,
  getWooRefundPreview,
  searchWooOrdersForRefund,
} from "@/services/woo-refund-service";
import { InventoryItemWithCost } from "@/models/responses/inventory-with-cost.model";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2, Plus, RotateCcw, Search, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  buildVariantUnitPriceMap,
  computeExchangeCashDelta,
  computeExchangeLinesTotal,
  computeReturnedLinesTotal,
  ReturnedLinePricing,
} from "./woo-refund-exchange-pricing";

const formatDZD = (n: number) =>
  new Intl.NumberFormat("en-DZ", {
    style: "currency",
    currency: "DZD",
    maximumFractionDigits: 0,
  }).format(n);

export type WooRefundPageProps = {
  scope: WooRefundApiScope;
  companyId?: number;
  defaultFranchiseId?: number;
  backLabel?: string;
  title?: string;
};

export default function WooRefundPage({
  scope,
  companyId,
  defaultFranchiseId,
  backLabel = "Back",
  title = "Web order refund",
}: WooRefundPageProps) {
  const { toast } = useToast();
  const [tracking, setTracking] = useState("");
  const [phone, setPhone] = useState("");
  const [searchEnabled, setSearchEnabled] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<WooOrderSearchHit | null>(null);
  const [preview, setPreview] = useState<FranchiseWooRefundPreview | null>(null);
  const [returnFranchiseId, setReturnFranchiseId] = useState<number | undefined>(
    defaultFranchiseId
  );
  const [resolution, setResolution] = useState<WooRefundResolutionType>("cash_refund");
  const [cashPaid, setCashPaid] = useState("");
  const [reason, setReason] = useState("");
  const [exchangePays, setExchangePays] = useState("0");
  const [exchangeReceives, setExchangeReceives] = useState("0");
  const [exchangeItems, setExchangeItems] = useState<
    FranchiseWooRefundExchangeItemInput[]
  >([]);

  const { data: franchisesData } = useQuery({
    queryKey: ["company-franchises", companyId],
    queryFn: () => getMyCompanyFranchises(companyId!),
    enabled: scope === "company" && !!companyId,
  });
  const franchises: Franchise[] = franchisesData?.data ?? [];

  const inventoryFranchiseId =
    scope === "franchise" ? defaultFranchiseId : returnFranchiseId;

  const { data: inventoryData } = useQuery({
    queryKey: ["woo-refund-inventory", inventoryFranchiseId],
    queryFn: () => getFranchiseInventory(inventoryFranchiseId!),
    enabled: !!inventoryFranchiseId && !!preview?.can_refund,
  });

  const inventoryRows: InventoryItemWithCost[] =
    inventoryData?.data?.items_with_cost ?? [];

  const variantUnitPrice = useMemo(
    () => buildVariantUnitPriceMap(inventoryRows),
    [inventoryRows]
  );

  const exchangeVariants: ProductVariant[] = useMemo(() => {
    const seen = new Set<number>();
    const out: ProductVariant[] = [];
    for (const it of inventoryRows) {
      const v = it.product_variant;
      if (v && v.ID > 0 && !seen.has(v.ID)) {
        seen.add(v.ID);
        out.push(v);
      }
    }
    return out;
  }, [inventoryRows]);

  const returnedLinePricing: ReturnedLinePricing[] = useMemo(() => {
    const items = selectedOrder?.confirmed_order_items ?? [];
    return items.map((line) => {
      const unitPrice = line.product?.price ?? 0;
      const qty = line.quantity ?? 0;
      const name = line.product?.name ?? "Product";
      const variant = line.product_variant;
      const label = variant
        ? `${name} · ${variant.color} ${variant.size}`
        : name;
      return {
        id: line.id,
        label,
        quantity: qty,
        unitPrice,
        lineTotal: unitPrice * qty,
      };
    });
  }, [selectedOrder]);

  const returnedLinesTotal = useMemo(
    () => computeReturnedLinesTotal(returnedLinePricing),
    [returnedLinePricing]
  );

  const exchangeLinesTotal = useMemo(
    () => computeExchangeLinesTotal(exchangeItems, variantUnitPrice),
    [exchangeItems, variantUnitPrice]
  );

  const exchangeCashDelta = useMemo(
    () => computeExchangeCashDelta(exchangeLinesTotal, returnedLinesTotal),
    [exchangeLinesTotal, returnedLinesTotal]
  );

  useEffect(() => {
    if (resolution !== "local_exchange") return;
    setExchangePays(String(exchangeCashDelta.customerPays));
    setExchangeReceives(String(exchangeCashDelta.customerReceives));
  }, [resolution, exchangeCashDelta]);

  const searchQuery = useQuery({
    queryKey: ["woo-refund-search", scope, tracking, phone, searchEnabled],
    queryFn: () =>
      searchWooOrdersForRefund(scope, {
        tracking_number: tracking,
        phone,
      }),
    enabled: searchEnabled && (!!tracking.trim() || !!phone.trim()),
  });

  const results = searchQuery.data?.data ?? [];

  const resetFlow = () => {
    setSelectedOrder(null);
    setPreview(null);
    setCashPaid("");
    setReason("");
    setExchangeItems([]);
    setExchangePays("0");
    setExchangeReceives("0");
    setResolution("cash_refund");
  };

  const handleSearch = () => {
    if (!tracking.trim() && !phone.trim()) {
      toast({
        title: "Enter a search term",
        description: "Use tracking number and/or customer phone.",
        variant: "destructive",
      });
      return;
    }
    setSearchEnabled(true);
    setSelectedOrder(null);
    setPreview(null);
  };

  const selectOrder = async (order: WooOrderSearchHit) => {
    setSelectedOrder(order);
    setPreview(null);
    try {
      const res = await getWooRefundPreview(scope, order.id);
      const p = res.data ?? null;
      setPreview(p);
      if (p?.can_refund && p.eligible_amount != null) {
        setCashPaid(String(p.eligible_amount));
      }
      if (scope === "company" && order.franchise_id) {
        setReturnFranchiseId(order.franchise_id);
      }
    } catch (e) {
      toast({
        title: "Error",
        description: e instanceof Error ? e.message : "Preview failed",
        variant: "destructive",
      });
    }
  };

  const submitMutation = useMutation({
    mutationFn: (body: CreateFranchiseWooRefundRequest) =>
      createFranchiseWooRefund(scope, body),
    onSuccess: () => {
      toast({ title: "Refund completed", description: "The return was recorded." });
      resetFlow();
      setSearchEnabled(false);
      setTracking("");
      setPhone("");
    },
    onError: (e: Error) => {
      toast({
        title: "Refund failed",
        description: e.message,
        variant: "destructive",
      });
    },
  });

  const canSubmit = useMemo(() => {
    if (!selectedOrder || !preview?.can_refund) return false;
    const fid =
      scope === "franchise" ? defaultFranchiseId : returnFranchiseId;
    if (!fid) return false;
    if (resolution === "cash_refund") {
      const cash = parseInt(cashPaid, 10);
      return !Number.isNaN(cash) && cash >= 0;
    }
    return (
      exchangeItems.length > 0 &&
      exchangeItems.every((x) => x.product_variant_id > 0 && x.quantity > 0)
    );
  }, [
    selectedOrder,
    preview,
    scope,
    defaultFranchiseId,
    returnFranchiseId,
    resolution,
    cashPaid,
    exchangeItems,
  ]);

  const handleSubmit = () => {
    if (!selectedOrder || !preview?.can_refund) return;
    const franchiseId =
      scope === "franchise" ? defaultFranchiseId! : returnFranchiseId!;
    const body: CreateFranchiseWooRefundRequest = {
      woo_order_id: selectedOrder.id,
      franchise_id: franchiseId,
      resolution_type: resolution,
      reason,
    };
    if (resolution === "cash_refund") {
      body.cash_paid_to_customer = parseInt(cashPaid, 10) || 0;
    } else {
      body.exchange_items = exchangeItems;
      body.exchange_customer_pays = parseInt(exchangePays, 10) || 0;
      body.exchange_customer_receives = parseInt(exchangeReceives, 10) || 0;
    }
    submitMutation.mutate(body);
  };

  const orderStatusBadge = (status: string) => {
    const s = status?.toLowerCase() ?? "";
    if (s === "delivered") return <Badge variant="default">Delivered</Badge>;
    if (s === "returned") return <Badge variant="secondary">Returned</Badge>;
    return <Badge variant="outline">{status}</Badge>;
  };

  return (
    <div className="p-4 space-y-4 max-w-4xl mx-auto">
      <div className="flex items-center gap-2">
        <AppBarBackButton destination={backLabel} />
        <div>
          <h1 className="text-lg font-semibold">{title}</h1>
          <p className="text-xs text-muted-foreground">
            Search delivered orders by tracking number or phone, then select one
            to refund.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Find order</CardTitle>
          <CardDescription>
            Search delivered orders only by tracking number or phone, then pick a
            match.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="tracking">Tracking number</Label>
              <Input
                id="tracking"
                placeholder="Yalidine tracking…"
                value={tracking}
                onChange={(e) => setTracking(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="phone">Customer phone</Label>
              <Input
                id="phone"
                placeholder="05…"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
          </div>
          <Button onClick={handleSearch} disabled={searchQuery.isFetching}>
            {searchQuery.isFetching ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Search className="mr-2 h-4 w-4" />
            )}
            Search
          </Button>

          {searchEnabled && !searchQuery.isFetching && results.length === 0 && (
            <p className="text-sm text-muted-foreground">No orders found.</p>
          )}

          {results.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Tracking</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((row) => (
                  <TableRow
                    key={row.id}
                    className={
                      selectedOrder?.id === row.id ? "bg-muted/50" : undefined
                    }
                  >
                    <TableCell className="font-medium">{row.number}</TableCell>
                    <TableCell className="text-xs">
                      {row.tracking_number || "—"}
                    </TableCell>
                    <TableCell className="text-xs">
                      {row.customer_phone || row.customer_phone_2 || "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {orderStatusBadge(row.order_status)}
                        {row.has_refund && (
                          <Badge variant="destructive">Refunded</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant={
                          selectedOrder?.id === row.id ? "default" : "outline"
                        }
                        disabled={row.has_refund}
                        onClick={() => selectOrder(row)}
                      >
                        Select
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {selectedOrder && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Process refund</CardTitle>
            <CardDescription>
              Order {selectedOrder.number}
              {selectedOrder.billing_name
                ? ` · ${selectedOrder.billing_name}`
                : ""}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!preview && (
              <p className="text-sm text-muted-foreground">Loading preview…</p>
            )}
            {preview && !preview.can_refund && (
              <p className="text-sm text-destructive">
                {preview.block_reason || "This order cannot be refunded."}
              </p>
            )}
            {preview?.can_refund && (
              <>
                <div className="rounded-md border p-3 text-sm space-y-1">
                  <p>
                    Eligible cash (product only):{" "}
                    <strong>{formatDZD(preview.eligible_amount)}</strong>
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Final price {formatDZD(preview.final_price)} − delivery{" "}
                    {formatDZD(preview.second_delivery_cost)}
                  </p>
                </div>

                {scope === "company" && (
                  <div className="space-y-1">
                    <Label>Return location (franchise)</Label>
                    <Select
                      value={returnFranchiseId?.toString() ?? ""}
                      onValueChange={(v) => setReturnFranchiseId(parseInt(v, 10))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select franchise where customer returned" />
                      </SelectTrigger>
                      <SelectContent>
                        {franchises.map((f) => (
                          <SelectItem key={f.ID} value={String(f.ID)}>
                            {f.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Resolution</Label>
                  <RadioGroup
                    value={resolution}
                    onValueChange={(v) =>
                      setResolution(v as WooRefundResolutionType)
                    }
                    className="flex flex-col gap-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="cash_refund" id="cash_refund" />
                      <Label htmlFor="cash_refund" className="font-normal">
                        Cash refund
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="local_exchange"
                        id="local_exchange"
                      />
                      <Label htmlFor="local_exchange" className="font-normal">
                        Local exchange
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {resolution === "cash_refund" && (
                  <div className="space-y-1">
                    <Label htmlFor="cash">Cash paid to customer (DZD)</Label>
                    <Input
                      id="cash"
                      type="number"
                      min={0}
                      max={preview.eligible_amount}
                      value={cashPaid}
                      onChange={(e) => setCashPaid(e.target.value)}
                    />
                  </div>
                )}

                {resolution === "local_exchange" && (
                  <div className="space-y-3">
                    <p className="text-xs text-muted-foreground">
                      Returned and exchange lines both use product retail price
                      (product.price). Customer pays or receives the difference.
                    </p>

                    {returnedLinePricing.length > 0 && (
                      <div className="rounded-md border overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Returned (from order)</TableHead>
                              <TableHead className="text-right w-16">Qty</TableHead>
                              <TableHead className="text-right w-24">Unit</TableHead>
                              <TableHead className="text-right w-28">Total</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {returnedLinePricing.map((line) => (
                              <TableRow key={line.id}>
                                <TableCell className="text-sm">{line.label}</TableCell>
                                <TableCell className="text-right text-sm">
                                  {line.quantity}
                                </TableCell>
                                <TableCell className="text-right text-sm">
                                  {formatDZD(line.unitPrice)}
                                </TableCell>
                                <TableCell className="text-right text-sm font-medium">
                                  {formatDZD(line.lineTotal)}
                                </TableCell>
                              </TableRow>
                            ))}
                            <TableRow className="bg-muted/40">
                              <TableCell colSpan={3} className="text-sm font-medium">
                                Returned value
                              </TableCell>
                              <TableCell className="text-right font-semibold">
                                {formatDZD(returnedLinesTotal)}
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    )}

                    {exchangeItems.map((item, idx) => {
                      const unit =
                        item.product_variant_id > 0
                          ? variantUnitPrice.get(item.product_variant_id) ?? 0
                          : 0;
                      const discount = item.discount ?? 0;
                      const lineTotal =
                        item.product_variant_id > 0
                          ? Math.max(0, unit - discount) * item.quantity
                          : 0;
                      return (
                      <div
                        key={idx}
                        className="flex flex-wrap items-end gap-2 border rounded p-2"
                      >
                        <div className="flex-1 min-w-[200px]">
                          <ProductVariantCombobox
                            variants={exchangeVariants}
                            value={
                              item.product_variant_id || undefined
                            }
                            onChange={(id) => {
                              const next = [...exchangeItems];
                              next[idx] = {
                                ...next[idx],
                                product_variant_id: id ?? 0,
                              };
                              setExchangeItems(next);
                            }}
                            extraText={unit > 0 ? formatDZD(unit) : ""}
                            variantSuffix={(id) => {
                              const p = variantUnitPrice.get(id) ?? 0;
                              return p > 0 ? formatDZD(p) : "";
                            }}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">
                            Qty
                          </Label>
                          <Input
                            type="number"
                            min={1}
                            className="w-20"
                            value={item.quantity}
                            onChange={(e) => {
                              const next = [...exchangeItems];
                              next[idx] = {
                                ...next[idx],
                                quantity:
                                  parseInt(e.target.value, 10) || 1,
                              };
                              setExchangeItems(next);
                            }}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">
                            Discount
                          </Label>
                          <Input
                            type="number"
                            min={0}
                            className="w-24"
                            value={discount}
                            onChange={(e) => {
                              const next = [...exchangeItems];
                              next[idx] = {
                                ...next[idx],
                                discount: parseFloat(e.target.value) || 0,
                              };
                              setExchangeItems(next);
                            }}
                          />
                        </div>
                        <div className="space-y-1 min-w-[100px]">
                          <Label className="text-xs text-muted-foreground">
                            Line total
                          </Label>
                          <p className="h-10 flex items-center text-sm font-medium tabular-nums">
                            {item.product_variant_id > 0
                              ? formatDZD(lineTotal)
                              : "—"}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="mb-0.5"
                          onClick={() =>
                            setExchangeItems(
                              exchangeItems.filter((_, i) => i !== idx)
                            )
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                    })}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={!inventoryFranchiseId}
                      onClick={() =>
                        setExchangeItems([
                          ...exchangeItems,
                          { product_variant_id: 0, quantity: 1, discount: 0 },
                        ])
                      }
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add exchange line
                    </Button>

                    <div className="rounded-md border bg-muted/30 p-3 text-sm space-y-1">
                      <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">
                          Exchange lines total
                        </span>
                        <span className="font-medium tabular-nums">
                          {formatDZD(exchangeLinesTotal)}
                        </span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">
                          Returned value
                        </span>
                        <span className="font-medium tabular-nums">
                          {formatDZD(returnedLinesTotal)}
                        </span>
                      </div>
                      <div className="flex justify-between gap-4 border-t pt-2 font-semibold">
                        <span>
                          {exchangeCashDelta.customerPays > 0
                            ? "Customer pays franchise"
                            : exchangeCashDelta.customerReceives > 0
                              ? "Customer receives from franchise"
                              : "No cash difference"}
                        </span>
                        <span className="tabular-nums">
                          {exchangeCashDelta.customerPays > 0
                            ? formatDZD(exchangeCashDelta.customerPays)
                            : exchangeCashDelta.customerReceives > 0
                              ? formatDZD(exchangeCashDelta.customerReceives)
                              : formatDZD(0)}
                        </span>
                      </div>
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2">
                      <div className="space-y-1">
                        <Label>Customer pays franchise</Label>
                        <Input
                          type="number"
                          min={0}
                          value={exchangePays}
                          onChange={(e) => setExchangePays(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>Customer receives from franchise</Label>
                        <Input
                          type="number"
                          min={0}
                          value={exchangeReceives}
                          onChange={(e) => setExchangeReceives(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <Label htmlFor="reason">Reason (optional)</Label>
                  <Textarea
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={2}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleSubmit}
                    disabled={!canSubmit || submitMutation.isPending}
                  >
                    {submitMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Submit refund
                  </Button>
                  <Button type="button" variant="outline" onClick={resetFlow}>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Clear
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
