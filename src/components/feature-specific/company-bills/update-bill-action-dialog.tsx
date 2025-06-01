import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { BillItemModel, ExitBill } from "@/models/data/bill.model";
import { updateExitBillSchema, UpdateExitBillSchema } from "@/schemas/bill";
import { updateExitBill } from "@/services/bill-service";
import { getCompanyInventory } from "@/services/inventory-service";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";

interface Props {
  bill: ExitBill;
}

export default function UpdateBillActionDialog({ bill }: Props) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch inventory for QR code lookup
  const { data: inventoryData } = useQuery({
    queryKey: ["company-inventory", bill.company_id],
    queryFn: () => getCompanyInventory(bill.company_id),
    enabled: !!bill.company_id,
  });
  const inventoryItems = inventoryData?.data?.items ?? [];

  // State for QR code input
  const [qrInput, setQrInput] = useState("");

  // Helper to convert bill items to form items
  function toFormItems(items: BillItemModel[]) {
    return items.map((item) => ({
      id: item.id,
      product_variant_id: item.product_variant_id,
      quantity: item.quantity,
    }));
  }

  // Build a map of product_variant_id to qr_code for display
  const qrCodeMap = inventoryItems.reduce((acc: Record<number, string>, item: any) => {
    if (item.product_variant_id && item.product_variant?.qr_code) {
      acc[item.product_variant_id] = item.product_variant.qr_code;
    }
    return acc;
  }, {});

  const form = useForm<UpdateExitBillSchema>({
    resolver: zodResolver(updateExitBillSchema),
    defaultValues: {
      exit_bill_id: bill.ID,
      franchise_id: bill.franchise_id,
      company_id: bill.company_id,
      bill_items: toFormItems(bill.bill_items),
    },
  });

  const { fields, update, remove } = useFieldArray({
    control: form.control,
    name: "bill_items",
    keyName: "fieldId",
  });

  const { mutate, isPending } = useMutation({
    mutationFn: updateExitBill,
    onSuccess: () => {
      toast({ title: "Bill updated", description: "Bill was updated successfully" });
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["exit_bills"] });
    },
    onError: (error: any) => {
      toast({ title: "Error updating bill", description: error.message, variant: "destructive" });
    },
  });

  // Handle QR code input
  const handleQrInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const code = qrInput.trim();
      if (!code) return;
      const item = inventoryItems.find((i: any) => i.product_variant?.qr_code === code);
      if (!item) {
        toast({ title: "Not found", description: "No product with this QR code.", variant: "destructive" });
        return;
      }
      const existingIdx = fields.findIndex(f => f.product_variant_id === item.product_variant_id);
      if (existingIdx !== -1) {
        // Increment quantity and move to top
        const updated = [...fields];
        updated[existingIdx] = { ...updated[existingIdx], quantity: updated[existingIdx].quantity + 1 };
        const [moved] = updated.splice(existingIdx, 1);
        updated.unshift(moved);
        form.setValue("bill_items", updated);
      } else {
        // Add new at top
        form.setValue("bill_items", [
          { product_variant_id: item.product_variant_id, quantity: 1 },
          ...fields,
        ]);
      }
      setQrInput("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <DropdownMenuItem
          onSelect={(e) => e.preventDefault()}
          onClick={() => setOpen(true)}
        >
          <Pencil /> Update Bill
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Edit Bill Items</DialogTitle>
        {/* Bill details summary */}
        <div className="mb-4 p-3 rounded bg-muted text-sm flex flex-col gap-1">
          <div><span className="font-semibold">Bill ID:</span> {bill.ID}</div>
          <div><span className="font-semibold">To Franchise:</span> {bill.franchise?.name || '-'}</div>
          <div><span className="font-semibold">Created At:</span> {bill.CreatedAt ? new Date(bill.CreatedAt).toLocaleString() : '-'}</div>
        </div>
        <form
          onSubmit={form.handleSubmit((data) => {
            mutate({
              ...data,
              bill_items: data.bill_items.map(({ id, product_variant_id, quantity }) => ({ id, product_variant_id, quantity })),
            });
          })}
          className="flex flex-col gap-4"
        >
          {/* QR code input */}
          <div className="flex flex-col gap-1 mb-2">
            <label htmlFor="qr-input" className="text-sm font-medium">Insert product QR code</label>
            <Input
              id="qr-input"
              value={qrInput}
              onChange={e => setQrInput(e.target.value)}
              placeholder="Scan or enter QR code..."
              onKeyDown={handleQrInput}
              autoFocus
              disabled={isPending}
            />
          </div>
          {/* Bill items table */}
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm">
              <thead>
                <tr className="bg-muted">
                  <th className="px-2 py-1 border">Product QR Code</th>
                  <th className="px-2 py-1 border">Quantity</th>
                  <th className="px-2 py-1 border">Remove</th>
                </tr>
              </thead>
              <tbody>
                {fields.map((field, idx) => (
                  <tr key={field.fieldId}>
                    <td className="px-2 py-1 border text-center">{qrCodeMap[field.product_variant_id] || "-"}</td>
                    <td className="px-2 py-1 border text-center">
                      <Input
                        type="number"
                        min={1}
                        value={field.quantity}
                        onChange={e => {
                          const val = Number(e.target.value);
                          if (val > 0) update(idx, { ...field, quantity: val });
                        }}
                        className="w-20 mx-auto"
                        disabled={isPending}
                      />
                    </td>
                    <td className="px-2 py-1 border text-center">
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => remove(idx)}
                        disabled={isPending}
                        size="icon"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {fields.length === 0 && (
                  <tr>
                    <td colSpan={3} className="text-center py-2 text-muted-foreground">No items in bill</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => setOpen(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button variant="default" type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 