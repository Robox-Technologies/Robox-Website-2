import stripe, { Stripe } from 'stripe'
import { ProductStatus, Product } from 'types/api'
import 'dotenv/config'


export const stripeAPI = new stripe(process.env.STRIPE_KEY)
const displayStatusMap: { [K in ProductStatus]: string } = {
    "available": "Available for Purchase",
    "not-available": "Out of Stock",
    "preorder": "Pre-order Now",
};


export async function getAllStripe(type: "price"): Promise<Stripe.Price[]>;
export async function getAllStripe(type: "product"): Promise<Stripe.Product[]>;
export async function getAllStripe(type: "price" | "product"): Promise<Stripe.Price[] | Stripe.Product[]> {
    if (type === "price") {
        return await recursiveItemGrab(stripeAPI.prices)
    }
    else {
        return await recursiveItemGrab(stripeAPI.products)
    }
}

async function recursiveItemGrab(API: Stripe.ProductsResource): Promise<Stripe.Product[]>;
async function recursiveItemGrab(API: Stripe.PricesResource ): Promise<Stripe.Price[]>;
async function recursiveItemGrab(API: Stripe.PricesResource | Stripe.ProductsResource ): Promise<Stripe.Price[] | Stripe.Product[]> {
    
    let item: Stripe.ApiList<Stripe.Price> | Stripe.ApiList<Stripe.Product> = await API.list();
    const itemArray = [...item.data];
    let has_more = item.has_more;

    // Continue fetching items until there are no more pages
    while (has_more) {
        let moreItems: Stripe.ApiList<Stripe.Price> | Stripe.ApiList<Stripe.Product>;
        // Typescript is very dumb and does not recognise they both have starting_after,
        // trust me remove this if statement and it will not work
        if (API instanceof Stripe.PricesResource) {
            moreItems = await API.list({
                starting_after: item.data[item.data.length - 1].id,
            });
        }
        else {
            moreItems = await API.list({
                starting_after: item.data[item.data.length - 1].id,
            });
        }
           
        has_more = moreItems.has_more;
        itemArray.push(...moreItems.data);
        item = moreItems;
    }

    return itemArray as Stripe.Price[] | Stripe.Product[];;
}


function isValidStatus(status: ProductStatus | string): status is ProductStatus {
    if (typeof status !== "string") return false;
    // Check if the status is one of the valid statuses
    return ["available", "not-available", "preorder"].includes(status);
}


export async function getProduct(id: string): Promise<Product | false> {
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
        if (!price || !price.unit_amount) {
            console.error("Product does not have a valid price")
            return false;
        }
        return {
            name: product.name,
            description: product.description ?? "",
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

export async function getProductList(): Promise<Product[]> {
    let products = await getAllStripe("product");
    let prices = await getAllStripe("price");
    let productList: Product[] = [];
    for (let i = 0; i < products.length; i++) {
        const status = products[i].metadata.status ?? undefined;
        if (!isValidStatus(status)) {
            console.error(`Product ${products[i].id} does not have a valid status`);
            continue;
        }
        let displayStatus = displayStatusMap[status] ?? "Unknown Status";
        productList.push({
            name: products[i].name,
            internalName: products[i].name.replaceAll(" ", "-").replaceAll("/", "").toLowerCase(), // Use this for filenames
            description: products[i].description ?? "",
            images: products[i].images,
            price_id: prices[i].id,
            price: prices[i].unit_amount ?? 0 / 100,
            item_id: products[i].id,
            status: status,
            displayStatus: displayStatus,
        });
    }
    return productList
}
