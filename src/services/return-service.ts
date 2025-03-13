import { baseUrl } from "@/app/constants";
import { CreateSaleReturnSchema } from "@/schemas/return-schema";


export const createReturnSale = async (data: CreateSaleReturnSchema) => {
    const response = await fetch(`${baseUrl}/returns`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create return.");
    }

    const createdReturn = await response.json();
    return createdReturn;
}
