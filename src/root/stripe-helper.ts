import { Product } from "types/api";
import fees from "../fees.json" with { type: "json" };
export const shippingCost = fees.shippingCost || 15.00;
export function calculateTotalCost(cart: Record<string, number>, products: Record<string, Product>): number {
    let totalCost = 0;
    for (const [productId, quantity] of Object.entries(cart)) {
        const product = products[productId];
        if (product) {
            totalCost += product.price * quantity;
        }
    }
    return totalCost + shippingCost;
}
export function cartToDictionary(): Record<string, number> {
    const cart = sessionStorage.getItem("cart");
    if (!cart) return {};
    const parsedCart = JSON.parse(cart);
    if (!parsedCart || !parsedCart.products) return {};
    const products = parsedCart.products;
    const dictionary: Record<string, number> = {};
    for (const productId in products) {
        dictionary[productId] = products[productId].quantity;
    }
    return dictionary;
}
