import { liquidGlass } from "@/components/feature-specific/crm/crm-theme";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { ProductCategory } from "@/models/data/product.model";
import {
  createProductCategory,
  deleteProductCategory,
  listProductCategories,
  updateProductCategory,
} from "@/services/product-service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FolderTree, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

interface ManageProductCategoriesDialogProps {
  companyId: number;
}

export function ManageProductCategoriesDialog({
  companyId,
}: ManageProductCategoriesDialogProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [editing, setEditing] = useState<ProductCategory | null>(null);
  const [editName, setEditName] = useState("");
  const [editSortOrder, setEditSortOrder] = useState("0");
  const [deleting, setDeleting] = useState<ProductCategory | null>(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["product-categories", companyId],
    queryFn: () => listProductCategories(companyId),
    enabled: open && !!companyId,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["product-categories", companyId] });
    queryClient.invalidateQueries({ queryKey: ["products"] });
  };

  const createMut = useMutation({
    mutationFn: () =>
      createProductCategory(companyId, {
        name: name.trim(),
        sort_order: Number(sortOrder) || 0,
        is_active: true,
      }),
    onSuccess: () => {
      toast({ description: "Category created" });
      setName("");
      setSortOrder("0");
      invalidate();
    },
    onError: (err: Error) => {
      toast({
        title: "Failed to create category",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const updateMut = useMutation({
    mutationFn: (payload: {
      id: number;
      data: { name?: string; sort_order?: number; is_active?: boolean };
    }) => updateProductCategory(payload.id, payload.data),
    onSuccess: () => {
      toast({ description: "Category updated" });
      setEditing(null);
      invalidate();
    },
    onError: (err: Error) => {
      toast({
        title: "Failed to update category",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => deleteProductCategory(id),
    onSuccess: () => {
      toast({ description: "Category deleted" });
      setDeleting(null);
      invalidate();
    },
    onError: (err: Error) => {
      toast({
        title: "Failed to delete category",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const categories = data?.data ?? [];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" className="bg-background">
          <FolderTree className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">Categories</span>
        </Button>
      </DialogTrigger>
      <DialogContent
        className={cn(
          "flex max-h-[90vh] max-w-2xl flex-col gap-0 overflow-hidden p-0 sm:p-0",
          liquidGlass
        )}
      >
        <DialogHeader className="space-y-1.5 border-b border-white/40 px-5 py-4 pr-12 text-left dark:border-white/10">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-100">
              <FolderTree className="h-4 w-4" aria-hidden="true" />
            </span>
            Product Categories
          </DialogTitle>
          <DialogDescription>
            Organize catalog products and affiliate catalog filters.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 overflow-y-auto px-5 py-4">
          <form
            className="grid grid-cols-1 gap-2 rounded-xl border bg-background/60 p-3 sm:grid-cols-[1fr_7rem_auto] sm:items-end"
            onSubmit={(e) => {
              e.preventDefault();
              if (!name.trim()) return;
              createMut.mutate();
            }}
          >
            <div className="space-y-1.5">
              <Label htmlFor="new-category-name">New category</Label>
              <Input
                id="new-category-name"
                placeholder="Category name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-background"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-category-sort">Sort order</Label>
              <Input
                id="new-category-sort"
                type="number"
                placeholder="0"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="bg-background tabular-nums"
              />
            </div>
            <Button
              type="submit"
              disabled={createMut.isPending || !name.trim()}
            >
              {createMut.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Plus className="h-4 w-4" aria-hidden="true" />
              )}
              Add
            </Button>
          </form>

          {isLoading && (
            <div className="space-y-2" aria-busy="true">
              <Skeleton className="h-14 w-full rounded-xl" />
              <Skeleton className="h-14 w-full rounded-xl" />
            </div>
          )}

          {isError && (
            <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:border-rose-500/30 dark:bg-rose-950/30 dark:text-rose-200">
              {(error as Error)?.message}
            </p>
          )}

          {!isLoading && !isError && categories.length === 0 && (
            <div className="rounded-xl border border-dashed bg-background/40 px-4 py-8 text-center text-sm text-muted-foreground">
              No categories yet. Add your first category above.
            </div>
          )}

          <div className="space-y-2">
            {categories.map((category) => (
              <div
                key={category.ID}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-background/70 px-3.5 py-2.5 shadow-sm"
              >
                <div className="min-w-0 space-y-0.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-semibold">
                      {category.name}
                    </p>
                    {!category.is_active && (
                      <Badge variant="secondary" className="text-[10px]">
                        Inactive
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground tabular-nums">
                    Sort order: {category.sort_order}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={category.is_active}
                    onCheckedChange={(checked) =>
                      updateMut.mutate({
                        id: category.ID,
                        data: { is_active: checked },
                      })
                    }
                    aria-label={`Toggle ${category.name} active`}
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    aria-label={`Edit ${category.name}`}
                    onClick={() => {
                      setEditing(category);
                      setEditName(category.name);
                      setEditSortOrder(String(category.sort_order));
                    }}
                  >
                    <Pencil className="h-4 w-4" aria-hidden="true" />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    aria-label={`Delete ${category.name}`}
                    onClick={() => setDeleting(category)}
                  >
                    <Trash2
                      className="h-4 w-4 text-rose-600 dark:text-rose-400"
                      aria-hidden="true"
                    />
                  </Button>
                </div>
              </div>
            ))}
          </div>
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

        {/* Edit Category Dialog */}
        <Dialog
          open={Boolean(editing)}
          onOpenChange={(next) => !next && setEditing(null)}
        >
          <DialogContent
            className={cn(
              "flex max-w-md flex-col gap-0 overflow-hidden p-0 sm:p-0",
              liquidGlass
            )}
          >
            <DialogHeader className="border-b border-white/40 px-5 py-4 pr-12 text-left dark:border-white/10">
              <DialogTitle>Edit Category</DialogTitle>
              <DialogDescription>
                Update category name and display order.
              </DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!editing || !editName.trim()) return;
                updateMut.mutate({
                  id: editing.ID,
                  data: {
                    name: editName.trim(),
                    sort_order: Number(editSortOrder) || 0,
                  },
                });
              }}
            >
              <div className="space-y-3 px-5 py-4">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-category-name">Name</Label>
                  <Input
                    id="edit-category-name"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="bg-background"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-category-sort">Sort order</Label>
                  <Input
                    id="edit-category-sort"
                    type="number"
                    value={editSortOrder}
                    onChange={(e) => setEditSortOrder(e.target.value)}
                    className="bg-background tabular-nums"
                  />
                </div>
              </div>
              <DialogFooter className="border-t border-white/40 px-5 py-3 dark:border-white/10">
                <Button
                  type="button"
                  variant="outline"
                  className="bg-background"
                  onClick={() => setEditing(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!editName.trim() || updateMut.isPending}
                >
                  {updateMut.isPending && (
                    <Loader2
                      className="h-4 w-4 animate-spin"
                      aria-hidden="true"
                    />
                  )}
                  Save changes
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Category Confirmation Dialog */}
        <Dialog
          open={Boolean(deleting)}
          onOpenChange={(next) => !next && setDeleting(null)}
        >
          <DialogContent
            className={cn(
              "flex max-w-md flex-col gap-0 overflow-hidden p-0 sm:p-0",
              liquidGlass
            )}
          >
            <DialogHeader className="border-b border-white/40 px-5 py-4 pr-12 text-left dark:border-white/10">
              <DialogTitle>Delete "{deleting?.name}"?</DialogTitle>
              <DialogDescription>
                Products in this category will become uncategorized.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="px-5 py-4">
              <Button
                type="button"
                variant="outline"
                className="bg-background"
                autoFocus
                disabled={deleteMut.isPending}
                onClick={() => setDeleting(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={deleteMut.isPending}
                onClick={() => deleting && deleteMut.mutate(deleting.ID)}
              >
                {deleteMut.isPending && (
                  <Loader2
                    className="h-4 w-4 animate-spin"
                    aria-hidden="true"
                  />
                )}
                Delete Category
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}
