import stripe from 'stripe'
import 'dotenv/config'

import { StripeSuperProduct, ProductStatus } from './types/index';

export const stripeAPI = new stripe(process.env.STRIPE_KEY)

export async function getAllStripe(type: 'price' | 'product'): Promise<stripe.Product[] | stripe.Price[] | undefined > {
    if (type === "price") {
        return await recursiveItemGrab(stripeAPI.prices) as stripe.Price[]
    }
    else {
        return await recursiveItemGrab(stripeAPI.products) as stripe.Product[]
    }
}
async function recursiveItemGrab(API: stripe.ProductsResource | stripe.PricesResource): Promise<stripe.Product[] | stripe.Price[]> {
    let item = await API.list();
    const itemArray = [...item.data];
    let has_more = item.has_more;

    // Continue fetching items until there are no more pages
    while (has_more) {
        let moreItems = await API.list({
            starting_after: item.data[item.data.length - 1].id,
        } as stripe.RequestOptions); // Explicitly cast to RequestOptions
        has_more = moreItems.has_more;
        itemArray.push(...moreItems.data);
    }

    if (API === stripeAPI.products) {
        return itemArray as stripe.Product[];
    } else {
        return itemArray as stripe.Price[]; 
    }
}

function isValidStatus(status: any): status is ProductStatus {
    return ["available", "not-available", "preorder"].includes(status);
}
export async function getProduct(id: string): Promise<StripeSuperProduct | false> {
    try {
        if (id === "quantity") return false
        let product = await stripeAPI.products.retrieve(id);
        if (!product.default_price || typeof product.default_price !== "string") {
            console.error("Product does not have a price")
            return false;
        }
        const status = isValidStatus(product.metadata.status) ? product.metadata.status : undefined;
        if (!status) {
            console.error("Product does not have a proper status")
            return false;
        }
        let price = await stripeAPI.prices.retrieve(product.default_price)
        return {
            name: product.name,
            description: product.description,
            images: product.images,
            price_id: price.id,
            price: price.unit_amount / 100,
            item_id: product.id,
            status: status,
        }
    }
    catch (err) {
        return false
    }
}
export async function getProductList(): Promise<StripeSuperProduct[] | []> {
    let products = await getAllStripe("product") as stripe.Product[];
    let prices = await getAllStripe("price") as stripe.Price[];
    let productList = [];
    for (let i = 0; i < products.length; i++) {
        const status = isValidStatus(products[i].metadata.status) ? products[i].metadata.status : undefined;
        if (!status) {
            console.error("Product does not have a proper status")
            return [];
        }
        productList.push({
            name: products[i].name,
            description: products[i].description,
            images: products[i].images,
            price_id: prices[i].id,
            price: prices[i].unit_amount / 100,
            item_id: products[i].id,
            status: status as ProductStatus,
        });
    }
    return productList
}
