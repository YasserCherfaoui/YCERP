import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Combobox } from "@/components/ui/combobox-standalone";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { Franchise } from "@/models/data/franchise.model";
import {
  FranchiseVariantAvailability,
  getFranchiseVariantAvailability,
} from "@/services/franchise-service";
import { getYalidineWilayas } from "@/services/order-service";
import { useQueries, useQuery } from "@tanstack/react-query";
import { CheckCircle2, PackageOpen, Store, XCircle } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { CreateOrderSchema } from "@/schemas/order";

type OrderLineRequirement = {
  product_variant_id: number;
  quantity: number;
  label?: string;
};

type OrderVariantRequirement = {
  variantId: number;
  required: number;
  label: string;
};

type FranchiseItemStock = {
  variantId: number;
  label: string;
  required: number;
  available: number;
};

type FranchiseAvailabilityRow = {
  franchise_id: number;
  franchise_name: string;
  canFulfillFullOrder: boolean;
  fulfillableOrders: number;
  items: FranchiseItemStock[];
};

type OrderItemAvailabilitySummary = {
  variantId: number;
  label: string;
  required: number;
  maxAvailable: number;
  locationsWithStock: number;
};

type Props = {
  form: UseFormReturn<CreateOrderSchema>;
  companyId: number;
  franchises: Franchise[];
  open: boolean;
  lineItems: OrderLineRequirement[];
};

function aggregateOrderVariants(
  lineItems: OrderLineRequirement[]
): OrderVariantRequirement[] {
  const byVariant = new Map<number, OrderVariantRequirement>();
  for (const item of lineItems) {
    if (item.product_variant_id <= 0 || item.quantity <= 0) {
      continue;
    }
    const existing = byVariant.get(item.product_variant_id);
    if (existing) {
      existing.required += item.quantity;
      continue;
    }
    byVariant.set(item.product_variant_id, {
      variantId: item.product_variant_id,
      required: item.quantity,
      label: item.label?.trim() || `Variant #${item.product_variant_id}`,
    });
  }
  return [...byVariant.values()];
}

function buildOrderItemSummaries(
  orderVariants: OrderVariantRequirement[],
  availabilityByVariant: Map<number, FranchiseVariantAvailability[]>
): OrderItemAvailabilitySummary[] {
  return orderVariants.map(({ variantId, required, label }) => {
    const rows = availabilityByVariant.get(variantId) ?? [];
    const maxAvailable = rows.reduce(
      (max, row) => Math.max(max, row.quantity),
      0
    );
    const locationsWithStock = rows.filter((row) => row.quantity > 0).length;
    return {
      variantId,
      label,
      required,
      maxAvailable,
      locationsWithStock,
    };
  });
}

function buildFranchiseAvailabilityRows(
  orderVariants: OrderVariantRequirement[],
  availabilityByVariant: Map<number, FranchiseVariantAvailability[]>,
  franchiseDirectory: Franchise[]
): FranchiseAvailabilityRow[] {
  if (orderVariants.length === 0) {
    return [];
  }

  const franchiseNames = new Map<number, string>(
    franchiseDirectory.map((franchise) => [franchise.ID, franchise.name])
  );
  const stocksByFranchise = new Map<number, Map<number, number>>();

  for (const [variantId, rows] of availabilityByVariant) {
    for (const row of rows) {
      franchiseNames.set(row.franchise_id, row.franchise_name);
      if (!stocksByFranchise.has(row.franchise_id)) {
        stocksByFranchise.set(row.franchise_id, new Map());
      }
      stocksByFranchise.get(row.franchise_id)!.set(variantId, row.quantity);
    }
  }

  const results: FranchiseAvailabilityRow[] = [];
  for (const [franchiseId, stocks] of stocksByFranchise) {
    const items = orderVariants.map(({ variantId, required, label }) => ({
      variantId,
      label,
      required,
      available: stocks.get(variantId) ?? 0,
    }));

    let canFulfillFullOrder = true;
    let fulfillableOrders = Number.POSITIVE_INFINITY;
    for (const item of items) {
      if (item.available < item.required) {
        canFulfillFullOrder = false;
      }
      fulfillableOrders = Math.min(
        fulfillableOrders,
        Math.floor(item.available / item.required)
      );
    }

    results.push({
      franchise_id: franchiseId,
      franchise_name:
        franchiseNames.get(franchiseId) ?? `Franchise #${franchiseId}`,
      canFulfillFullOrder,
      fulfillableOrders: canFulfillFullOrder ? fulfillableOrders : 0,
      items,
    });
  }

  return results.sort(
    (left, right) =>
      Number(right.canFulfillFullOrder) - Number(left.canFulfillFullOrder) ||
      right.fulfillableOrders - left.fulfillableOrders ||
      left.franchise_name.localeCompare(right.franchise_name)
  );
}

export function FranchiseOrderFulfillmentSection({
  form,
  companyId,
  franchises,
  open,
  lineItems,
}: Props) {
  const { watch, setValue } = form;
  const shipFromFranchise = watch("ship_from_franchise");
  const franchiseId = watch("franchise_id");
  const shippingProvider = watch("shipping_provider");

  const orderVariants = useMemo(
    () => aggregateOrderVariants(lineItems),
    [lineItems]
  );
  const variantIds = useMemo(
    () => orderVariants.map((variant) => variant.variantId),
    [orderVariants]
  );
  const isMultiVariantOrder = variantIds.length > 1;

  const availabilityQueries = useQueries({
    queries: variantIds.map((variantId) => ({
      queryKey: ["franchise-variant-availability", companyId, variantId],
      queryFn: () => getFranchiseVariantAvailability(companyId, variantId),
      enabled: open && shipFromFranchise && variantId > 0,
      select: (res: Awaited<ReturnType<typeof getFranchiseVariantAvailability>>) =>
        res.data ?? [],
    })),
  });

  const availabilityLoading = availabilityQueries.some((query) => query.isLoading);
  const availabilityError = availabilityQueries.some((query) => query.isError);

  const availabilityByVariant = useMemo(() => {
    const map = new Map<number, FranchiseVariantAvailability[]>();
    if (availabilityQueries.some((query) => !query.isSuccess)) {
      return map;
    }
    variantIds.forEach((variantId, index) => {
      map.set(variantId, availabilityQueries[index].data ?? []);
    });
    return map;
  }, [availabilityQueries, variantIds]);

  const orderItemSummaries = useMemo(
    () => buildOrderItemSummaries(orderVariants, availabilityByVariant),
    [availabilityByVariant, orderVariants]
  );

  const availabilityRows = useMemo(
    () =>
      buildFranchiseAvailabilityRows(
        orderVariants,
        availabilityByVariant,
        franchises
      ),
    [availabilityByVariant, franchises, orderVariants]
  );

  const { data: wilayas } = useQuery({
    queryKey: ["yalidine-wilayas"],
    queryFn: getYalidineWilayas,
    enabled: open && shipFromFranchise && shippingProvider === "yalidine",
    select: (res) => res.data?.data ?? [],
  });

  const fulfillingLocations = availabilityRows.filter(
    (row) => row.canFulfillFullOrder
  ).length;
  const availabilitySummary = isMultiVariantOrder
    ? `${orderVariants.length} items · ${fulfillingLocations} location${fulfillingLocations === 1 ? "" : "s"} can fulfill`
    : `${orderItemSummaries[0]?.locationsWithStock ?? 0} location${
        (orderItemSummaries[0]?.locationsWithStock ?? 0) === 1 ? "" : "s"
      } · ${orderItemSummaries[0]?.maxAvailable ?? 0} unit${
        (orderItemSummaries[0]?.maxAvailable ?? 0) === 1 ? "" : "s"
      }`;

  const clearFranchiseSelection = () => {
    setValue("franchise_id", undefined);
    setValue("shipping.from_wilaya_id", undefined);
    setValue("shipping.from_wilaya_name", "");
  };

  const [availabilityAccordion, setAvailabilityAccordion] = useState<
    string | undefined
  >(undefined);

  const selectFranchise = useCallback(
    (id: number) => {
      setValue("franchise_id", id);
      const franchise = franchises.find((f) => f.ID === id);
      const stateKey = franchise?.state;
      const wilaya = wilayas?.find(
        (w) => String(w.id) === String(stateKey) || w.name === stateKey
      );
      if (wilaya) {
        setValue("shipping.from_wilaya_id", wilaya.id);
        setValue("shipping.from_wilaya_name", wilaya.name);
      }
    },
    [franchises, setValue, wilayas]
  );

  const handlePickFranchiseFromAvailability = useCallback(
    (id: number) => {
      selectFranchise(id);
      setAvailabilityAccordion(undefined);
    },
    [selectFranchise]
  );

  return (
    <div className="space-y-4 border rounded p-4">
      <div className="flex items-center justify-between gap-4">
        <Label htmlFor="ship-from-franchise">Ship from franchise</Label>
        <Switch
          id="ship-from-franchise"
          checked={Boolean(shipFromFranchise)}
          onCheckedChange={(checked) => {
            setValue("ship_from_franchise", checked);
            if (!checked) {
              clearFranchiseSelection();
            }
          }}
        />
      </div>

      {shipFromFranchise && variantIds.length > 0 && (
        <Accordion
          type="single"
          collapsible
          className="w-full rounded-md border bg-muted/20 px-3"
          value={availabilityAccordion}
          onValueChange={(value) =>
            setAvailabilityAccordion(value === "" ? undefined : value)
          }
        >
          <AccordionItem value="availability" className="border-b-0">
            <AccordionTrigger className="gap-3 py-3 hover:no-underline">
              <span className="text-left">Franchise availability</span>
              {!availabilityLoading && !availabilityError && (
                <Badge variant="secondary" className="font-normal">
                  {availabilitySummary}
                </Badge>
              )}
            </AccordionTrigger>
            <AccordionContent className="pb-3">
              <FranchiseAvailabilityList
                rows={availabilityRows}
                orderItemSummaries={orderItemSummaries}
                selectedFranchiseId={franchiseId}
                isLoading={availabilityLoading}
                isError={availabilityError}
                isMultiVariantOrder={isMultiVariantOrder}
                onSelectFranchise={handlePickFranchiseFromAvailability}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}

      {shipFromFranchise && (
        <div className="space-y-2">
          <Label>Franchise</Label>
          <Select
            value={franchiseId ? String(franchiseId) : undefined}
            onValueChange={(value) => selectFranchise(Number(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select franchise" />
            </SelectTrigger>
            <SelectContent>
              {franchises.map((franchise) => (
                <SelectItem key={franchise.ID} value={String(franchise.ID)}>
                  {franchise.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {shipFromFranchise && shippingProvider === "yalidine" && franchiseId && (
        <Combobox
          items={(wilayas ?? []).map((wilaya) => ({
            value: String(wilaya.id),
            label: wilaya.name,
          }))}
          value={
            watch("shipping.from_wilaya_id")
              ? String(watch("shipping.from_wilaya_id"))
              : ""
          }
          onChange={(value) => {
            const wilaya = wilayas?.find((w) => String(w.id) === value);
            setValue("shipping.from_wilaya_id", Number(value));
            setValue("shipping.from_wilaya_name", wilaya?.name ?? "");
          }}
          label="Delivery from wilaya"
          placeholder="Select origin wilaya"
          searchPlaceholder="Search wilaya..."
        />
      )}
    </div>
  );
}

function FranchiseAvailabilityList({
  rows,
  orderItemSummaries,
  selectedFranchiseId,
  isLoading,
  isError,
  isMultiVariantOrder,
  onSelectFranchise,
}: {
  rows: FranchiseAvailabilityRow[];
  orderItemSummaries: OrderItemAvailabilitySummary[];
  selectedFranchiseId?: number;
  isLoading: boolean;
  isError: boolean;
  isMultiVariantOrder: boolean;
  onSelectFranchise: (franchiseId: number) => void;
}) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center justify-between rounded-lg border bg-background px-3 py-2.5"
          >
            <div className="flex min-w-0 items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-6 w-16 rounded-md" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
        Could not load franchise availability. Try again in a moment.
      </div>
    );
  }

  if (orderItemSummaries.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed bg-background px-4 py-6 text-center">
        <PackageOpen className="h-5 w-5 text-muted-foreground" />
        <p className="text-sm font-medium">No order items selected</p>
        <p className="text-xs text-muted-foreground">
          Add product variants to check franchise stock.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-background px-3 py-2.5">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Stock by item
        </p>
        <div className="space-y-2">
          {orderItemSummaries.map((item) => (
            <div
              key={item.variantId}
              className="flex items-start justify-between gap-3 text-sm"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground">
                  Need {item.required} unit{item.required === 1 ? "" : "s"}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="font-medium tabular-nums">
                  {item.maxAvailable} unit{item.maxAvailable === 1 ? "" : "s"}
                </p>
                <p className="text-xs text-muted-foreground">
                  max · {item.locationsWithStock} location
                  {item.locationsWithStock === 1 ? "" : "s"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed bg-background px-4 py-6 text-center">
          <PackageOpen className="h-5 w-5 text-muted-foreground" />
          <p className="text-sm font-medium">No franchise stock</p>
          <p className="text-xs text-muted-foreground">
            {isMultiVariantOrder
              ? "No franchise location currently has stock for these items."
              : "This variant is not available at any franchise location."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="px-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            By location
          </div>
          <div className="space-y-2">
            {rows.map((row) => {
              const isSelected = selectedFranchiseId === row.franchise_id;

              return (
                <button
                  key={row.franchise_id}
                  type="button"
                  onClick={() => onSelectFranchise(row.franchise_id)}
                  className={cn(
                    "flex w-full flex-col gap-2 rounded-lg border bg-background px-3 py-2.5 text-left transition-colors",
                    "hover:bg-accent/40 hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    isSelected &&
                      "border-primary/40 bg-primary/5 ring-1 ring-primary/20"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
                        <Store className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {row.franchise_name}
                        </p>
                        {isSelected && (
                          <p className="text-xs text-primary">Selected franchise</p>
                        )}
                      </div>
                    </div>
                    {isMultiVariantOrder && (
                      <Badge
                        variant="outline"
                        className={cn(
                          "pointer-events-none shrink-0 gap-1 tabular-nums",
                          row.canFulfillFullOrder
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "text-muted-foreground"
                        )}
                      >
                        {row.canFulfillFullOrder ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : (
                          <XCircle className="h-3 w-3" />
                        )}
                        {row.canFulfillFullOrder
                          ? `${row.fulfillableOrders} full order${row.fulfillableOrders === 1 ? "" : "s"}`
                          : "Incomplete"}
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-1.5 border-t border-border/60 pt-2">
                    {row.items.map((item) => {
                      const hasEnough = item.available >= item.required;
                      return (
                        <div
                          key={item.variantId}
                          className="flex items-center justify-between gap-3 text-xs"
                        >
                          <span className="min-w-0 truncate text-muted-foreground">
                            {item.label}
                          </span>
                          <span
                            className={cn(
                              "shrink-0 tabular-nums font-medium",
                              hasEnough
                                ? "text-emerald-700"
                                : "text-destructive"
                            )}
                          >
                            {item.available} / {item.required}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
