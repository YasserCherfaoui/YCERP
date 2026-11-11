import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Product } from "@/models/data/product.model";
import { Boxes } from "lucide-react";

interface ProductVariantsPopoverProps {
  product: Product;
}

export function ProductVariantsPopover({ product }: ProductVariantsPopoverProps) {
  const variants = product.product_variants ?? [];
  if (variants.length === 0) {
    return <span className="text-xs text-muted-foreground">No variants</span>;
  }

  const colors = Array.from(
    new Set(variants.map((v) => v.color?.trim()).filter(Boolean))
  );
  const colorPreview = colors.slice(0, 2).join(", ");
  const extraColors = colors.length > 2 ? ` +${colors.length - 2}` : "";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex cursor-pointer flex-col items-start gap-0.5 rounded-lg border border-border/70 bg-background/60 px-2.5 py-1 text-left transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold tabular-nums">
            <Boxes className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
            {variants.length} {variants.length === 1 ? "variant" : "variants"}
          </span>
          {colorPreview && (
            <span className="max-w-[10rem] truncate text-[11px] text-muted-foreground">
              {colorPreview}
              {extraColors}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 p-3">
        <div className="mb-2 flex items-center justify-between">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{product.name}</p>
            <p className="text-xs text-muted-foreground tabular-nums">
              {variants.length} variants · {colors.length} color{colors.length === 1 ? "" : "s"}
            </p>
          </div>
          <Badge variant="secondary" className="tabular-nums">
            #{product.ID}
          </Badge>
        </div>
        <ScrollArea className="max-h-56 pr-2">
          <div className="divide-y divide-border/60 text-xs">
            {variants.map((variant) => (
              <div
                key={variant.ID}
                className="flex items-center justify-between gap-2 py-1.5"
              >
                <div className="flex min-w-0 items-center gap-1.5">
                  <span className="truncate font-medium">
                    {variant.color || "Default"}
                  </span>
                  <Badge variant="outline" className="px-1.5 py-0 text-[10px] tabular-nums">
                    {variant.size}
                  </Badge>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {variant.qr_code && (
                    <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                      {variant.qr_code}
                    </span>
                  )}
                  {variant.total_inventory_quantity !== undefined && (
                    <span className="font-semibold tabular-nums">
                      {variant.total_inventory_quantity}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

