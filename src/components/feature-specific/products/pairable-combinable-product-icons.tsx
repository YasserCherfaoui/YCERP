import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Layers2, Link2 } from "lucide-react";

const COMBINABLE_TOOLTIP =
  "Combinable: this product is in the combinable pool. With 2+ combinable units in the cart, one unit anchors at first price (franchise 0 on the server).";

const PAIRABLE_TOOLTIP =
  "Pairable: this product is in the pair promo pool. With 2+ pairable units in the cart, min/max pairing applies to the line totals.";

type Props = {
  combinable?: boolean;
  pairable?: boolean;
  className?: string;
};

/**
 * Icon tags for combinable / pairable products (distinct background colors + hover explanation).
 */
export function PairableCombinableProductIcons({
  combinable,
  pairable,
  className,
}: Props) {
  if (!combinable && !pairable) return null;

  return (
    <TooltipProvider delayDuration={200}>
      <div
        className={cn("inline-flex flex-row flex-wrap items-center gap-1", className)}
      >
        {combinable && (
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                className="inline-flex h-7 w-7 shrink-0 cursor-default items-center justify-center rounded-md bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-100"
                aria-label="Combinable product"
              >
                <Layers2 className="h-4 w-4" strokeWidth={2} />
              </span>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs text-left">
              {COMBINABLE_TOOLTIP}
            </TooltipContent>
          </Tooltip>
        )}
        {pairable && (
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                className="inline-flex h-7 w-7 shrink-0 cursor-default items-center justify-center rounded-md bg-violet-100 text-violet-900 dark:bg-violet-950/60 dark:text-violet-100"
                aria-label="Pairable product"
              >
                <Link2 className="h-4 w-4" strokeWidth={2} />
              </span>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs text-left">
              {PAIRABLE_TOOLTIP}
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}
