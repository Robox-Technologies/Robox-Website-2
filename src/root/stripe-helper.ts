import { Product } from "types/api";
import fees from "../fees.json" with { type: "json" };
const shippingCost = fees.shippingCost || 15.00;
export function calculateTotalCost(cart: Record<string, number>, products: Record<string, Product>): number {
    let totalCost = 0;
    for (const [productId, quantity] of Object.entries(cart)) {
        const product = products[productId];
        if (product) {
            totalCost += product.price * quantity;
        }
    }
    return totalCost;
}