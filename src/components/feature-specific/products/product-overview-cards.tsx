import { liquidGlass } from "@/components/feature-specific/crm/crm-theme";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Product } from "@/models/data/product.model";
import { isPackConfigured } from "@/utils/pricing-utils";
import {
  CheckCircle2,
  ImageOff,
  Layers2,
  Link2,
  Package,
  PackageCheck,
  PauseCircle,
  Sparkles,
} from "lucide-react";
import {
  getProductImageUrls,
  ProductSegment,
} from "./product-ui-utils";

interface SegmentConfig {
  value: ProductSegment;
  label: string;
  icon: typeof Package;
  iconClass: string;
  surfaceClass: string;
  selectedClass: string;
  count: (products: Product[]) => number;
}

const SEGMENTS: SegmentConfig[] = [
  {
    value: "all",
    label: "All products",
    icon: Package,
    iconClass:
      "bg-indigo-200/80 text-indigo-800 dark:bg-indigo-400/20 dark:text-indigo-100",
    surfaceClass:
      "border-indigo-200/80 bg-indigo-100/80 text-indigo-950 hover:bg-indigo-100 dark:border-indigo-400/30 dark:bg-indigo-500/20 dark:text-indigo-50 dark:hover:bg-indigo-500/30",
    selectedClass:
      "bg-indigo-200 ring-2 ring-indigo-400/80 dark:bg-indigo-500/40 dark:ring-indigo-300/60",
    count: (products) => products.length,
  },
  {
    value: "active",
    label: "Active",
    icon: CheckCircle2,
    iconClass:
      "bg-emerald-200/80 text-emerald-900 dark:bg-emerald-400/20 dark:text-emerald-100",
    surfaceClass:
      "border-emerald-200/80 bg-emerald-100/80 text-emerald-950 hover:bg-emerald-100 dark:border-emerald-400/30 dark:bg-emerald-500/20 dark:text-emerald-50 dark:hover:bg-emerald-500/30",
    selectedClass:
      "bg-emerald-200 ring-2 ring-emerald-400/80 dark:bg-emerald-500/40 dark:ring-emerald-300/60",
    count: (products) => products.filter((p) => p.is_active !== false).length,
  },
  {
    value: "inactive",
    label: "Inactive",
    icon: PauseCircle,
    iconClass:
      "bg-slate-200/80 text-slate-800 dark:bg-slate-400/20 dark:text-slate-100",
    surfaceClass:
      "border-slate-200/80 bg-slate-100/80 text-slate-950 hover:bg-slate-100 dark:border-slate-400/30 dark:bg-slate-500/20 dark:text-slate-50 dark:hover:bg-slate-500/30",
    selectedClass:
      "bg-slate-200 ring-2 ring-slate-400/80 dark:bg-slate-500/40 dark:ring-slate-300/60",
    count: (products) => products.filter((p) => p.is_active === false).length,
  },
  {
    value: "pack",
    label: "Packs",
    icon: PackageCheck,
    iconClass:
      "bg-teal-200/80 text-teal-900 dark:bg-teal-400/20 dark:text-teal-100",
    surfaceClass:
      "border-teal-200/80 bg-teal-100/80 text-teal-950 hover:bg-teal-100 dark:border-teal-400/30 dark:bg-teal-500/20 dark:text-teal-50 dark:hover:bg-teal-500/30",
    selectedClass:
      "bg-teal-200 ring-2 ring-teal-400/80 dark:bg-teal-500/40 dark:ring-teal-300/60",
    count: (products) => products.filter((p) => isPackConfigured(p)).length,
  },
  {
    value: "bogo",
    label: "BOGO",
    icon: Sparkles,
    iconClass:
      "bg-sky-200/80 text-sky-900 dark:bg-sky-400/20 dark:text-sky-100",
    surfaceClass:
      "border-sky-200/80 bg-sky-100/80 text-sky-950 hover:bg-sky-100 dark:border-sky-400/30 dark:bg-sky-500/20 dark:text-sky-50 dark:hover:bg-sky-500/30",
    selectedClass:
      "bg-sky-200 ring-2 ring-sky-400/80 dark:bg-sky-500/40 dark:ring-sky-300/60",
    count: (products) => products.filter((p) => p.is_bogo).length,
  },
  {
    value: "combinable",
    label: "Combinable",
    icon: Layers2,
    iconClass:
      "bg-amber-200/80 text-amber-900 dark:bg-amber-400/20 dark:text-amber-100",
    surfaceClass:
      "border-amber-200/80 bg-amber-100/85 text-amber-950 hover:bg-amber-100 dark:border-amber-400/30 dark:bg-amber-500/20 dark:text-amber-50 dark:hover:bg-amber-500/30",
    selectedClass:
      "bg-amber-200 ring-2 ring-amber-400/80 dark:bg-amber-500/40 dark:ring-amber-300/60",
    count: (products) => products.filter((p) => p.combinable).length,
  },
  {
    value: "pairable",
    label: "Pairable",
    icon: Link2,
    iconClass:
      "bg-violet-200/80 text-violet-800 dark:bg-violet-400/20 dark:text-violet-100",
    surfaceClass:
      "border-violet-200/80 bg-violet-100/80 text-violet-950 hover:bg-violet-100 dark:border-violet-400/30 dark:bg-violet-500/20 dark:text-violet-50 dark:hover:bg-violet-500/30",
    selectedClass:
      "bg-violet-200 ring-2 ring-violet-400/80 dark:bg-violet-500/40 dark:ring-violet-300/60",
    count: (products) => products.filter((p) => p.pairable).length,
  },
  {
    value: "no_photos",
    label: "No photos",
    icon: ImageOff,
    iconClass:
      "bg-rose-200/80 text-rose-900 dark:bg-rose-400/20 dark:text-rose-100",
    surfaceClass:
      "border-rose-200/80 bg-rose-100/80 text-rose-950 hover:bg-rose-100 dark:border-rose-400/30 dark:bg-rose-500/20 dark:text-rose-50 dark:hover:bg-rose-500/30",
    selectedClass:
      "bg-rose-200 ring-2 ring-rose-400/80 dark:bg-rose-500/40 dark:ring-rose-300/60",
    count: (products) =>
      products.filter((p) => getProductImageUrls(p).length === 0).length,
  },
];

interface ProductOverviewCardsProps {
  products: Product[];
  selectedSegment: ProductSegment;
  onSelectSegment: (segment: ProductSegment) => void;
  isLoading?: boolean;
}

export function ProductOverviewCards({
  products,
  selectedSegment,
  onSelectSegment,
  isLoading = false,
}: ProductOverviewCardsProps) {
  return (
    <Card className={liquidGlass} aria-label="Catalog overview">
      <CardHeader className="flex flex-col gap-1 space-y-0 pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <CardTitle className="text-base">Catalog overview</CardTitle>
          <CardDescription>
            Choose a segment to focus the table, or audit products missing photos.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div
          className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8"
          role="tablist"
          aria-label="Product segment"
        >
          {isLoading
            ? SEGMENTS.map((seg) => (
                <Skeleton key={seg.value} className="h-[4.75rem] rounded-xl" />
              ))
            : SEGMENTS.map((seg) => {
                const Icon = seg.icon;
                const selected = selectedSegment === seg.value;
                const count = seg.count(products);

                return (
                  <button
                    key={seg.value}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    onClick={() =>
                      onSelectSegment(
                        selected && seg.value !== "all" ? "all" : seg.value
                      )
                    }
                    className={cn(
                      "flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border px-3 py-3 text-left shadow-sm backdrop-blur-md",
                      "motion-safe:transition motion-safe:duration-200 hover:shadow-md active:scale-[0.98]",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      seg.surfaceClass,
                      selected && seg.selectedClass
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-lg",
                        seg.iconClass
                      )}
                    >
                      <Icon className="size-4" aria-hidden="true" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-xl font-semibold leading-none tabular-nums tracking-tight">
                        {count.toLocaleString()}
                      </span>
                      <span className="mt-1 block truncate text-xs font-medium text-current/75">
                        {seg.label}
                      </span>
                    </span>
                  </button>
                );
              })}
        </div>
      </CardContent>
    </Card>
  );
}

