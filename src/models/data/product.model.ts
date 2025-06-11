
export interface Product {
    ID: number;
    CreatedAt: string;
    UpdatedAt: string;
    DeletedAt?: string;
    name: string;
    first_price: number;
    franchise_price: number;
    price: number;
    description: string;
    images: ProductImage[];
    product_variants: ProductVariant[];

}

export interface ProductImage {
    ID: number;
    CreatedAt: string;
    UpdatedAt: string;
    DeletedAt?: string;
    product_id: number;
    image_url: string;
}

export interface ProductVariant {
    ID: number;
    CreatedAt: string;
    UpdatedAt: string;
    DeletedAt?: string;
    product_id: number;
    product?: Product;
    color: string;
    size: number;
    qr_code: string;

}