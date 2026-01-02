import { LittleToast } from "@/hooks/use-toast";
import { Inventory } from "@/models/data/inventory.model";
import { SaleItemEntity } from "@/models/data/sale.model";
import { APIResponse } from "@/models/responses/api-response.model";


interface Props {
    inventory: APIResponse<Inventory>;
    input: string;
    saleItems: SaleItemEntity[];
    setSaleItems: React.Dispatch<React.SetStateAction<SaleItemEntity[]>>;
    toast: LittleToast;
    setInput: React.Dispatch<React.SetStateAction<string>>;
    barcodes: string[];
    getDefaultPrice?: (item: any) => number;
}

export const processSaleBarcode = (
    {
        inventory,
        input,
        saleItems,
        setSaleItems,
        toast,
        setInput,
        barcodes,
        getDefaultPrice
    }: Props
) => {
    if (barcodes.includes(input)) {
        const item = inventory!.data!.items.find(
            (item) => item.product_variant?.qr_code === input
        );
        if (item) {
            const existingItemIndex = saleItems.findIndex(
                (saleItem) => saleItem.product_variant_id === item.product_variant?.ID
            );
            if (existingItemIndex !== -1) {
                const updatedSaleItems = [...saleItems];
                updatedSaleItems[existingItemIndex].quantity += 1;
                setSaleItems(updatedSaleItems);
            } else {
                const defaultPrice = getDefaultPrice ? getDefaultPrice(item) : (item.product?.price ?? 0);
                setSaleItems([
                    ...saleItems,
                    {
                        product_variant_id: item.product_variant?.ID ?? 0,
                        variant_qr_code: input,
                        price: defaultPrice,
                        quantity: 1,
                        discount: 0,
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
