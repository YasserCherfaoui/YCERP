import { LittleToast } from "@/hooks/use-toast";
import { BillItem, BillItemModel } from "@/models/data/bill.model";
import React from "react";

interface ProcessPrepareBarcodeProps {
  input: string;
  exitItems: BillItemModel[];
  checkedItems: BillItem[];
  setCheckedItems: React.Dispatch<React.SetStateAction<BillItem[]>>;
  remainingByVariant: Map<number, number>;
  toast: LittleToast;
  setInput: React.Dispatch<React.SetStateAction<string>>;
}

/** Scan barcodes against exit-bill declared items (warehouse prepare flow). */
export function processPrepareBarcode({
  input,
  exitItems,
  checkedItems,
  setCheckedItems,
  remainingByVariant,
  toast,
  setInput,
}: ProcessPrepareBarcodeProps) {
  const code = input.trim();
  if (!code) return;

  const exitItem = exitItems.find(
    (item) => item.product_variant?.qr_code === code
  );

  if (!exitItem) {
    toast({
      variant: "destructive",
      title: "Barcode Not Found",
      description: "This barcode is not on the exit bill",
    });
    setInput("");
    return;
  }

  const remaining = remainingByVariant.get(exitItem.product_variant_id) ?? 0;
  if (remaining <= 0) {
    toast({
      variant: "destructive",
      title: "Quantity Exceeded",
      description: "All declared units for this variant are already checked",
    });
    setInput("");
    return;
  }

  const existingIndex = checkedItems.findIndex(
    (item) => item.product_variant_id === exitItem.product_variant_id
  );

  const variantName =
    exitItem.product_variant?.product
      ? `${exitItem.product_variant.product.name} — ${exitItem.product_variant.color}`
      : exitItem.product_variant?.qr_code ?? code;

  if (existingIndex !== -1) {
    const updated = [...checkedItems];
    updated[existingIndex] = {
      ...updated[existingIndex],
      quantity: updated[existingIndex].quantity + 1,
    };
    setCheckedItems(updated);
  } else {
    setCheckedItems([
      ...checkedItems,
      {
        product_variant_id: exitItem.product_variant_id,
        quantity: 1,
        qr_code: code,
        variant_name: variantName,
        price: 0,
      },
    ]);
  }

  toast({
    title: "Product Checked",
    description: variantName,
  });
  setInput("");
}
