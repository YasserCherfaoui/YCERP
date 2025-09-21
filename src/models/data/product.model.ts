
export interface Product {
    ID: number;
    CreatedAt: string;
    UpdatedAt: string;
    DeletedAt?: string;
    name: string;
    first_price: number;
    franchise_price: number;
    vip_franchise_price?: number;
    price: number;
    description: string;
    company_id: number;
    is_woo_picture: boolean;
    is_active: boolean;
    product_images: ProductImage[];
    product_variants: ProductVariant[];
    affiliate_props?: AffiliateProp[];
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

export interface AffiliateProp {
    ID: number;
    CreatedAt: string;
    UpdatedAt: string;
    DeletedAt?: string;
    product_id: number;
    product?: Product;
    images?: ProductImage[];
    product_link: string;
    shopify_link: string;
    name: string;
    creatives_link: string;
    commission: number;
}