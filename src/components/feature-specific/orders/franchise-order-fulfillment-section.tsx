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
import { useQuery } from "@tanstack/react-query";
import { PackageOpen, Store } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { CreateOrderSchema } from "@/schemas/order";

type Props = {
  form: UseFormReturn<CreateOrderSchema>;
  companyId: number;
  franchises: Franchise[];
  open: boolean;
  lineVariantIds: number[];
};

export function FranchiseOrderFulfillmentSection({
  form,
  companyId,
  franchises,
  open,
  lineVariantIds,
}: Props) {
  const { watch, setValue } = form;
  const shipFromFranchise = watch("ship_from_franchise");
  const franchiseId = watch("franchise_id");
  const shippingProvider = watch("shipping_provider");
  const selectedVariantId = lineVariantIds.find((id) => id > 0) ?? 0;

  const { data: availability, isLoading: availabilityLoading, isError: availabilityError } = useQuery({
    queryKey: ["franchise-variant-availability", companyId, selectedVariantId],
    queryFn: () => getFranchiseVariantAvailability(companyId, selectedVariantId),
    enabled: open && shipFromFranchise && selectedVariantId > 0,
    select: (res) => res.data ?? [],
  });

  const { data: wilayas } = useQuery({
    queryKey: ["yalidine-wilayas"],
    queryFn: getYalidineWilayas,
    enabled: open && shipFromFranchise && shippingProvider === "yalidine",
    select: (res) => res.data?.data ?? [],
  });

  const availabilityRows = useMemo(
    () =>
      [...(availability ?? [])].sort(
        (left, right) =>
          right.quantity - left.quantity ||
          left.franchise_name.localeCompare(right.franchise_name)
      ),
    [availability]
  );

  const stockedLocations = availabilityRows.filter((row) => row.quantity > 0).length;
  const totalAvailableUnits = availabilityRows.reduce(
    (sum, row) => sum + row.quantity,
    0
  );

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

      {shipFromFranchise && selectedVariantId > 0 && (
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
                  {stockedLocations} location{stockedLocations === 1 ? "" : "s"} ·{" "}
                  {totalAvailableUnits} unit{totalAvailableUnits === 1 ? "" : "s"}
                </Badge>
              )}
            </AccordionTrigger>
            <AccordionContent className="pb-3">
              <FranchiseAvailabilityList
                rows={availabilityRows}
                selectedFranchiseId={franchiseId}
                isLoading={availabilityLoading}
                isError={availabilityError}
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
  selectedFranchiseId,
  isLoading,
  isError,
  onSelectFranchise,
}: {
  rows: FranchiseVariantAvailability[];
  selectedFranchiseId?: number;
  isLoading: boolean;
  isError: boolean;
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

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed bg-background px-4 py-6 text-center">
        <PackageOpen className="h-5 w-5 text-muted-foreground" />
        <p className="text-sm font-medium">No franchise stock</p>
        <p className="text-xs text-muted-foreground">
          This variant is not available at any franchise location.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 px-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        <span>Location</span>
        <span className="text-right">Available</span>
      </div>
      <div className="space-y-2">
        {rows.map((row) => {
          const isSelected = selectedFranchiseId === row.franchise_id;
          const hasStock = row.quantity > 0;

          return (
            <button
              key={row.franchise_id}
              type="button"
              onClick={() => onSelectFranchise(row.franchise_id)}
              className={cn(
                "flex w-full items-center justify-between gap-3 rounded-lg border bg-background px-3 py-2.5 text-left transition-colors",
                "hover:bg-accent/40 hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                isSelected && "border-primary/40 bg-primary/5 ring-1 ring-primary/20",
                !hasStock && "opacity-70"
              )}
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
                  <Store className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{row.franchise_name}</p>
                  {isSelected && (
                    <p className="text-xs text-primary">Selected franchise</p>
                  )}
                </div>
              </div>
              <Badge
                variant="outline"
                className={cn(
                  "pointer-events-none shrink-0 tabular-nums",
                  hasStock
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "text-muted-foreground"
                )}
              >
                {row.quantity} unit{row.quantity === 1 ? "" : "s"}
              </Badge>
            </button>
          );
        })}
      </div>
    </div>
  );
}
