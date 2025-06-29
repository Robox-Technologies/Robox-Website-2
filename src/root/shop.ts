import { addCartItem, getCart } from "./cart";

const orderValue = document.getElementById("order-value") as HTMLParagraphElement
const totalValue = document.getElementById("total-value") as HTMLParagraphElement
const shippingValue = document.getElementById("shipping-cost") as HTMLParagraphElement

// MARK: SHIPPING COST
const shippingCost = 10

export function renderCart() {
    let products = getCart().products;
    let cost = 0
    
    for (const productId in products) {
        let product = products[productId]["data"]
        if (!product) continue;
        let price = product.price
        let quantity = products[productId]["quantity"]

        if (quantity < 1) continue;

        cost += price*quantity
    }

    let shipping = cost <= 0 ? 0 : shippingCost;

    // Hide checkout button if cost is 0
    let checkoutButton = document.getElementById("checkout");
    if (checkoutButton) {
        if (cost <= 0) {
            checkoutButton.style.display = "none";
        } else {
            checkoutButton.style.display = "block";
        }
    }

    orderValue.textContent = `$${cost}`
    totalValue.textContent = `$${cost+shipping}`
    shippingValue.textContent = `$${shipping}`
}

async function getItemData() {
    let products = getCart().products;

    const promises = Object.keys(products).map((productId) =>
        fetch(`${window.location.origin}/api/store/products?id=${productId}`).then(async (response) => [productId, await response.json()])
    );

    const data = await Promise.all(promises);
    return Object.fromEntries(data)
}


renderCart();

getItemData().then(serverProducts => {
    let products = getCart().products;
    let reload = false
    for (const serverProductId in serverProducts) {
        let cartProduct = products[serverProductId];
        if (cartProduct && JSON.stringify(serverProducts[serverProductId]) !== JSON.stringify(cartProduct["data"])) {
            reload = true
            addCartItem(serverProductId, 0, serverProducts[serverProductId])
        }
    }
    if (reload) window.location.reload()
})