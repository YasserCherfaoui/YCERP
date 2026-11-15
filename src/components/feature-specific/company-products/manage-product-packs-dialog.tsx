import { liquidGlass } from "@/components/feature-specific/crm/crm-theme";
import { formatDzd } from "@/components/feature-specific/products/product-ui-utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Product, ProductPack } from "@/models/data/product.model";
import {
  createProductPack,
  deleteProductPack,
  getAllProductsWithVariantsByCompany,
  listProductPacks,
  ProductPackPayload,
  updateProductPack,
} from "@/services/product-service";
import { computeMultiPackBreakdown } from "@/utils/pricing-utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Boxes,
  Loader2,
  PackageCheck,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";

interface ManageProductPacksDialogProps {
  companyId: number;
}

interface PackFormState {
  name: string;
  pack_price: string;
  margin_type: "fixed" | "percent";
  margin_value: string;
  is_active: boolean;
  items: Array<{ product_id: number; quantity: number }>;
}

const EMPTY_FORM: PackFormState = {
  name: "",
  pack_price: "",
  margin_type: "fixed",
  margin_value: "0",
  is_active: true,
  items: [
    { product_id: 0, quantity: 1 },
    { product_id: 0, quantity: 1 },
  ],
};

export function ManageProductPacksDialog({
  companyId,
}: ManageProductPacksDialogProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingPack, setEditingPack] = useState<ProductPack | null>(null);
  const [deletingPack, setDeletingPack] = useState<ProductPack | null>(null);
  const [formState, setFormState] = useState<PackFormState>(EMPTY_FORM);

  const { data: packsData, isLoading, isError, error } = useQuery({
    queryKey: ["product-packs", companyId],
    queryFn: () => listProductPacks(companyId),
    enabled: open && Boolean(companyId),
  });

  const { data: productsData } = useQuery({
    queryKey: ["products", companyId],
    queryFn: () => getAllProductsWithVariantsByCompany(companyId),
    enabled: open && Boolean(companyId),
  });

  const packs = packsData?.data ?? [];
  const products = useMemo(() => productsData?.data ?? [], [productsData?.data]);
  const productMap = useMemo(() => {
    const m = new Map<number, Product>();
    for (const p of products) m.set(p.ID, p);
    return m;
  }, [products]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["product-packs"] });
  };

  const saveMut = useMutation({
    mutationFn: (payload: ProductPackPayload) =>
      editingPack
        ? updateProductPack(editingPack.ID, payload)
        : createProductPack(companyId, payload),
    onSuccess: () => {
      toast({
        description: editingPack ? "Pack updated" : "Pack created",
      });
      setEditorOpen(false);
      setEditingPack(null);
      setFormState(EMPTY_FORM);
      invalidate();
    },
    onError: (err: Error) => {
      toast({
        title: "Failed to save pack",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const toggleMut = useMutation({
    mutationFn: (payload: { id: number; is_active: boolean }) =>
      updateProductPack(payload.id, { is_active: payload.is_active }),
    onSuccess: () => {
      toast({ description: "Pack status updated" });
      invalidate();
    },
    onError: (err: Error) => {
      toast({
        title: "Failed to update pack",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => deleteProductPack(id),
    onSuccess: () => {
      toast({ description: "Pack deleted" });
      setDeletingPack(null);
      invalidate();
    },
    onError: (err: Error) => {
      toast({
        title: "Failed to delete pack",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const openCreate = () => {
    setEditingPack(null);
    setFormState(EMPTY_FORM);
    setEditorOpen(true);
  };

  const openEdit = (pack: ProductPack) => {
    setEditingPack(pack);
    setFormState({
      name: pack.name,
      pack_price: String(pack.pack_price),
      margin_type: pack.margin_type === "percent" ? "percent" : "fixed",
      margin_value: String(pack.margin_value ?? 0),
      is_active: pack.is_active,
      items:
        pack.items?.length > 0
          ? pack.items.map((it) => ({
              product_id: it.product_id,
              quantity: it.quantity,
            }))
          : [{ product_id: 0, quantity: 1 }],
    });
    setEditorOpen(true);
  };

  const validSelectedItems = formState.items.filter(
    (it) => it.product_id > 0 && it.quantity >= 1
  );
  const totalSelectedUnits = validSelectedItems.reduce(
    (s, it) => s + it.quantity,
    0
  );
  const hasDuplicateProducts =
    new Set(validSelectedItems.map((it) => it.product_id)).size !==
    validSelectedItems.length;

  const previewBreakdown = useMemo(() => {
    if (validSelectedItems.length === 0) return null;
    return computeMultiPackBreakdown({
      packPrice: Number(formState.pack_price) || 0,
      marginType: formState.margin_type,
      marginValue: Number(formState.margin_value) || 0,
      items: validSelectedItems.map((it) => {
        const prod = productMap.get(it.product_id);
        return {
          productId: it.product_id,
          quantity: it.quantity,
          unitPrice: prod?.price ?? 0,
          unitFranchisePrice: prod?.franchise_price ?? 0,
        };
      }),
    });
  }, [
    validSelectedItems,
    formState.pack_price,
    formState.margin_type,
    formState.margin_value,
    productMap,
  ]);

  const canSubmit =
    formState.name.trim().length > 0 &&
    (Number(formState.pack_price) || 0) > 0 &&
    validSelectedItems.length >= 1 &&
    totalSelectedUnits >= 2 &&
    !hasDuplicateProducts &&
    !saveMut.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" className="bg-background">
          <PackageCheck className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">Packs</span>
        </Button>
      </DialogTrigger>
      <DialogContent
        className={cn(
          "flex max-h-[90vh] max-w-3xl flex-col gap-0 overflow-hidden p-0 sm:p-0",
          liquidGlass
        )}
      >
        <DialogHeader className="space-y-1.5 border-b border-white/40 px-5 py-4 pr-12 text-left dark:border-white/10">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <DialogTitle className="flex items-center gap-2 text-lg">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-teal-100 text-teal-800 dark:bg-teal-500/20 dark:text-teal-100">
                <Boxes className="h-4 w-4" aria-hidden="true" />
              </span>
              Multi-Product Packs
            </DialogTitle>
            <Button type="button" size="sm" onClick={openCreate}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              New Pack
            </Button>
          </div>
          <DialogDescription>
            Bundle different products at a custom customer price with extra franchise margin.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 overflow-y-auto px-5 py-4">
          {isLoading && (
            <div className="space-y-2" aria-busy="true">
              <Skeleton className="h-20 w-full rounded-xl" />
              <Skeleton className="h-20 w-full rounded-xl" />
            </div>
          )}

          {isError && (
            <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:border-rose-500/30 dark:bg-rose-950/30 dark:text-rose-200">
              {(error as Error)?.message}
            </p>
          )}

          {!isLoading && !isError && packs.length === 0 && (
            <div className="rounded-xl border border-dashed bg-background/50 px-4 py-10 text-center text-sm text-muted-foreground">
              No multi-product packs yet. Click &ldquo;New Pack&rdquo; to bundle products together.
            </div>
          )}

          {packs.map((pack) => {
            const breakdown = computeMultiPackBreakdown({
              packPrice: pack.pack_price,
              marginType: pack.margin_type,
              marginValue: pack.margin_value,
              items: (pack.items ?? []).map((it) => {
                const p = it.product ?? productMap.get(it.product_id);
                return {
                  productId: it.product_id,
                  quantity: it.quantity,
                  unitPrice: p?.price ?? 0,
                  unitFranchisePrice: p?.franchise_price ?? 0,
                };
              }),
            });

            return (
              <div
                key={pack.ID}
                className="space-y-2.5 rounded-xl border bg-background/70 p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold">{pack.name}</span>
                      <Badge
                        variant="outline"
                        className="border-teal-300 bg-teal-100/80 text-teal-900 tabular-nums dark:border-teal-500/30 dark:bg-teal-500/20 dark:text-teal-100"
                      >
                        {formatDzd(pack.pack_price)}
                      </Badge>
                      {!pack.is_active && (
                        <Badge variant="secondary" className="text-[10px]">
                          Inactive
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {(pack.items ?? []).map((it) => {
                        const p = it.product ?? productMap.get(it.product_id);
                        return (
                          <Badge
                            key={`${pack.ID}-${it.product_id}`}
                            variant="secondary"
                            className="font-normal tabular-nums"
                          >
                            {it.quantity}× {p?.name ?? `Product #${it.product_id}`}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={pack.is_active}
                      onCheckedChange={(checked) =>
                        toggleMut.mutate({ id: pack.ID, is_active: checked })
                      }
                      aria-label={`Toggle ${pack.name} active`}
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      aria-label={`Edit ${pack.name}`}
                      onClick={() => openEdit(pack)}
                    >
                      <Pencil className="h-4 w-4" aria-hidden="true" />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      aria-label={`Delete ${pack.name}`}
                      onClick={() => setDeletingPack(pack)}
                    >
                      <Trash2
                        className="h-4 w-4 text-rose-600 dark:text-rose-400"
                        aria-hidden="true"
                      />
                    </Button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 border-t pt-2 text-xs text-muted-foreground tabular-nums">
                  <span>
                    Normal retail:{" "}
                    <strong className="text-foreground">
                      {formatDzd(breakdown.normalRetailTotal)}
                    </strong>
                  </span>
                  <span>
                    Franchise margin:{" "}
                    <strong className="text-teal-700 dark:text-teal-300">
                      {formatDzd(breakdown.totalMargin)} ({breakdown.totalMarginPct.toFixed(2)}%)
                    </strong>
                    {breakdown.extraMargin > 0 && (
                      <>
                        {" "}
                        (incl. +{formatDzd(breakdown.extraMargin)} / +
                        {breakdown.extraMarginPct.toFixed(2)}% extra)
                      </>
                    )}
                  </span>
                  <span>
                    Franchise pays:{" "}
                    <strong className="text-foreground">
                      {formatDzd(breakdown.packFranchiseTotal)}
                    </strong>
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <DialogFooter className="border-t border-white/40 px-5 py-3 dark:border-white/10">
          <Button
            type="button"
            variant="outline"
            className="bg-background"
            onClick={() => setOpen(false)}
          >
            Done
          </Button>
        </DialogFooter>

        {/* Create / Edit Multi-Product Pack Dialog */}
        <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
          <DialogContent
            className={cn(
              "flex max-h-[90vh] max-w-3xl flex-col gap-0 overflow-hidden p-0 sm:p-0",
              liquidGlass
            )}
          >
            <DialogHeader className="border-b border-white/40 px-5 py-4 pr-12 text-left dark:border-white/10">
              <DialogTitle>
                {editingPack ? `Edit Pack · ${editingPack.name}` : "Create Multi-Product Pack"}
              </DialogTitle>
              <DialogDescription>
                Combine products, set the pack customer price, and add extra margin for the franchise.
              </DialogDescription>
            </DialogHeader>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!canSubmit) return;
                saveMut.mutate({
                  name: formState.name.trim(),
                  pack_price: Number(formState.pack_price),
                  margin_type: formState.margin_type,
                  margin_value: Math.max(0, Number(formState.margin_value) || 0),
                  is_active: formState.is_active,
                  items: validSelectedItems,
                });
              }}
              className="flex min-h-0 flex-1 flex-col"
            >
              <div className="space-y-4 overflow-y-auto px-5 py-4">
                <div className="grid grid-cols-1 gap-3 rounded-xl border bg-background/60 p-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="pack-name">Pack Name</Label>
                    <Input
                      id="pack-name"
                      placeholder="e.g. Summer Duo"
                      value={formState.name}
                      onChange={(e) =>
                        setFormState((prev) => ({ ...prev, name: e.target.value }))
                      }
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="pack-price">Pack Customer Price (DZD)</Label>
                    <Input
                      id="pack-price"
                      type="number"
                      min={1}
                      placeholder="e.g. 8500"
                      value={formState.pack_price}
                      onChange={(e) =>
                        setFormState((prev) => ({
                          ...prev,
                          pack_price: e.target.value,
                        }))
                      }
                      className="bg-background tabular-nums"
                    />
                  </div>
                  <div className="flex items-end justify-between gap-2 rounded-lg border bg-background px-3 py-2">
                    <Label htmlFor="pack-active" className="cursor-pointer">
                      Active
                    </Label>
                    <Switch
                      id="pack-active"
                      checked={formState.is_active}
                      onCheckedChange={(checked) =>
                        setFormState((prev) => ({ ...prev, is_active: checked }))
                      }
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <Label>Extra Margin Unit</Label>
                    <div
                      role="group"
                      aria-label="Extra margin unit"
                      className="grid grid-cols-2 rounded-lg border bg-muted p-0.5"
                    >
                      {(
                        [
                          { value: "fixed", label: "DZD (per pack)" },
                          { value: "percent", label: "% of Franchise Price" },
                        ] as const
                      ).map((opt) => {
                        const active = formState.margin_type === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            aria-pressed={active}
                            onClick={() =>
                              setFormState((prev) => ({
                                ...prev,
                                margin_type: opt.value,
                              }))
                            }
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
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="pack-margin-val">
                      Extra Margin ({formState.margin_type === "percent" ? "%" : "DZD"})
                    </Label>
                    <Input
                      id="pack-margin-val"
                      type="number"
                      min={0}
                      value={formState.margin_value}
                      onChange={(e) =>
                        setFormState((prev) => ({
                          ...prev,
                          margin_value: e.target.value,
                        }))
                      }
                      className="bg-background tabular-nums"
                    />
                  </div>
                </div>

                {/* Bundle Products */}
                <div className="space-y-2.5 rounded-xl border bg-background/60 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Products in Pack ({totalSelectedUnits} total units)
                    </span>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="bg-background"
                      onClick={() =>
                        setFormState((prev) => ({
                          ...prev,
                          items: [...prev.items, { product_id: 0, quantity: 1 }],
                        }))
                      }
                    >
                      <Plus className="h-4 w-4" aria-hidden="true" />
                      Add Product
                    </Button>
                  </div>

                  {hasDuplicateProducts && (
                    <p className="text-xs text-rose-600 dark:text-rose-400">
                      Each product can appear only once; increase its quantity instead.
                    </p>
                  )}

                  <div className="space-y-2">
                    {formState.items.map((row, idx) => (
                      <div
                        key={idx}
                        className="grid grid-cols-1 gap-2 rounded-lg border bg-background/80 p-2.5 sm:grid-cols-[1fr_7rem_auto] sm:items-end"
                      >
                        <div className="space-y-1">
                          <Label>Product</Label>
                          <Select
                            value={row.product_id ? String(row.product_id) : "none"}
                            onValueChange={(val) => {
                              const pid = val === "none" ? 0 : Number(val);
                              setFormState((prev) => {
                                const next = [...prev.items];
                                next[idx] = { ...next[idx], product_id: pid };
                                return { ...prev, items: next };
                              });
                            }}
                          >
                            <SelectTrigger className="w-full bg-background">
                              <SelectValue placeholder="Select product..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Select product...</SelectItem>
                              {products.map((p) => (
                                <SelectItem key={p.ID} value={String(p.ID)}>
                                  {p.name} ({formatDzd(p.price)} / FP{" "}
                                  {formatDzd(p.franchise_price)})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-1">
                          <Label>Quantity</Label>
                          <Input
                            type="number"
                            min={1}
                            value={row.quantity}
                            onChange={(e) => {
                              const qty = Math.max(1, Number(e.target.value) || 1);
                              setFormState((prev) => {
                                const next = [...prev.items];
                                next[idx] = { ...next[idx], quantity: qty };
                                return { ...prev, items: next };
                              });
                            }}
                            className="bg-background tabular-nums"
                          />
                        </div>

                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          disabled={formState.items.length <= 1}
                          aria-label={`Remove product row ${idx + 1}`}
                          onClick={() =>
                            setFormState((prev) => ({
                              ...prev,
                              items: prev.items.filter((_, i) => i !== idx),
                            }))
                          }
                          className="text-muted-foreground hover:text-rose-600"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Live Margin Preview */}
                {previewBreakdown && (
                  <div className="space-y-3 rounded-xl border border-teal-300/60 bg-teal-50/60 p-4 text-xs dark:border-teal-500/30 dark:bg-teal-950/20">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-semibold text-teal-950 dark:text-teal-100">
                        Live Bundle Margin Preview (vs{" "}
                        {formatDzd(previewBreakdown.normalFranchiseTotal)} franchise price)
                      </span>
                      <span className="text-muted-foreground tabular-nums">
                        Customer saves{" "}
                        <strong className="text-foreground">
                          {formatDzd(
                            previewBreakdown.normalRetailTotal -
                              previewBreakdown.packPrice
                          )}
                        </strong>
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      <div className="rounded-lg border bg-background/80 p-2">
                        <div className="text-[11px] text-muted-foreground">
                          Base Pack Margin
                        </div>
                        <div className="font-semibold tabular-nums">
                          {formatDzd(previewBreakdown.baseMargin)} (
                          {previewBreakdown.baseMarginPct.toFixed(2)}%)
                        </div>
                      </div>
                      <div className="rounded-lg border bg-background/80 p-2">
                        <div className="text-[11px] text-muted-foreground">
                          Extra Margin
                        </div>
                        <div className="font-semibold text-teal-700 tabular-nums dark:text-teal-300">
                          +{formatDzd(previewBreakdown.extraMargin)} (+
                          {previewBreakdown.extraMarginPct.toFixed(2)}%)
                        </div>
                      </div>
                      <div className="rounded-lg border bg-background/80 p-2">
                        <div className="text-[11px] text-muted-foreground">
                          Total Franchise Margin
                        </div>
                        <div className="font-semibold tabular-nums">
                          {formatDzd(previewBreakdown.totalMargin)} (
                          {previewBreakdown.totalMarginPct.toFixed(2)}%)
                        </div>
                      </div>
                      <div className="rounded-lg border bg-background/80 p-2">
                        <div className="text-[11px] text-muted-foreground">
                          Effective Franchise Total
                        </div>
                        <div className="font-semibold tabular-nums">
                          {formatDzd(previewBreakdown.packFranchiseTotal)}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1 border-t pt-2">
                      <p className="font-medium text-muted-foreground">
                        Allocated sale_items preview:
                      </p>
                      <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                        {previewBreakdown.allocatedItems.map((alloc) => {
                          const p = productMap.get(alloc.productId);
                          return (
                            <div
                              key={alloc.productId}
                              className="flex items-center justify-between rounded-md border bg-background/70 px-2.5 py-1.5 tabular-nums"
                            >
                              <span className="truncate font-medium">
                                {alloc.quantity}× {p?.name}
                              </span>
                              <span className="shrink-0 text-muted-foreground">
                                Price {formatDzd(alloc.allocatedPriceTotal)} · FP{" "}
                                {formatDzd(alloc.allocatedFranchiseTotal)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter className="border-t border-white/40 px-5 py-3 dark:border-white/10">
                <Button
                  type="button"
                  variant="outline"
                  className="bg-background"
                  onClick={() => setEditorOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={!canSubmit}>
                  {saveMut.isPending && (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  )}
                  {editingPack ? "Save Pack" : "Create Pack"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Pack Confirmation Dialog */}
        <Dialog
          open={Boolean(deletingPack)}
          onOpenChange={(next) => !next && setDeletingPack(null)}
        >
          <DialogContent
            className={cn(
              "flex max-w-md flex-col gap-0 overflow-hidden p-0 sm:p-0",
              liquidGlass
            )}
          >
            <DialogHeader className="border-b border-white/40 px-5 py-4 pr-12 text-left dark:border-white/10">
              <DialogTitle>Delete &ldquo;{deletingPack?.name}&rdquo;?</DialogTitle>
              <DialogDescription>
                Future sales will no longer apply this bundle pack. Past sales remain unchanged.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="px-5 py-4">
              <Button
                type="button"
                variant="outline"
                className="bg-background"
                autoFocus
                disabled={deleteMut.isPending}
                onClick={() => setDeletingPack(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={deleteMut.isPending}
                onClick={() => deletingPack && deleteMut.mutate(deletingPack.ID)}
              >
                {deleteMut.isPending && (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                )}
                Delete Pack
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}

