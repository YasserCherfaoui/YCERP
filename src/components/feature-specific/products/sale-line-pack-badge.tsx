import { formatDzd } from "@/components/feature-specific/products/product-ui-utils";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/models/data/product.model";
import { isPackConfigured } from "@/utils/pricing-utils";

interface SaleLinePackBadgeProps {
  product: Product | undefined;
  isPackActive: boolean;
  lineTotal: number;
}

export function SaleLinePackBadge({
  product,
  isPackActive,
  lineTotal,
}: SaleLinePackBadgeProps) {
  if (!isPackConfigured(product)) return null;

  if (isPackActive) {
    return (
      <Badge
        variant="secondary"
        className="w-fit border-teal-300 bg-teal-100 text-teal-900 dark:border-teal-400/30 dark:bg-teal-500/20 dark:text-teal-100"
      >
        Pack ({product?.pack_quantity}×): {formatDzd(lineTotal)}
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="w-fit text-[11px] text-muted-foreground">
      Pack: {product?.pack_quantity}× for {formatDzd(product?.pack_price)}
    </Badge>
  );
}

