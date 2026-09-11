import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { ProductCategory } from "@/models/data/product.model";
import {
  createProductCategory,
  deleteProductCategory,
  listProductCategories,
  updateProductCategory,
} from "@/services/product-service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FolderTree, Pencil, Plus, Trash2 } from "lucide-react";
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
      toast({ title: "Failed to create category", description: err.message, variant: "destructive" });
    },
  });

  const updateMut = useMutation({
    mutationFn: (payload: { id: number; data: { name?: string; sort_order?: number; is_active?: boolean } }) =>
      updateProductCategory(payload.id, payload.data),
    onSuccess: () => {
      toast({ description: "Category updated" });
      setEditing(null);
      invalidate();
    },
    onError: (err: Error) => {
      toast({ title: "Failed to update category", description: err.message, variant: "destructive" });
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => deleteProductCategory(id),
    onSuccess: () => {
      toast({ description: "Category deleted" });
      invalidate();
    },
    onError: (err: Error) => {
      toast({ title: "Failed to delete category", description: err.message, variant: "destructive" });
    },
  });

  const categories = data?.data ?? [];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <FolderTree className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Manage Categories</span>
          <span className="sm:hidden">Categories</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle>Product Categories</DialogTitle>
          <DialogDescription>
            Organize affiliate products. Categories appear as filters on My Links.
          </DialogDescription>
        </DialogHeader>
        <form
          className="flex flex-col gap-2 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim()) return;
            createMut.mutate();
          }}
        >
          <Input
            placeholder="Category name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            type="number"
            className="sm:w-28"
            placeholder="Order"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          />
          <Button type="submit" disabled={createMut.isPending || !name.trim()}>
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </form>
        {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {isError && <p className="text-sm text-destructive">{(error as Error)?.message}</p>}
        <div className="max-h-[50vh] overflow-y-auto space-y-2">
          {categories.length === 0 && !isLoading && (
            <p className="text-sm text-muted-foreground">No categories yet.</p>
          )}
          {categories.map((category) => (
            <div
              key={category.ID}
              className="flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2"
            >
              <div className="min-w-0">
                <p className="font-medium truncate">
                  {category.name}
                  {!category.is_active && (
                    <span className="ml-2 text-xs font-normal text-muted-foreground">(inactive)</span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">Sort {category.sort_order}</p>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={category.is_active}
                  onCheckedChange={(checked) =>
                    updateMut.mutate({ id: category.ID, data: { is_active: checked } })
                  }
                  aria-label={`Toggle ${category.name} active`}
                />
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label="Edit category"
                  onClick={() => {
                    setEditing(category);
                    setEditName(category.name);
                    setEditSortOrder(String(category.sort_order));
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label="Delete category"
                  onClick={() => {
                    if (window.confirm(`Delete "${category.name}"? Products in this category will become uncategorized.`)) {
                      deleteMut.mutate(category.ID);
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        <Dialog open={Boolean(editing)} onOpenChange={(next) => !next && setEditing(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Category</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Input
                placeholder="Name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
              <Input
                type="number"
                placeholder="Sort order"
                value={editSortOrder}
                onChange={(e) => setEditSortOrder(e.target.value)}
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditing(null)}>
                  Cancel
                </Button>
                <Button
                  disabled={!editName.trim() || updateMut.isPending}
                  onClick={() => {
                    if (!editing) return;
                    updateMut.mutate({
                      id: editing.ID,
                      data: {
                        name: editName.trim(),
                        sort_order: Number(editSortOrder) || 0,
                      },
                    });
                  }}
                >
                  Save
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}
