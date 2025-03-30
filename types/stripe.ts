export type StripeSuperProduct = {
    name: string,
    description: string,
    images: string[],
    price_id: string,
    price: number
    item_id: string,
    status: ProductStatus
}
export type ProductStatus = "availible" | "not-availible" | "preorder"