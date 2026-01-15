import { LittleToast } from "@/hooks/use-toast";
import { Inventory } from "@/models/data/inventory.model";
import { APIResponse } from "@/models/responses/api-response.model";

export interface BrokenItemEntry {
    qr_code: string;
    product_variant_id: number;
    product_variant_name?: string;
    quantity: number;
    reason?: string;
}

interface Props {
    inventory: APIResponse<Inventory>;
    input: string;
    brokenItems: BrokenItemEntry[];
    setBrokenItems: React.Dispatch<React.SetStateAction<BrokenItemEntry[]>>;
    toast: LittleToast;
    setInput: React.Dispatch<React.SetStateAction<string>>;
    barcodes: string[];
}

export const processBrokenItemBarcode = ({
    inventory,
    input,
    brokenItems,
    setBrokenItems,
    toast,
    setInput,
    barcodes,
}: Props) => {
    if (barcodes.includes(input)) {
        const item = inventory!.data!.items.find(
            (item) => item.product_variant?.qr_code === input
        );
        if (item && item.product_variant) {
            const existingItemIndex = brokenItems.findIndex(
                (brokenItem) => brokenItem.product_variant_id === item.product_variant?.ID
            );
            if (existingItemIndex !== -1) {
                // Increment quantity if item already exists
                const updatedItems = [...brokenItems];
                updatedItems[existingItemIndex].quantity += 1;
                setBrokenItems(updatedItems);
            } else {
                // Add new item
                setBrokenItems([
                    ...brokenItems,
                    {
                        qr_code: input,
                        product_variant_id: item.product_variant.ID,
                        product_variant_name: item.product_variant.name || item.name,
                        quantity: 1,
                    },
                ]);
            }

            toast({
                title: "Product Added",
                description: `Product has been added to broken items list`,
            });
        }
    } else {
        toast({
            variant: "destructive",
            title: "Barcode Not Found",
            description: "The scanned barcode is not recognized in this inventory",
        });
    }
    setInput(""); // Clear input after processing
};
