
export default interface CreateProductRequest {
    companyID: number;
    name: string;
    firstPrice: number;
    franchisePrice: number;
    price: number;
    description: string;
    images: string[];
    sizes: string[];
    colors: string[];
}