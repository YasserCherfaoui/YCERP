
import { ChangeEvent } from "react";

function sanitizedInput(e: ChangeEvent<HTMLInputElement>, product: { totalQuantity: number }, field: { onChange: (value: number) => void }) {
    const rawValue = e.target.value;
    const sanitizedValue = rawValue.replace(/[^0-9]/g, ''); // Remove non-digits
    const numericValue = Math.min(
        product.totalQuantity, // Assuming product has a totalQuantity property
        Math.max(0, parseInt(sanitizedValue || '0', 10))
    );
    field.onChange(numericValue);
    e.target.value = numericValue.toString(); // Force immediate update
}
export { sanitizedInput };
