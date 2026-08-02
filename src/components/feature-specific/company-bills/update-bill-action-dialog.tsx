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
import { useEffect, useState, type KeyboardEvent, type ReactNode } from "react";
import { useFieldArray, useForm } from "react-hook-form";

interface Props {
  bill: ExitBill;
  /** Controlled open state (e.g. from Prepare Exit Bill dialog). */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Custom trigger; when omitted and uncontrolled, uses dropdown "Update Bill". */
  trigger?: ReactNode;
  /** Called after a successful save with the request payload context. */
  onUpdated?: () => void;
  /** Hide the default dropdown trigger (use with controlled open). */
  hideDefaultTrigger?: boolean;
}

export default function UpdateBillActionDialog({
  bill,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  trigger,
  onUpdated,
  hideDefaultTrigger,
}: Props) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled =
    controlledOpen !== undefined && controlledOnOpenChange !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? controlledOnOpenChange : setInternalOpen;

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: inventoryData } = useQuery({
    queryKey: ["company-inventory", bill.company_id],
    queryFn: () => getCompanyInventory(bill.company_id),
    enabled: !!bill.company_id && open,
  });
  const inventoryItems = inventoryData?.data?.items ?? [];

  const [qrInput, setQrInput] = useState("");

  function toFormItems(items: BillItemModel[]) {
    return items.map((item) => ({
      id: item.id,
      product_variant_id: item.product_variant_id,
      quantity: item.quantity,
    }));
  }

  const qrCodeMap = inventoryItems.reduce(
    (acc: Record<number, string>, item: { product_variant_id?: number; product_variant?: { qr_code?: string } }) => {
      if (item.product_variant_id && item.product_variant?.qr_code) {
        acc[item.product_variant_id] = item.product_variant.qr_code;
      }
      return acc;
    },
    {}
  );

  // Prefer bill item QR codes when inventory map is incomplete
  for (const item of bill.bill_items ?? []) {
    const code = item.product_variant?.qr_code;
    if (code && !qrCodeMap[item.product_variant_id]) {
      qrCodeMap[item.product_variant_id] = code;
    }
  }

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

  useEffect(() => {
    if (!open) return;
    form.reset({
      exit_bill_id: bill.ID,
      franchise_id: bill.franchise_id,
      company_id: bill.company_id,
      bill_items: toFormItems(bill.bill_items),
    });
    setQrInput("");
  }, [open, bill.ID, bill.bill_items, bill.company_id, bill.franchise_id, form]);

  const { mutate, isPending } = useMutation({
    mutationFn: updateExitBill,
    onSuccess: () => {
      toast({ title: "Bill updated", description: "Bill was updated successfully" });
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["exit_bills"] });
      queryClient.invalidateQueries({ queryKey: ["preparing-exit-bills"] });
      queryClient.invalidateQueries({ queryKey: ["franchise-exit-bills"] });
      queryClient.invalidateQueries({ queryKey: ["company-missing-variants"] });
      queryClient.invalidateQueries({ queryKey: ["franchise-missing-variants"] });
      onUpdated?.();
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating bill",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleQrInput = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const code = qrInput.trim();
    if (!code) return;

    const fromInventory = inventoryItems.find(
      (i: { product_variant?: { qr_code?: string }; product_variant_id?: number }) =>
        i.product_variant?.qr_code === code
    );
    const fromBill = bill.bill_items.find(
      (i) => i.product_variant?.qr_code === code
    );
    const productVariantId =
      fromInventory?.product_variant_id ?? fromBill?.product_variant_id;

    if (!productVariantId) {
      toast({
        title: "Not found",
        description: "No product with this QR code.",
        variant: "destructive",
      });
      return;
    }

    const existingIdx = fields.findIndex(
      (f) => f.product_variant_id === productVariantId
    );
    if (existingIdx !== -1) {
      const updated = [...fields];
      updated[existingIdx] = {
        ...updated[existingIdx],
        quantity: updated[existingIdx].quantity + 1,
      };
      const [moved] = updated.splice(existingIdx, 1);
      updated.unshift(moved);
      form.setValue("bill_items", updated);
    } else {
      form.setValue("bill_items", [
        { product_variant_id: productVariantId, quantity: 1 },
        ...fields,
      ]);
    }
    setQrInput("");
  };

  const showDefaultTrigger = !hideDefaultTrigger && !isControlled && !trigger;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      {showDefaultTrigger && (
        <DialogTrigger asChild>
          <DropdownMenuItem
            onSelect={(e) => e.preventDefault()}
            onClick={() => setOpen(true)}
          >
            <Pencil /> Update Bill
          </DropdownMenuItem>
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogTitle>Edit Bill Items — EXB-{bill.ID}</DialogTitle>
        <div className="mb-4 p-3 rounded bg-muted text-sm flex flex-col gap-1">
          <div>
            <span className="font-semibold">Bill ID:</span> {bill.ID}
          </div>
          <div>
            <span className="font-semibold">To Franchise:</span>{" "}
            {bill.franchise?.name || "-"}
          </div>
          <div>
            <span className="font-semibold">Created At:</span>{" "}
            {bill.CreatedAt ? new Date(bill.CreatedAt).toLocaleString() : "-"}
          </div>
        </div>
        <form
          onSubmit={form.handleSubmit((data) => {
            mutate({
              ...data,
              bill_items: data.bill_items.map(
                ({ id, product_variant_id, quantity }) => ({
                  id,
                  product_variant_id,
                  quantity,
                })
              ),
            });
          })}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1 mb-2">
            <label htmlFor="qr-input" className="text-sm font-medium">
              Insert product QR code
            </label>
            <Input
              id="qr-input"
              value={qrInput}
              onChange={(e) => setQrInput(e.target.value)}
              placeholder="Scan or enter QR code..."
              onKeyDown={handleQrInput}
              autoFocus
              disabled={isPending}
            />
          </div>
          <div className="overflow-x-auto max-h-[360px]">
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
                    <td className="px-2 py-1 border text-center">
                      {qrCodeMap[field.product_variant_id] || "-"}
                    </td>
                    <td className="px-2 py-1 border text-center">
                      <Input
                        type="number"
                        min={1}
                        value={field.quantity}
                        onChange={(e) => {
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
                    <td
                      colSpan={3}
                      className="text-center py-2 text-muted-foreground"
                    >
                      No items in bill
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              type="button"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
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
