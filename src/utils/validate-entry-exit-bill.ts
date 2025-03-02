import { BillItem, BillItemModel } from "@/models/data/bill.model";


interface ValidateEntryExitBillProps {
    entryItems: BillItem[],
    exitItems: BillItemModel[],
}

function validateMissingEntryExitBill({ entryItems, exitItems }: ValidateEntryExitBillProps): BillItem[] {
    const missingItems: BillItem[] = [];
    for (const exitItem of exitItems) {
        const entryItem = entryItems.find(
            (item) => item.product_variant_id === exitItem.product_variant_id
        );
        if (exitItem.product_variant.product) {
            if (!entryItem) {
                missingItems.push({
                    product_variant_id: exitItem.product_variant_id,
                    quantity: exitItem.quantity,
                    qr_code: exitItem.product_variant.qr_code,
                    variant_name: exitItem.product_variant.qr_code,
                    price: exitItem.product_variant.product.franchise_price * exitItem.quantity,
                });
            } else if (entryItem.quantity < exitItem.quantity) {
                missingItems.push({
                    product_variant_id: exitItem.product_variant_id,
                    quantity: exitItem.quantity - entryItem.quantity,
                    qr_code: exitItem.product_variant.qr_code,
                    variant_name: exitItem.product_variant.qr_code,
                    price: exitItem.product_variant.product.franchise_price * (exitItem.quantity - entryItem.quantity),
                });
            }
        }
    }
    return missingItems;

}

interface ValidateExtraEntryExitBillProps {
    entryItems: BillItem[],
    exitItems: BillItemModel[],

}

function validateExtraEntryExitBill(
    { entryItems, exitItems }: ValidateExtraEntryExitBillProps
): BillItem[] {
    const extraItems: BillItem[] = [];
    for (const entryItem of entryItems) {
        const exitItem = exitItems.find(
            (item) => item.product_variant_id === entryItem.product_variant_id
        );
        if (!exitItem) {
            extraItems.push(entryItem);
        } else if (entryItem.quantity > exitItem.quantity) {
            extraItems.push({
                product_variant_id: entryItem.product_variant_id,
                quantity: entryItem.quantity - exitItem.quantity,
                qr_code: entryItem.qr_code,
                variant_name: entryItem.variant_name,
                price: entryItem.price / entryItem.quantity * (entryItem.quantity - exitItem.quantity),
            });
        }
    }
    return extraItems;
}

export { validateExtraEntryExitBill, validateMissingEntryExitBill };

