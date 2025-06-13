import stripe from 'stripe'
import 'dotenv/config'

// @ts-ignore
export const stripeAPI = new stripe(process.env.STRIPE_KEY)
// @ts-ignore

export async function getAllStripe(type) {
    if (type === "price") {
        return await recursiveItemGrab(stripeAPI.prices)
    }
    else {
        return await recursiveItemGrab(stripeAPI.products)
    }
}
// @ts-ignore

async function recursiveItemGrab(API) {
    let item = await API.list();
    const itemArray = [...item.data];
    let has_more = item.has_more;

    // Continue fetching items until there are no more pages
    while (has_more) {
        let moreItems = await API.list({
            starting_after: item.data[item.data.length - 1].id,
        });
        has_more = moreItems.has_more;
        itemArray.push(...moreItems.data);
    }

    if (API === stripeAPI.products) {
        return itemArray;
    } else {
        return itemArray; 
    }
}
// @ts-ignore

function isValidStatus(status) {
    return ["available", "not-available", "preorder"].includes(status);
}
// @ts-ignore

export async function getProduct(id) {
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
// @ts-ignore

            price: price.unit_amount / 100,
            item_id: product.id,
            status: status,
        }
    }
    catch (err) {
        return false
    }
}
export async function getProductList() {
    let products = await getAllStripe("product");
    let prices = await getAllStripe("price");
    let productList = [];
    for (let i = 0; i < products.length; i++) {
        const status = isValidStatus(products[i].metadata.status) ? products[i].metadata.status : undefined;
        if (!status || !products[i].active) {
            continue;
        }
        
        let displayStatus = "On Backorder";
        switch (status) {
            case "available":
                displayStatus = "Available - Ready to Ship";
                break;
            case "preorder":
                displayStatus = "Preorder";
                break;
            default:
                break;
        }

        productList.push({
            name: products[i].name,
            internalName: products[i].name.replaceAll(" ", "-").replaceAll("/", "").toLowerCase(), // Use this for filenames
            description: products[i].description ?? "",
            images: products[i].images,
            price_id: prices[i].id,
            price: prices[i].unit_amount / 100,
            item_id: products[i].id,
            status: status,
            displayStatus: displayStatus,
        });
    }
    return productList
}
