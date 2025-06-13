export type ProductList = Product[]
export type Product = {
    name: string,
    internalName?: string, // Used for filenames
    displayStatus?: string, // Used for display purposes
    description: string,
    images: string[],
    price_id: string,
    price: number,
    item_id: string,
    status: ProductStatus
}

export type ProductStatus = "available" | "not-available" | "preorder"