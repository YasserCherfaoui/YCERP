import { LittleToast } from "@/hooks/use-toast";
import { BillItem } from "@/models/data/bill.model";
import { Inventory } from "@/models/data/inventory.model";
import { APIResponse } from "@/models/responses/api-response.model";


interface Props {
    inventory: APIResponse<Inventory>;
    input: string;
    billItems: BillItem[];
    setBillItems: React.Dispatch<React.SetStateAction<BillItem[]>>;
    toast: LittleToast;
    setInput: React.Dispatch<React.SetStateAction<string>>;
    barcodes: string[];
}
export const processBarcodeSupplier = ({inventory, input, billItems, setBillItems, toast, setInput, barcodes}: Props) => {

    if (barcodes.includes(input)) {
      const item = inventory!.data!.items.find(
        (item) => item.product_variant?.qr_code === input
      );
      if (item) {
        const existingItemIndex = billItems.findIndex(
          (billItem) => billItem.product_variant_id === item.product_variant?.ID
        );
        if (existingItemIndex !== -1) {
          const updatedBillItems = [...billItems];
          updatedBillItems[existingItemIndex].quantity += 1;
          updatedBillItems[existingItemIndex].price +=
            item.product?.first_price ?? 0;
          setBillItems(updatedBillItems);
        } else {
          setBillItems([
            ...billItems,
            {
              product_variant_id: item.product_variant?.ID ?? 0,
              variant_name:
                inventory?.data?.items.find(
                  (e) => e.product_variant?.qr_code == input
                )?.name ?? "",
              quantity: 1,
              qr_code: input,
              price:
                inventory?.data?.items.find(
                  (e) => e.product_variant?.qr_code == input
                )?.product?.first_price ?? 0,
            },
          ]);
        }
      }

      toast({
        title: "Product Added",
        description: `Product has been added to the list`,
      });
    } else {
      toast({
        variant: "destructive",
        title: "Barcode Not Found",
        description: "The scanned barcode is not recognized",
      });
    }
    setInput(""); // Clear input after processing
  };