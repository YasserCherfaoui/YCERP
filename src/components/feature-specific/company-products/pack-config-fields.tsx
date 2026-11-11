import { formatDzd } from "@/components/feature-specific/products/product-ui-utils";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { computePackBreakdown } from "@/utils/pricing-utils";
import { PackageCheck } from "lucide-react";
import { Control, UseFormSetValue, useWatch } from "react-hook-form";

interface PackConfigFieldsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setValue: UseFormSetValue<any>;
  unitPrice: number;
  unitFranchisePrice: number;
  unitVipFranchisePrice?: number | null;
  unitFirstPrice?: number;
}

export function PackConfigFields({
  control,
  setValue,
  unitPrice,
  unitFranchisePrice,
  unitVipFranchisePrice,
  unitFirstPrice,
}: PackConfigFieldsProps) {
  const isPack = Boolean(useWatch({ control, name: "is_pack" }));
  const packQuantity = Number(useWatch({ control, name: "pack_quantity" }) ?? 2) || 2;
  const packPrice = Number(useWatch({ control, name: "pack_price" }) ?? 0) || 0;
  const marginType =
    (useWatch({ control, name: "pack_margin_type" }) as "fixed" | "percent") ||
    "fixed";
  const marginValue =
    Number(useWatch({ control, name: "pack_margin_value" }) ?? 0) || 0;

  const breakdown = computePackBreakdown({
    packQuantity,
    packPrice,
    unitPrice,
    unitFranchisePrice,
    marginType,
    marginValue,
  });

  const vipBreakdown =
    unitVipFranchisePrice != null && unitVipFranchisePrice > 0
      ? computePackBreakdown({
          packQuantity,
          packPrice,
          unitPrice,
          unitFranchisePrice: unitVipFranchisePrice,
          marginType,
          marginValue,
        })
      : null;

  const normalCompanyBenefit =
    unitFirstPrice !== undefined
      ? breakdown.packFranchiseTotal - packQuantity * unitFirstPrice
      : undefined;

  return (
    <div className="space-y-3 rounded-lg border bg-background/70 p-3">
      <FormField
        control={control}
        name="is_pack"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center gap-3 space-y-0">
            <FormControl>
              <Checkbox
                checked={field.value ?? false}
                onCheckedChange={(checked) => {
                  field.onChange(checked);
                  if (checked && !packQuantity) {
                    setValue("pack_quantity", 2);
                  }
                }}
              />
            </FormControl>
            <div className="space-y-0.5">
              <FormLabel className="flex cursor-pointer items-center gap-1.5 font-medium">
                <PackageCheck className="h-4 w-4 text-teal-600 dark:text-teal-400" aria-hidden="true" />
                Pack Mode (bundle N units at a fixed price + extra franchise margin)
              </FormLabel>
              <FormDescription className="text-xs">
                Applies across all sales when customer buys at least the pack quantity.
              </FormDescription>
            </div>
          </FormItem>
        )}
      />

      {isPack && (
        <div className="space-y-3 border-t pt-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <FormField
              control={control}
              name="pack_quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pack Quantity</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={2}
                      className="bg-background tabular-nums"
                      value={field.value ?? 2}
                      onChange={(e) =>
                        field.onChange(Math.max(2, Number(e.target.value) || 2))
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="pack_price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pack Customer Price (DZD)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      placeholder="e.g. 9900"
                      className="bg-background tabular-nums"
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === "" ? undefined : Number(e.target.value)
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="pack_margin_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Extra Margin Unit</FormLabel>
                  <div
                    role="group"
                    aria-label="Extra margin unit"
                    className="grid grid-cols-2 rounded-lg border bg-muted p-0.5"
                  >
                    {(
                      [
                        { value: "fixed", label: "DZD" },
                        { value: "percent", label: "% of Franchise" },
                      ] as const
                    ).map((opt) => {
                      const active = (field.value ?? "fixed") === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          aria-pressed={active}
                          onClick={() => field.onChange(opt.value)}
                          className={cn(
                            "h-8 cursor-pointer rounded-md px-2 text-xs font-medium transition-colors",
                            active
                              ? "bg-background text-foreground shadow-sm"
                              : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="pack_margin_value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Extra Margin ({marginType === "percent" ? "%" : "DZD"})
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      placeholder={marginType === "percent" ? "e.g. 5" : "e.g. 200"}
                      className="bg-background tabular-nums"
                      value={field.value ?? 0}
                      onChange={(e) =>
                        field.onChange(Math.max(0, Number(e.target.value) || 0))
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-2 rounded-lg border border-teal-300/60 bg-teal-50/60 p-3 text-xs dark:border-teal-500/30 dark:bg-teal-950/20">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-semibold text-teal-950 dark:text-teal-100">
                Live Pack Margin Preview ({packQuantity}× units vs{" "}
                {formatDzd(breakdown.normalFranchiseTotal)} franchise price)
              </span>
              {packPrice > 0 && (
                <span className="text-muted-foreground tabular-nums">
                  Customer saves{" "}
                  <strong className="text-foreground">
                    {formatDzd(breakdown.normalRetailTotal - breakdown.packPrice)}
                  </strong>{" "}
                  ({formatDzd(breakdown.normalRetailTotal)} → {formatDzd(breakdown.packPrice)})
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-md border bg-background/80 p-2">
                <div className="text-[11px] text-muted-foreground">Base Pack Margin</div>
                <div className="font-semibold tabular-nums">
                  {formatDzd(breakdown.baseMargin)} ({breakdown.baseMarginPct.toFixed(2)}%)
                </div>
              </div>

              <div className="rounded-md border bg-background/80 p-2">
                <div className="text-[11px] text-muted-foreground">
                  Extra Margin Added
                </div>
                <div className="font-semibold text-teal-700 tabular-nums dark:text-teal-300">
                  +{formatDzd(breakdown.extraMargin)} (+{breakdown.extraMarginPct.toFixed(2)}%)
                </div>
              </div>

              <div className="rounded-md border bg-background/80 p-2">
                <div className="text-[11px] text-muted-foreground">
                  Total Franchise Margin
                </div>
                <div className="font-semibold tabular-nums">
                  {formatDzd(breakdown.totalMargin)} ({breakdown.totalMarginPct.toFixed(2)}%)
                </div>
              </div>

              <div className="rounded-md border bg-background/80 p-2">
                <div className="text-[11px] text-muted-foreground">
                  Effective Franchise Price
                </div>
                <div className="font-semibold tabular-nums">
                  {formatDzd(breakdown.packFranchiseTotal)} (
                  {formatDzd(Math.round(breakdown.perUnitFranchisePrice))}/u)
                </div>
              </div>
            </div>

            {(normalCompanyBenefit !== undefined || vipBreakdown) && (
              <div className="flex flex-wrap gap-4 pt-1 text-[11px] text-muted-foreground tabular-nums">
                {normalCompanyBenefit !== undefined && (
                  <span>
                    Company benefit:{" "}
                    <strong className="text-foreground">
                      {formatDzd(normalCompanyBenefit)}
                    </strong>
                  </span>
                )}
                {vipBreakdown && (
                  <span>
                    VIP Pack Margin:{" "}
                    <strong className="text-foreground">
                      {formatDzd(vipBreakdown.totalMargin)} ({vipBreakdown.totalMarginPct.toFixed(2)}%)
                    </strong>{" "}
                    (Franchise pays {formatDzd(vipBreakdown.packFranchiseTotal)})
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

