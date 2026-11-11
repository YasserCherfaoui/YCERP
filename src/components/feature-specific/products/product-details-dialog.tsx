import RemoveProductActionDialog from "@/components/feature-specific/company-products/remove-product-action-dialog";
import { SetAffiliatePropsDialog } from "@/components/feature-specific/company-products/set-affiliate-props-dialog";
import UpdateProductForm from "@/components/feature-specific/company-products/update-product-form";
import { liquidGlass } from "@/components/feature-specific/crm/crm-theme";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Product } from "@/models/data/product.model";
import { computePackBreakdown, isPackConfigured } from "@/utils/pricing-utils";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  ImageOff,
  MoreHorizontal,
  Package,
} from "lucide-react";
import { useEffect, useState } from "react";
import { ProductPromoBadges } from "./product-promo-badges";
import { formatDzd, getProductImageUrls } from "./product-ui-utils";

interface ProductDetailsDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Hide first_price and cost-based margins (moderators & franchises). */
  hideCost?: boolean;
  /** When viewing inside a franchise portal, highlight franchise margin. */
  franchiseType?: "normal" | "vip";
  /** Allow editing/deleting/affiliate props (company & moderator views). */
  canManage?: boolean;
}

export function ProductDetailsDialog({
  product,
  open,
  onOpenChange,
  hideCost = false,
  franchiseType,
  canManage = false,
}: ProductDetailsDialogProps) {
  const { toast } = useToast();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [failedUrls, setFailedUrls] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState(false);

  const images = product ? getProductImageUrls(product) : [];

  useEffect(() => {
    setActiveImageIndex(0);
    setFailedUrls({});
    setCopiedId(false);
  }, [product?.ID, open]);

  if (!product) return null;

  const activeUrl = images[activeImageIndex];
  const isBroken = activeUrl ? failedUrls[activeUrl] : false;
  const variants = product.product_variants ?? [];
  const category = product.product_category;

  const normalMargin = product.franchise_price - product.first_price;
  const vipBase = product.vip_franchise_price ?? product.franchise_price;
  const vipMargin = vipBase - product.first_price;
  const retailMargin = product.price - product.first_price;

  const franchiseCost =
    franchiseType === "vip"
      ? product.vip_franchise_price ?? product.franchise_price
      : product.franchise_price;
  const franchiseRetailMargin = product.price - franchiseCost;

  const handleCopy = (value: string, label: string) => {
    navigator.clipboard.writeText(value);
    setCopiedId(true);
    toast({ title: `${label} copied`, description: value });
    setTimeout(() => setCopiedId(false), 1500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "flex max-h-[90vh] max-w-5xl flex-col gap-0 overflow-hidden p-0 sm:p-0",
          liquidGlass
        )}
      >
        <DialogHeader className="space-y-3 border-b border-white/40 px-5 py-5 pr-12 text-left dark:border-white/10">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <DialogTitle className="text-xl">{product.name}</DialogTitle>
                <Badge variant="outline" className="font-mono text-xs tabular-nums">
                  #{product.ID}
                </Badge>
                {product.is_active === false ? (
                  <Badge variant="secondary">Inactive</Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="border-emerald-300 bg-emerald-100/80 text-emerald-900 dark:border-emerald-400/30 dark:bg-emerald-500/20 dark:text-emerald-100"
                  >
                    Active
                  </Badge>
                )}
              </div>
              <DialogDescription className="text-sm text-foreground/80">
                {category ? category.name : "Uncategorized"} ·{" "}
                <span className="tabular-nums">
                  {variants.length} variant{variants.length === 1 ? "" : "s"}
                </span>{" "}
                ·{" "}
                <span className="tabular-nums">
                  {images.length} photo{images.length === 1 ? "" : "s"}
                </span>
              </DialogDescription>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <ProductPromoBadges product={product} showWooPicture={!franchiseType} />
              <span className="text-lg font-semibold tabular-nums">
                {formatDzd(product.price)}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="bg-background"
              onClick={() => handleCopy(String(product.ID), "Product ID")}
            >
              {copiedId ? (
                <Check className="h-4 w-4 text-emerald-600" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              Copy ID
            </Button>

            {canManage && (
              <>
                <UpdateProductForm product={product} />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="bg-background"
                    >
                      <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                      More actions
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuLabel>Manage product</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <SetAffiliatePropsDialog product={product} />
                    <RemoveProductActionDialog product={product} />
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4 overflow-y-auto px-5 py-5 lg:grid-cols-12">
          {/* Left column: Image Gallery */}
          <div className="space-y-3 lg:col-span-5">
            <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl border bg-muted/40">
              {activeUrl && !isBroken ? (
                <img
                  src={activeUrl}
                  alt={`${product.name} photo ${activeImageIndex + 1}`}
                  className="h-full w-full object-contain"
                  onError={() =>
                    setFailedUrls((prev) => ({ ...prev, [activeUrl]: true }))
                  }
                />
              ) : isBroken ? (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <ImageOff className="h-10 w-10" aria-hidden="true" />
                  <span className="text-xs">Image unavailable</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Package className="h-10 w-10" aria-hidden="true" />
                  <span className="text-xs">No linked photos</span>
                </div>
              )}

              {images.length > 1 && (
                <>
                  <Button
                    type="button"
                    size="icon"
                    variant="secondary"
                    aria-label="Previous image"
                    className="absolute left-2 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full bg-background/80 backdrop-blur"
                    onClick={() =>
                      setActiveImageIndex(
                        (prev) => (prev - 1 + images.length) % images.length
                      )
                    }
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="secondary"
                    aria-label="Next image"
                    className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full bg-background/80 backdrop-blur"
                    onClick={() =>
                      setActiveImageIndex((prev) => (prev + 1) % images.length)
                    }
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <span className="absolute bottom-2 right-2 rounded-full bg-black/70 px-2 py-0.5 text-xs font-medium text-white tabular-nums">
                    {activeImageIndex + 1} / {images.length}
                  </span>
                </>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((url, idx) => (
                  <button
                    key={`${url}-${idx}`}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    aria-label={`Select photo ${idx + 1}`}
                    className={cn(
                      "h-14 w-14 shrink-0 cursor-pointer overflow-hidden rounded-lg border bg-muted/40 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      idx === activeImageIndex
                        ? "ring-2 ring-primary"
                        : "opacity-75 hover:opacity-100"
                    )}
                  >
                    <img
                      src={url}
                      alt=""
                      width={56}
                      height={56}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right column: Financial Ledger, Description & Variants */}
          <div className="space-y-4 lg:col-span-7">
            <Card className="bg-background/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Pricing ledger
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
                {!hideCost && (
                  <LedgerMetric label="First price (cost)" value={formatDzd(product.first_price)} />
                )}
                {(!franchiseType || franchiseType === "normal") && (
                  <LedgerMetric
                    label="Franchise price"
                    value={formatDzd(product.franchise_price)}
                  />
                )}
                {(!franchiseType || franchiseType === "vip") && (
                  <LedgerMetric
                    label="VIP franchise price"
                    value={formatDzd(product.vip_franchise_price)}
                    sub={
                      franchiseType === "vip" &&
                      product.vip_franchise_price == null
                        ? `Falls back to ${formatDzd(product.franchise_price)}`
                        : undefined
                    }
                  />
                )}
                <LedgerMetric
                  label="Sell price"
                  value={formatDzd(product.price)}
                  highlight
                />
                {product.promo_price != null && product.promo_price > 0 && (
                  <LedgerMetric
                    label="Display promo price"
                    value={formatDzd(product.promo_price)}
                  />
                )}
                {!hideCost && (
                  <>
                    <LedgerMetric
                      label="Franchise benefit"
                      value={formatDzd(normalMargin)}
                      sub="franchise_price − first_price"
                    />
                    <LedgerMetric
                      label="VIP benefit"
                      value={formatDzd(vipMargin)}
                      sub="vip − first_price"
                    />
                    <LedgerMetric
                      label="Direct retail margin"
                      value={formatDzd(retailMargin)}
                      sub="price − first_price"
                    />
                  </>
                )}
                {franchiseType && (
                  <LedgerMetric
                    label="Your retail margin"
                    value={formatDzd(franchiseRetailMargin)}
                    sub="price − franchise_price"
                  />
                )}
                {!franchiseType && product.franchise_ship_commission !== undefined && (
                  <LedgerMetric
                    label="Ship commission"
                    value={formatDzd(product.franchise_ship_commission)}
                  />
                )}
              </CardContent>
            </Card>

            {isPackConfigured(product) && (() => {
              const packQty = product.pack_quantity ?? 2;
              const packPrice = product.pack_price ?? 0;
              const pack = computePackBreakdown({
                packQuantity: packQty,
                packPrice,
                unitPrice: product.price,
                unitFranchisePrice: franchiseType
                  ? franchiseCost
                  : product.franchise_price,
                marginType: product.pack_margin_type,
                marginValue: product.pack_margin_value,
              });
              return (
                <Card className="border-teal-300/60 bg-teal-50/50 dark:border-teal-500/30 dark:bg-teal-950/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold uppercase tracking-wide text-teal-900 dark:text-teal-200">
                      Pack pricing ({pack.packQuantity}× bundle)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
                    <LedgerMetric
                      label="Pack customer price"
                      value={formatDzd(pack.packPrice)}
                      sub={`${formatDzd(Math.round(pack.perUnitSalePrice))}/u vs ${formatDzd(pack.normalRetailTotal)}`}
                      highlight
                    />
                    <LedgerMetric
                      label="Base pack margin"
                      value={`${formatDzd(pack.baseMargin)} (${pack.baseMarginPct.toFixed(2)}%)`}
                      sub={`vs ${formatDzd(pack.normalFranchiseTotal)} franchise`}
                    />
                    <LedgerMetric
                      label="Extra margin"
                      value={`+${formatDzd(pack.extraMargin)} (+${pack.extraMarginPct.toFixed(2)}%)`}
                      sub={
                        product.pack_margin_type === "percent"
                          ? `${product.pack_margin_value ?? 0}% of franchise`
                          : "Fixed per pack"
                      }
                    />
                    <LedgerMetric
                      label="Total franchise margin"
                      value={`${formatDzd(pack.totalMargin)} (${pack.totalMarginPct.toFixed(2)}%)`}
                    />
                    <LedgerMetric
                      label="Pack franchise price"
                      value={formatDzd(pack.packFranchiseTotal)}
                      sub={`${formatDzd(Math.round(pack.perUnitFranchisePrice))}/unit`}
                    />
                  </CardContent>
                </Card>
              );
            })()}

            {product.description && (
              <Card className="bg-background/60">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Description
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
                  {product.description}
                </CardContent>
              </Card>
            )}

            <Card className="bg-background/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Variants ({variants.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {variants.length === 0 ? (
                  <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                    No variants defined for this product.
                  </p>
                ) : (
                  <div className="max-h-64 overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Color</TableHead>
                          <TableHead>Size</TableHead>
                          <TableHead>QR Code</TableHead>
                          {variants.some((v) => v.total_inventory_quantity !== undefined) && (
                            <TableHead className="text-right">Stock</TableHead>
                          )}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {variants.map((variant) => (
                          <TableRow key={variant.ID}>
                            <TableCell className="font-medium">
                              {variant.color || "—"}
                            </TableCell>
                            <TableCell className="tabular-nums">
                              {variant.size}
                            </TableCell>
                            <TableCell>
                              {variant.qr_code ? (
                                <button
                                  type="button"
                                  onClick={() => handleCopy(variant.qr_code, "QR code")}
                                  className="inline-flex cursor-pointer items-center gap-1 rounded bg-muted px-1.5 py-0.5 font-mono text-xs hover:bg-accent"
                                >
                                  {variant.qr_code}
                                  <Copy className="h-3 w-3 opacity-60" aria-hidden="true" />
                                </button>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </TableCell>
                            {variants.some((v) => v.total_inventory_quantity !== undefined) && (
                              <TableCell className="text-right font-semibold tabular-nums">
                                {variant.total_inventory_quantity ?? 0}
                              </TableCell>
                            )}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function LedgerMetric({
  label,
  value,
  sub,
  highlight = false,
}: {
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-lg border bg-background/70 p-2.5">
      <div className="text-[11px] font-medium text-muted-foreground">{label}</div>
      <div
        className={cn(
          "mt-0.5 text-base font-semibold tabular-nums",
          highlight && "text-primary"
        )}
      >
        {value}
      </div>
      {sub && (
        <div className="mt-0.5 text-[10px] text-muted-foreground">{sub}</div>
      )}
    </div>
  );
}

