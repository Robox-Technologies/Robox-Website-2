export type ProductList = Product[]
export type Product = {
    type: string,
    name: string,
    description: string,
    images: string[],
    price_id: string,
    price: number,
    item_id: string[],
    status: "in-stock" | "out-of-stock" | "pre-order",
}
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