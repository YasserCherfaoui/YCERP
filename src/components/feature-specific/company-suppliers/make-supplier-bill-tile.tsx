import { Button } from "@/components/ui/button";
import { BillItem } from "@/models/data/bill.model";
import { InventoryItem } from "@/models/data/inventory.model";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Dispatch, SetStateAction } from "react";

interface Props {
  billItem: BillItem;
  billItems: Array<BillItem>;
  setBillItems: Dispatch<SetStateAction<Array<BillItem>>>;
  items: Array<InventoryItem>;
}

export default function ({ billItem, billItems, setBillItems, items }: Props) {
  const matchedItem = items.find(
    (e) => e.product_variant?.ID == billItem.product_variant_id
  );
  const qrCode = matchedItem?.product_variant?.qr_code || billItem.qr_code;
  const unitPrice = matchedItem?.product?.first_price ?? 0;

  return (
    <li className="flex text-xl justify-between items-center p-2 gap-2">
      <div className="flex flex-col min-w-0">
        <span className="text-white truncate">{billItem.variant_name}</span>
        {qrCode && (
          <span className="text-lg font-semibold text-white font-mono">
            {qrCode}
          </span>
        )}
      </div>
      <div className="flex gap-2    ">
        <span className="flex gap-2 items-center">
          Qty:{" "}
          <Button
            onClick={() => {
              const existingItemIndex = billItems.findIndex(
                (e) => e.product_variant_id === billItem.product_variant_id
              );
              if (existingItemIndex !== -1) {
                const updatedBillItems = [...billItems];
                if (updatedBillItems[existingItemIndex].quantity > 1) {
                  updatedBillItems[existingItemIndex].quantity -= 1;
                  updatedBillItems[existingItemIndex].price -= unitPrice;
                  setBillItems(updatedBillItems);
                } else {
                  setBillItems(
                    billItems.filter(
                      (e) =>
                        e.product_variant_id !== billItem.product_variant_id
                    )
                  );
                }
              }
            }}
          >
            <Minus />
          </Button>{" "}
          <input
            type="number"
            className="w-12 text-center bg-background border rounded"
            value={billItem.quantity}
            min="1"
            onChange={(e) => {
              const newQuantity = parseInt(e.target.value) || 1;
              const existingItemIndex = billItems.findIndex(
                (item) =>
                  item.product_variant_id === billItem.product_variant_id
              );
              if (existingItemIndex !== -1) {
                const updatedBillItems = [...billItems];
                const oldQuantity =
                  updatedBillItems[existingItemIndex].quantity;
                updatedBillItems[existingItemIndex].quantity = newQuantity;

                updatedBillItems[existingItemIndex].price +=
                  unitPrice * (newQuantity - oldQuantity);
                setBillItems(updatedBillItems);
              }
            }}
          />{" "}
          <Button
            onClick={() => {
              const existingItemIndex = billItems.findIndex(
                (e) => e.product_variant_id === billItem.product_variant_id
              );
              if (existingItemIndex !== -1) {
                const updatedBillItems = [...billItems];
                updatedBillItems[existingItemIndex].quantity += 1;
                updatedBillItems[existingItemIndex].price += unitPrice;
                setBillItems(updatedBillItems);
              }
            }}
          >
            <Plus />
          </Button>{" "}
        </span>
        <Button
          onClick={() => {
            setBillItems(
              billItems.filter(
                (e) => e.product_variant_id !== billItem.product_variant_id
              )
            );
          }}
          variant={"destructive"}
        >
          <Trash2 />
        </Button>
      </div>
    </li>
  );
}
