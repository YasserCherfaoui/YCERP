import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Product } from "@/models/data/product.model";
import { Camera, Layers2, Link2, Sparkles } from "lucide-react";

interface ProductPromoBadgesProps {
  product: Product;
  showWooPicture?: boolean;
  className?: string;
}

export function ProductPromoBadges({
  product,
  showWooPicture = false,
  className,
}: ProductPromoBadgesProps) {
  const hasAny =
    product.is_bogo ||
    product.combinable ||
    product.pairable ||
    (showWooPicture && product.is_woo_picture);

  if (!hasAny) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className={cn("flex flex-wrap items-center gap-1", className)}>
        {product.is_bogo && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge
                variant="outline"
                className="cursor-default gap-1 border-sky-300 bg-sky-100/90 text-sky-900 dark:border-sky-400/30 dark:bg-sky-500/20 dark:text-sky-100"
              >
                <Sparkles className="h-3 w-3" aria-hidden="true" />
                BOGO
              </Badge>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs text-left">
              Buy one, get second at half price when 2+ units of this product are sold together in a franchise sale.
            </TooltipContent>
          </Tooltip>
        )}

        {product.combinable && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge
                variant="outline"
                className="cursor-default gap-1 border-amber-300 bg-amber-100/90 text-amber-900 dark:border-amber-400/30 dark:bg-amber-500/20 dark:text-amber-100"
              >
                <Layers2 className="h-3 w-3" aria-hidden="true" />
                Combinable
              </Badge>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs text-left">
              Combinable pool: with 2+ combinable units in the cart, one anchor unit sells at first price (franchise 0).
            </TooltipContent>
          </Tooltip>
        )}

        {product.pairable && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge
                variant="outline"
                className="cursor-default gap-1 border-violet-300 bg-violet-100/90 text-violet-900 dark:border-violet-400/30 dark:bg-violet-500/20 dark:text-violet-100"
              >
                <Link2 className="h-3 w-3" aria-hidden="true" />
                Pairable
              </Badge>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs text-left">
              Pairable pool: with 2+ pairable units in the cart, min/max pairing charges the cheaper item at half price.
            </TooltipContent>
          </Tooltip>
        )}

        {showWooPicture && product.is_woo_picture && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge
                variant="outline"
                className="cursor-default gap-1 border-emerald-300 bg-emerald-100/80 text-emerald-900 dark:border-emerald-400/30 dark:bg-emerald-500/20 dark:text-emerald-100"
              >
                <Camera className="h-3 w-3" aria-hidden="true" />
                Woo
              </Badge>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs text-left">
              Uses WooCommerce product pictures.
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}

