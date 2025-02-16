import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { deleteProducts } from "@/services/product-service";
import { Delete } from "lucide-react";
import { useState } from "react";

interface Props {
  selectedRows: number[];
}

export default function ({ selectedRows }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const handleRemove = async () => {
    setLoading(true);
    const response = await deleteProducts(selectedRows);
    if (response.error) {
      toast({
        title: "Error deleting product",
        description: response.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Product Deleted",
        description: "Product was deleted successfully!",
      });
    }
    setOpen(false);
    setLoading(false);
    location.reload()
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={selectedRows.length === 0} variant={"destructive"}>
          <Delete />
          Delete Product
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Delete Product?</DialogTitle>
        <DialogDescription>
          Are you sure you want to delete this product? This action cannot be
          undone.
        </DialogDescription>
        <DialogFooter>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button disabled={loading} onClick={handleRemove} variant={"destructive"}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
