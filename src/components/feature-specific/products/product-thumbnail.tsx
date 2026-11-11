import { cn } from "@/lib/utils";
import { Product } from "@/models/data/product.model";
import { ImageOff, Package } from "lucide-react";
import { useEffect, useState } from "react";
import { getProductImageUrls } from "./product-ui-utils";

interface ProductThumbnailProps {
  product: Product;
  onClick?: () => void;
  size?: "sm" | "md";
  className?: string;
}

export function ProductThumbnail({
  product,
  onClick,
  size = "md",
  className,
}: ProductThumbnailProps) {
  const urls = getProductImageUrls(product);
  const [failedIndex, setFailedIndex] = useState(0);

  useEffect(() => {
    setFailedIndex(0);
  }, [product.ID, urls.length]);

  const activeUrl = urls[failedIndex];
  const dims = size === "sm" ? 40 : 48;
  const sizeClass = size === "sm" ? "h-10 w-10" : "h-12 w-12";
  const allFailed = urls.length > 0 && failedIndex >= urls.length;

  const content = (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border/70 bg-muted/40 shadow-sm",
        sizeClass,
        onClick && "transition-transform duration-150 group-hover:scale-[1.03]",
        className
      )}
    >
      {activeUrl ? (
        <img
          src={activeUrl}
          alt={product.name}
          width={dims}
          height={dims}
          loading="lazy"
          decoding="async"
          onError={() => setFailedIndex((prev) => prev + 1)}
          className="h-full w-full object-cover"
        />
      ) : allFailed ? (
        <ImageOff
          aria-hidden="true"
          className="h-4 w-4 text-muted-foreground/70"
        />
      ) : (
        <Package
          aria-hidden="true"
          className="h-4 w-4 text-muted-foreground/70"
        />
      )}
      {urls.length > 1 && (
        <span className="absolute bottom-0.5 right-0.5 rounded bg-black/70 px-1 text-[10px] font-semibold leading-tight text-white tabular-nums">
          +{urls.length - 1}
        </span>
      )}
    </div>
  );

  if (!onClick) {
    return content;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`View ${product.name} details and ${urls.length} image${urls.length === 1 ? "" : "s"}`}
      className="group shrink-0 cursor-pointer rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {content}
    </button>
  );
}

